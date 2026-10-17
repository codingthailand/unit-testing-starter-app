import type { CouponService } from "@/lib/coupon/coupon-service"
import type { CourseRepository } from "@/lib/course/course-repository"
import type { EnrollmentRepository } from "@/lib/enrollment/enrollment-repository"
import type { PaymentGateway } from "@/lib/payment/payment-gateway"
import type { UnitOfWork } from "@/lib/repositories"
import type { Clock } from "@/lib/shared/clock"
import { appError } from "@/lib/shared/errors"
import { err, ok, type Result } from "@/lib/shared/result"
import { buildCheckoutQuote, type CheckoutQuote } from "./checkout-quote"
import type { OrderRepository } from "./order-repository"
import type { Order } from "./order-types"

/** order PENDING ที่เก่ากว่านี้ถือว่าค้าง (เช่น server ล่มกลางทาง) ไม่บล็อกการซื้อใหม่ */
export const PENDING_ORDER_TTL_MINUTES = 15

export type CheckoutServiceDeps = {
  uow: UnitOfWork
  courses: CourseRepository
  enrollments: EnrollmentRepository
  orders: OrderRepository
  couponService: CouponService
  paymentGateway: PaymentGateway
  clock: Clock
}

export type QuoteRequest = {
  /** null = ยังไม่ login (ตอน preview ในหน้าตะกร้า) */
  userId: string | null
  courseIds: readonly number[]
  couponCode?: string
}

export type CheckoutRequest = {
  userId: string
  courseIds: readonly number[]
  couponCode?: string
  cardNumber: string
}

export type CheckoutSuccess = {
  orderId: number
  totalSatang: number
}

export function createCheckoutService(deps: CheckoutServiceDeps) {
  const { uow, courses, enrollments, orders, couponService, paymentGateway, clock } = deps

  /** โหลดข้อมูลที่ต้องใช้ แล้วให้ pure function buildCheckoutQuote ตัดสิน */
  async function quote({ userId, courseIds, couponCode }: QuoteRequest): Promise<Result<CheckoutQuote>> {
    const ids = [...new Set(courseIds)]
    const [found, enrolledCourseIds, coupon] = await Promise.all([
      ids.length > 0 ? courses.findForSale(ids) : Promise.resolve([]),
      userId && ids.length > 0 ? enrollments.findActiveCourseIds(userId, ids) : Promise.resolve([]),
      couponCode?.trim() ? couponService.findUsableCoupon(couponCode) : Promise.resolve(undefined),
    ])
    return buildCheckoutQuote({ requestedCourseIds: ids, courses: found, enrolledCourseIds, coupon })
  }

  return {
    quote,

    /**
     * ขั้นตอน:
     * 1. quote (pure) — ราคาจาก DB, คูปอง, กฎพื้นฐาน
     * 2. จอง: ใน transaction ตรวจ enrollment ซ้ำอีกรอบ + ห้ามมี order PENDING ของคอร์สเดียวกัน แล้วสร้าง Order PENDING
     * 3. charge (นอก transaction) แล้วบันทึก paymentRef ทันที — ยอด 0 บาทข้ามขั้นนี้
     * 4. ใน transaction: PAID + Enrollment — ถ้าพัง ชดเชยด้วยการคืนเงินผ่าน gateway แล้วตั้ง FAILED
     */
    async checkout(request: CheckoutRequest): Promise<Result<CheckoutSuccess>> {
      const quoted = await quote(request)
      if (!quoted.ok) return quoted
      const q = quoted.value
      const courseIds = q.items.map((item) => item.courseId)
      const now = clock()

      const reserved = await uow.run(async (repos): Promise<Result<Order>> => {
        if ((await repos.enrollments.findActiveCourseIds(request.userId, courseIds)).length > 0) {
          return err(appError("ALREADY_ENROLLED"))
        }
        const since = new Date(now.getTime() - PENDING_ORDER_TTL_MINUTES * 60_000)
        if (await repos.orders.hasPendingItems(request.userId, courseIds, since)) {
          return err(appError("CHECKOUT_IN_PROGRESS"))
        }
        return ok(
          await repos.orders.createPending({
            userId: request.userId,
            couponId: q.coupon?.id ?? null,
            subtotalSatang: q.subtotalSatang,
            discountSatang: q.discountSatang,
            totalSatang: q.totalSatang,
            createdAt: now,
            items: q.items.map(({ courseId, priceSatang, discountSatang, paidSatang }) => ({
              courseId,
              priceSatang,
              discountSatang,
              paidSatang,
            })),
          })
        )
      })
      if (!reserved.ok) return reserved
      const order = reserved.value

      let paymentRef: string | null = null
      if (q.totalSatang > 0) {
        try {
          const charge = await paymentGateway.charge({
            amountSatang: q.totalSatang,
            cardNumber: request.cardNumber,
            description: `Order #${order.id}`,
          })
          if (charge.status === "declined") {
            await orders.markFailed(order.id)
            return err(appError("PAYMENT_DECLINED"))
          }
          paymentRef = charge.reference
        } catch {
          await orders.markFailed(order.id)
          return err(appError("PAYMENT_ERROR"))
        }
      }

      try {
        if (paymentRef) await orders.recordPaymentRef(order.id, paymentRef)
        const paidAt = clock()
        await uow.run(async (repos) => {
          await repos.orders.markPaid(order.id, { paymentRef, paidAt })
          for (const item of order.items) {
            await repos.enrollments.activate({
              userId: request.userId,
              courseId: item.courseId,
              orderItemId: item.id,
              enrolledAt: paidAt,
            })
          }
        })
      } catch {
        await compensate(order.id, paymentRef, q.totalSatang)
        return err(appError("PAYMENT_ERROR"))
      }

      return ok({ orderId: order.id, totalSatang: q.totalSatang })
    },
  }

  /**
   * ชดเชยเมื่อตัดเงินแล้วแต่บันทึกไม่สำเร็จ: คืนเงินผ่าน gateway แล้วตั้ง FAILED
   * ถ้าคืนเงินไม่สำเร็จ ปล่อย order เป็น PENDING พร้อม paymentRef ไว้ให้ตรวจสอบด้วยมือ
   */
  async function compensate(orderId: number, paymentRef: string | null, amountSatang: number) {
    try {
      if (paymentRef) await paymentGateway.refund({ reference: paymentRef, amountSatang })
      await orders.markFailed(orderId)
    } catch {
      // ไม่ throw ต่อ — ผู้ใช้ได้รับ PAYMENT_ERROR และ order ยังมี paymentRef ให้ตามเงินได้
    }
  }
}

export type CheckoutService = ReturnType<typeof createCheckoutService>
