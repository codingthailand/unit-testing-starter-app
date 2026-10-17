/** ค่าที่อนุญาตของคอลัมน์สถานะ (SQLite ไม่มี enum จึงเก็บเป็น String) */

export const COURSE_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const
export type CourseLevel = (typeof COURSE_LEVELS)[number]

export const COURSE_LEVEL_LABELS: Record<CourseLevel, string> = {
  BEGINNER: "เริ่มต้น",
  INTERMEDIATE: "กลาง",
  ADVANCED: "สูง",
}

export const COUPON_TYPES = ["PERCENT", "FIXED"] as const
export type CouponType = (typeof COUPON_TYPES)[number]

export const ORDER_STATUSES = ["PENDING", "PAID", "FAILED"] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const ORDER_ITEM_STATUSES = ["PENDING", "PAID", "REFUNDED"] as const
export type OrderItemStatus = (typeof ORDER_ITEM_STATUSES)[number]

export const ENROLLMENT_STATUSES = ["ACTIVE", "REVOKED"] as const
export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number]

export const USER_ROLES = ["user", "admin"] as const
export type UserRole = (typeof USER_ROLES)[number]

export function isOneOf<T extends string>(
  values: readonly T[],
  value: unknown
): value is T {
  return typeof value === "string" && (values as readonly string[]).includes(value)
}
