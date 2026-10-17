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
  async function withRefundInfo(order: Order, userId: string): Promise<OrderView> {
    const now = clock()
    const items = await Promise.all(
      order.items.map(async (item) => {
        const [total, completed] = await Promise.all([
          courses.countLessons(item.courseId),
          progress.completedLessonIds(userId, item.courseId),
        ])
        const progressPercent = calculateProgressPercent(completed.length, total)
        return {
          ...item,
          progressPercent,
          refund: canRefund({ itemStatus: item.status, paidAt: order.paidAt, progressPercent }, now),
        }
      })
    )
    return { ...order, items }
  }

  return {
    async listOrders(userId: string): Promise<OrderView[]> {
      const list = await orders.listForUser(userId)
      return Promise.all(list.map((order) => withRefundInfo(order, userId)))
    },

    async getOrder(orderId: number, userId: string): Promise<OrderView | null> {
      const order = await orders.findForUser(orderId, userId)
      return order ? withRefundInfo(order, userId) : null
    },
  }
}

export type OrderService = ReturnType<typeof createOrderService>
