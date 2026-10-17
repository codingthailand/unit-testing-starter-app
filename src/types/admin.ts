import type { AdminOrderRow } from "@/lib/admin/admin-types"
import type { Period } from "@/lib/admin/period"
import type { RevenuePoint } from "@/lib/admin/revenue"
import type { DashboardStats } from "@/lib/admin/stats"

/** GET /api/admin/stats */
export type StatsResponse = DashboardStats

/** GET /api/admin/revenue?period=30d */
export type RevenueResponse = {
  period: Period
  points: RevenuePoint[]
  totalSatang: number
}

export type RecentOrder = Omit<AdminOrderRow, "createdAt"> & {
  /** ISO string — ฝั่ง Client เป็นคนจัดรูปแบบตาม locale */
  createdAt: string
}

/** GET /api/admin/orders?limit=5 */
export type OrdersResponse = {
  orders: RecentOrder[]
}

/** รูปแบบ error ที่ทุก Route Handler ใช้ร่วมกัน */
export type ApiErrorResponse = {
  error: string
  code: string
  fieldErrors?: Record<string, string[]>
}
