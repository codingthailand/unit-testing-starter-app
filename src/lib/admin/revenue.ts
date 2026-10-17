import { BUSINESS_TIME_ZONE, DAY_MS, toDateKey } from "@/lib/shared/clock"
import type { OrderItemStatus } from "@/lib/shared/status"
import { periodDays, type Period } from "./period"

export type RevenueItem = {
  paidAt: Date
  paidSatang: number
  status: OrderItemStatus
}

export type RevenuePoint = {
  /** "YYYY-MM-DD" ตาม timezone ทางธุรกิจ */
  date: string
  totalSatang: number
}

/** คีย์วันที่ย้อนหลัง n วันจนถึงวันนี้ (รวมวันนี้) เรียงจากเก่าไปใหม่ (pure) */
export function lastDateKeys(days: number, now: Date, timeZone: string = BUSINESS_TIME_ZONE): string[] {
  const [y, m, d] = toDateKey(now, timeZone).split("-").map(Number)
  const todayUtc = Date.UTC(y, m - 1, d)
  return Array.from({ length: days }, (_, i) =>
    new Date(todayUtc - (days - 1 - i) * DAY_MS).toISOString().slice(0, 10)
  )
}

/**
 * รวมรายได้รายวัน (pure)
 * - นับเฉพาะ item ที่สถานะ PAID (REFUNDED/PENDING ไม่นับ)
 * - จัดกลุ่มตามวันที่ใน timeZone, วันที่ไม่มียอดได้ 0
 * - ได้ periodDays(period) จุดเสมอ รวมวันนี้
 */
export function groupRevenueByDay(
  items: readonly RevenueItem[],
  period: Period,
  now: Date,
  timeZone: string = BUSINESS_TIME_ZONE
): RevenuePoint[] {
  const totals = new Map(lastDateKeys(periodDays(period), now, timeZone).map((key) => [key, 0]))

  for (const item of items) {
    if (item.status !== "PAID") continue
    const key = toDateKey(item.paidAt, timeZone)
    const current = totals.get(key)
    if (current !== undefined) totals.set(key, current + item.paidSatang)
  }

  return [...totals].map(([date, totalSatang]) => ({ date, totalSatang }))
}

export function sumRevenue(points: readonly RevenuePoint[]): number {
  return points.reduce((sum, point) => sum + point.totalSatang, 0)
}
