import type { DbClient } from "@/lib/shared/db"
import {
  isOneOf,
  ORDER_ITEM_STATUSES,
  ORDER_STATUSES,
  type OrderItemStatus,
  type OrderStatus,
} from "@/lib/shared/status"
import type { NewOrderInput, Order, OrderItem, OrderItemForRefund } from "./order-types"

export interface OrderRepository {
  createPending(input: NewOrderInput): Promise<Order>
  /** order + ทุก item → PAID */
  markPaid(orderId: number, input: { paymentRef: string | null; paidAt: Date }): Promise<void>
  markFailed(orderId: number): Promise<void>
  findForUser(orderId: number, userId: string): Promise<Order | null>
  listForUser(userId: string): Promise<Order[]>
  /** มี order PENDING ที่สร้างหลัง `since` ซึ่งมีคอร์สเหล่านี้อยู่หรือไม่ (กัน checkout ซ้อนกัน) */
  hasPendingItems(userId: string, courseIds: readonly number[], since: Date): Promise<boolean>
  /** บันทึก reference ทันทีหลังตัดบัตรสำเร็จ — ถ้าขั้นต่อไปพังจะยังตามเงินได้ */
  recordPaymentRef(orderId: number, paymentRef: string): Promise<void>
  findItemForUser(itemId: number, userId: string): Promise<OrderItemForRefund | null>
  /**
   * PAID → REFUNDED แบบมีเงื่อนไขในคำสั่งเขียน (atomic)
   * คืน false ถ้า item ไม่ได้อยู่ในสถานะ PAID แล้ว (เช่น มีคำขอคืนเงินอีกรายการทำไปก่อน)
   */
  markItemRefunded(itemId: number, refundedAt: Date): Promise<boolean>
}

const itemInclude = {
  course: { select: { slug: true, title: true } },
} as const

type ItemRow = {
  id: number
  courseId: number
  priceSatang: number
  discountSatang: number
  paidSatang: number
  status: string
  refundedAt: Date | null
  course: { slug: string; title: string }
}

type OrderRow = {
  id: number
  userId: string
  status: string
  subtotalSatang: number
  discountSatang: number
  totalSatang: number
  paymentRef: string | null
  paidAt: Date | null
  createdAt: Date
  coupon: { code: string } | null
  items: ItemRow[]
}

function toOrderItemStatus(value: string): OrderItemStatus {
  return isOneOf(ORDER_ITEM_STATUSES, value) ? value : "PENDING"
}

function toOrderStatus(value: string): OrderStatus {
  return isOneOf(ORDER_STATUSES, value) ? value : "PENDING"
}

/** pure mapper */
export function toOrderItem(row: ItemRow): OrderItem {
  return {
    id: row.id,
    courseId: row.courseId,
    courseSlug: row.course.slug,
    courseTitle: row.course.title,
    priceSatang: row.priceSatang,
    discountSatang: row.discountSatang,
    paidSatang: row.paidSatang,
    status: toOrderItemStatus(row.status),
    refundedAt: row.refundedAt,
  }
}

/** pure mapper */
export function toOrder(row: OrderRow): Order {
  return {
    id: row.id,
    userId: row.userId,
    status: toOrderStatus(row.status),
    subtotalSatang: row.subtotalSatang,
    discountSatang: row.discountSatang,
    totalSatang: row.totalSatang,
    couponCode: row.coupon?.code ?? null,
    paymentRef: row.paymentRef,
    paidAt: row.paidAt,
    createdAt: row.createdAt,
    items: row.items.map(toOrderItem),
  }
}

const orderInclude = {
  coupon: { select: { code: true } },
  items: { include: itemInclude, orderBy: { id: "asc" } },
} as const

export function createPrismaOrderRepository(db: DbClient): OrderRepository {
  return {
    async createPending(input) {
      const row = await db.order.create({
        data: {
          userId: input.userId,
          couponId: input.couponId,
          status: "PENDING",
          subtotalSatang: input.subtotalSatang,
          discountSatang: input.discountSatang,
          totalSatang: input.totalSatang,
          createdAt: input.createdAt,
          items: {
            create: input.items.map((item) => ({ ...item, status: "PENDING" })),
          },
        },
        include: orderInclude,
      })
      return toOrder(row)
    },

    async markPaid(orderId, { paymentRef, paidAt }) {
      await db.order.update({
        where: { id: orderId },
        data: { status: "PAID", paymentRef, paidAt },
      })
      await db.orderItem.updateMany({ where: { orderId }, data: { status: "PAID" } })
    },

    async markFailed(orderId) {
      await db.order.update({ where: { id: orderId }, data: { status: "FAILED" } })
    },

    async findForUser(orderId, userId) {
      const row = await db.order.findFirst({
        where: { id: orderId, userId },
        include: orderInclude,
      })
      return row ? toOrder(row) : null
    },

    async listForUser(userId) {
      const rows = await db.order.findMany({
        where: { userId },
        include: orderInclude,
        orderBy: { createdAt: "desc" },
      })
      return rows.map(toOrder)
    },

    async hasPendingItems(userId, courseIds, since) {
      const count = await db.orderItem.count({
        where: {
          courseId: { in: [...courseIds] },
          order: { userId, status: "PENDING", createdAt: { gte: since } },
        },
      })
      return count > 0
    },

    async recordPaymentRef(orderId, paymentRef) {
      await db.order.update({ where: { id: orderId }, data: { paymentRef } })
    },

    async findItemForUser(itemId, userId) {
      const row = await db.orderItem.findFirst({
        where: { id: itemId, order: { userId } },
        include: {
          ...itemInclude,
          order: { select: { id: true, userId: true, paidAt: true, paymentRef: true } },
        },
      })
      if (!row) return null
      return {
        ...toOrderItem(row),
        orderId: row.order.id,
        userId: row.order.userId,
        paidAt: row.order.paidAt,
        paymentRef: row.order.paymentRef,
      }
    },

    async markItemRefunded(itemId, refundedAt) {
      const { count } = await db.orderItem.updateMany({
        where: { id: itemId, status: "PAID" },
        data: { status: "REFUNDED", refundedAt },
      })
      return count === 1
    },
  }
}
