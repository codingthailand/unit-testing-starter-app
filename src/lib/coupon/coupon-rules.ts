import { appError } from "@/lib/shared/errors"
import { err, ok, type Result } from "@/lib/shared/result"
import type { Coupon } from "./coupon-types"

/** "  welcome20 " → "WELCOME20" (pure) */
export function normalizeCouponCode(raw: string): string {
  return raw.trim().toUpperCase()
}

/**
 * ตรวจว่าคูปองที่ค้นเจอ (หรือไม่เจอ) ใช้ได้หรือไม่ (pure)
 * แยกออกจากการค้น DB เพื่อให้เทสต์ทุกกรณีได้โดยไม่ต้องมีฐานข้อมูล
 */
export function checkCouponUsable(coupon: Coupon | null): Result<Coupon> {
  if (!coupon) return err(appError("COUPON_NOT_FOUND"))
  if (!coupon.isActive) return err(appError("COUPON_INACTIVE"))
  return ok(coupon)
}

/**
 * คำนวณส่วนลด (สตางค์) จากยอดรวม (pure)
 *
 * - PERCENT: floor(subtotal × value / 100) แล้วไม่เกิน maxDiscountSatang (ถ้ามี)
 * - FIXED:   value
 * - ทุกแบบ:  ไม่ติดลบ และไม่เกิน subtotal (ยอดสุทธิต่ำสุด 0)
 */
export function calculateDiscount(
  coupon: Pick<Coupon, "type" | "value" | "maxDiscountSatang">,
  subtotalSatang: number
): number {
  if (subtotalSatang <= 0) return 0

  let discount =
    coupon.type === "PERCENT"
      ? Math.floor((subtotalSatang * coupon.value) / 100)
      : coupon.value

  if (coupon.type === "PERCENT" && coupon.maxDiscountSatang !== null) {
    discount = Math.min(discount, coupon.maxDiscountSatang)
  }

  return Math.max(0, Math.min(discount, subtotalSatang))
}
