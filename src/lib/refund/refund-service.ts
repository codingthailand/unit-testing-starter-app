import type { OrderRepository } from "@/lib/checkout/order-repository"
import type { CourseRepository } from "@/lib/course/course-repository"
import type { ProgressRepository } from "@/lib/learning/progress-repository"
import { calculateProgressPercent } from "@/lib/learning/progress"
import type { PaymentGateway } from "@/lib/payment/payment-gateway"
import type { UnitOfWork } from "@/lib/repositories"
import type { Clock } from "@/lib/shared/clock"
import { appError } from "@/lib/shared/errors"
import { err, ok, type Result } from "@/lib/shared/result"
import { canRefund } from "./refund-policy"

export type RefundServiceDeps = {
  uow: UnitOfWork
  orders: OrderRepository
  courses: CourseRepository
  progress: ProgressRepository
  paymentGateway: PaymentGateway
  clock: Clock
}

export type RefundSuccess = {
  orderItemId: number
  refundedSatang: number
}

export function createRefundService({ uow, orders, courses, progress, paymentGateway, clock }: RefundServiceDeps) {
  return {
    /**
     * คืนเงินรายคอร์ส: item → REFUNDED, enrollment → REVOKED, ลบรีวิวของคอร์สนั้น, คืนเงินผ่าน gateway
     * - item ของผู้ใช้อื่นตอบว่า "ไม่พบ" (ไม่บอกว่ามีอยู่)
     * - กันคำขอซ้อน: เปลี่ยนสถานะแบบมีเงื่อนไข PAID → REFUNDED ใน transaction ใครมาทีหลังได้ REFUND_ALREADY_REFUNDED
     * - เรียก gateway ใน transaction: ถ้าคืนเงินไม่สำเร็จ ทุกอย่าง rollback
     */
    async refundOrderItem(input: { userId: string; orderItemId: number }): Promise<Result<RefundSuccess>> {
      const item = await orders.findItemForUser(input.orderItemId, input.userId)
      if (!item) return err(appError("ORDER_ITEM_NOT_FOUND"))

      const [total, completed] = await Promise.all([
        courses.countLessons(item.courseId),
        progress.completedLessonIds(input.userId, item.courseId),
      ])
      const now = clock()
      const allowed = canRefund(
        {
          itemStatus: item.status,
          paidAt: item.paidAt,
          progressPercent: calculateProgressPercent(completed.length, total),
        },
        now
      )
      if (!allowed.ok) return allowed

      try {
        return await uow.run(async (repos): Promise<Result<RefundSuccess>> => {
          if (!(await repos.orders.markItemRefunded(item.id, now))) {
            return err(appError("REFUND_ALREADY_REFUNDED"))
          }
          const revoked = await repos.enrollments.revokeForOrderItem(input.userId, item.courseId, item.id)
          if (revoked) await repos.reviews.delete(input.userId, item.courseId)
          if (item.paidSatang > 0 && item.paymentRef) {
            await paymentGateway.refund({ reference: item.paymentRef, amountSatang: item.paidSatang })
          }
          return ok({ orderItemId: item.id, refundedSatang: item.paidSatang })
        })
      } catch {
        return err(appError("REFUND_FAILED"))
      }
    },
  }
}

export type RefundService = ReturnType<typeof createRefundService>
