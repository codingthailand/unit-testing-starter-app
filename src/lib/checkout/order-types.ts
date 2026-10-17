import type { OrderItemStatus, OrderStatus } from "@/lib/shared/status"

export type OrderItem = {
  id: number
  courseId: number
  courseSlug: string
  courseTitle: string
  priceSatang: number
  discountSatang: number
  paidSatang: number
  status: OrderItemStatus
  refundedAt: Date | null
}

export type Order = {
  id: number
  userId: string
  status: OrderStatus
  subtotalSatang: number
  discountSatang: number
  totalSatang: number
  couponCode: string | null
  paymentRef: string | null
  paidAt: Date | null
  createdAt: Date
  items: OrderItem[]
}

/** item พร้อมข้อมูล order ที่ต้องใช้ตัดสินเรื่องคืนเงิน */
export type OrderItemForRefund = OrderItem & {
  orderId: number
  userId: string
  paidAt: Date | null
  paymentRef: string | null
}

export type NewOrderInput = {
  userId: string
  couponId: number | null
  subtotalSatang: number
  discountSatang: number
  totalSatang: number
  createdAt: Date
  items: {
    courseId: number
    priceSatang: number
    discountSatang: number
    paidSatang: number
  }[]
}
