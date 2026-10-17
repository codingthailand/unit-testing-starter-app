import type { OrderRepository } from "@/lib/checkout/order-repository"
import type { CourseRepository } from "@/lib/course/course-repository"
import type { ProgressRepository } from "@/lib/learning/progress-repository"
import { calculateProgressPercent } from "@/lib/learning/progress"
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
  clock: Clock
}

export type RefundSuccess = {
  orderItemId: number
  refundedSatang: number
}

export function createRefundService({ uow, orders, courses, progress, clock }: RefundServiceDeps) {
  return {
    /**
     * คืนเงินรายคอร์ส: item → REFUNDED, enrollment → REVOKED, ลบรีวิวของคอร์สนั้น
     * item ของผู้ใช้อื่นตอบว่า "ไม่พบ" (ไม่บอกว่ามีอยู่)
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

      await uow.run(async (repos) => {
        await repos.orders.markItemRefunded(item.id, now)
        await repos.enrollments.revoke(input.userId, item.courseId)
        await repos.reviews.delete(input.userId, item.courseId)
      })

      return ok({ orderItemId: item.id, refundedSatang: item.paidSatang })
    },
  }
}

export type RefundService = ReturnType<typeof createRefundService>
