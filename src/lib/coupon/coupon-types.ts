import type { CouponType } from "@/lib/shared/status"

export type Coupon = {
  id: number
  code: string
  type: CouponType
  /** PERCENT: 1–100, FIXED: สตางค์ */
  value: number
  /** เพดานส่วนลด (สตางค์) ใช้กับ PERCENT เท่านั้น null = ไม่มีเพดาน */
  maxDiscountSatang: number | null
  isActive: boolean
}

export type CouponInput = Omit<Coupon, "id">

export type CouponListItem = Coupon & {
  usedCount: number
  createdAt: Date
}
