import { DAY_MS } from "@/lib/shared/clock"
import { appError } from "@/lib/shared/errors"
import { err, ok, type Result } from "@/lib/shared/result"
import type { OrderItemStatus } from "@/lib/shared/status"

export const REFUND_WINDOW_DAYS = 7
export const REFUND_MAX_PROGRESS_PERCENT = 20

export type RefundCheckInput = {
  itemStatus: OrderItemStatus
  paidAt: Date | null
  /** % ที่เรียนไปแล้ว (จำนวนเต็ม จาก calculateProgressPercent) */
  progressPercent: number
}

/**
 * นโยบายคืนเงินรายคอร์ส (pure) — ตรวจตามลำดับ: สถานะ → ระยะเวลา → ความคืบหน้า
 *
 * - คืนได้เมื่อ now − paidAt ≤ 7 × 24 ชม. (นับรวมขอบ)
 * - คืนได้เมื่อ progress ≤ 20
 */
export function canRefund(input: RefundCheckInput, now: Date): Result<true> {
  if (input.itemStatus === "REFUNDED") return err(appError("REFUND_ALREADY_REFUNDED"))
  if (input.itemStatus !== "PAID" || input.paidAt === null) {
    return err(appError("REFUND_NOT_PAID"))
  }

  const elapsed = now.getTime() - input.paidAt.getTime()
  if (elapsed > REFUND_WINDOW_DAYS * DAY_MS) return err(appError("REFUND_WINDOW_EXPIRED"))

  if (input.progressPercent > REFUND_MAX_PROGRESS_PERCENT) {
    return err(appError("REFUND_PROGRESS_EXCEEDED"))
  }

  return ok(true)
}

/** วันสุดท้ายที่ขอคืนเงินได้ (ใช้แสดงผล) */
export function refundDeadline(paidAt: Date): Date {
  return new Date(paidAt.getTime() + REFUND_WINDOW_DAYS * DAY_MS)
}
