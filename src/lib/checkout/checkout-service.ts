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
     * ขั้นตอน: quote → สร้าง Order PENDING → charge (นอก transaction) → PAID + Enrollment หรือ FAILED
     * ยอดสุทธิ 0 บาทไม่เรียก gateway
     */
    async checkout(request: CheckoutRequest): Promise<Result<CheckoutSuccess>> {
      const quoted = await quote(request)
      if (!quoted.ok) return quoted
      const q = quoted.value

      const order = await orders.createPending({
        userId: request.userId,
        couponId: q.coupon?.id ?? null,
        subtotalSatang: q.subtotalSatang,
        discountSatang: q.discountSatang,
        totalSatang: q.totalSatang,
        createdAt: clock(),
        items: q.items.map(({ courseId, priceSatang, discountSatang, paidSatang }) => ({
          courseId,
          priceSatang,
          discountSatang,
          paidSatang,
        })),
      })

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

      return ok({ orderId: order.id, totalSatang: q.totalSatang })
    },
  }
}

export type CheckoutService = ReturnType<typeof createCheckoutService>
