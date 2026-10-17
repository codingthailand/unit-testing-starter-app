import type { OrderStatus } from "@/lib/shared/status"

export type AdminOrderRow = {
  id: number
  createdAt: Date
  customerName: string
  customerEmail: string
  status: OrderStatus
  itemCount: number
  totalSatang: number
}
