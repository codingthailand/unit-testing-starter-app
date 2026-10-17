import type { CourseRepository } from "@/lib/course/course-repository"
import type { ProgressRepository } from "@/lib/learning/progress-repository"
import { calculateProgressPercent } from "@/lib/learning/progress"
import { canRefund } from "@/lib/refund/refund-policy"
import type { Clock } from "@/lib/shared/clock"
import type { Result } from "@/lib/shared/result"
import type { OrderRepository } from "./order-repository"
import type { Order, OrderItem } from "./order-types"

export type OrderServiceDeps = {
  orders: OrderRepository
  courses: CourseRepository
  progress: ProgressRepository
  clock: Clock
}

export type OrderItemView = OrderItem & {
  progressPercent: number
  refund: Result<true>
}

export type OrderView = Omit<Order, "items"> & { items: OrderItemView[] }

export function createOrderService({ orders, courses, progress, clock }: OrderServiceDeps) {
  /** เติมข้อมูลคืนเงินให้ทุก order — ดึงจำนวนบทเรียน/ความคืบหน้าครั้งเดียวสำหรับทุกคอร์ส (ไม่ N+1) */
  async function withRefundInfo(list: Order[], userId: string): Promise<OrderView[]> {
    const courseIds = [...new Set(list.flatMap((order) => order.items.map((item) => item.courseId)))]
    if (courseIds.length === 0) return list.map((order) => ({ ...order, items: [] }))

    const [totals, completed] = await Promise.all([
      courses.countLessonsByCourse(courseIds),
      progress.completedCountByCourse(userId, courseIds),
    ])
    const now = clock()
    return list.map((order) => ({
      ...order,
      items: order.items.map((item) => {
        const progressPercent = calculateProgressPercent(
          completed.get(item.courseId) ?? 0,
          totals.get(item.courseId) ?? 0
        )
        return {
          ...item,
          progressPercent,
          refund: canRefund({ itemStatus: item.status, paidAt: order.paidAt, progressPercent }, now),
        }
      }),
    }))
  }

  return {
    async listOrders(userId: string): Promise<OrderView[]> {
      return withRefundInfo(await orders.listForUser(userId), userId)
    },

    async getOrder(orderId: number, userId: string): Promise<OrderView | null> {
      const order = await orders.findForUser(orderId, userId)
      return order ? (await withRefundInfo([order], userId))[0] : null
    },
  }
}

export type OrderService = ReturnType<typeof createOrderService>
