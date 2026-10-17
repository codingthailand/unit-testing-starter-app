/**
 * รหัส error ทางธุรกิจทั้งหมดของระบบ + ข้อความภาษาไทยที่แสดงให้ผู้ใช้เห็น
 * เทสต์ควร assert ที่ code ส่วนข้อความแก้ไขได้ที่นี่ที่เดียว
 */
export const ERROR_MESSAGES = {
  // auth
  UNAUTHENTICATED: "กรุณาเข้าสู่ระบบก่อน",
  FORBIDDEN: "คุณไม่มีสิทธิ์เข้าถึงส่วนนี้",

  // coupon
  COUPON_REQUIRED: "กรุณากรอกโค้ดคูปอง",
  COUPON_NOT_FOUND: "ไม่พบคูปองนี้",
  COUPON_INACTIVE: "คูปองนี้ใช้งานไม่ได้แล้ว",
  COUPON_CODE_TAKEN: "โค้ดนี้ถูกใช้แล้ว",

  // checkout
  CART_EMPTY: "ตะกร้าว่าง",
  COURSE_NOT_AVAILABLE: "มีคอร์สที่ไม่เปิดขาย",
  ALREADY_ENROLLED: "คุณลงทะเบียนคอร์สนี้แล้ว",
  PAYMENT_DECLINED: "บัตรถูกปฏิเสธ กรุณาใช้บัตรอื่น",
  PAYMENT_ERROR: "ชำระเงินไม่สำเร็จ กรุณาลองใหม่",

  // learning
  LESSON_NOT_FOUND: "ไม่พบบทเรียนนี้",
  NOT_ENROLLED: "คุณยังไม่ได้ลงทะเบียนคอร์สนี้",

  // refund
  ORDER_ITEM_NOT_FOUND: "ไม่พบรายการนี้",
  REFUND_ALREADY_REFUNDED: "รายการนี้คืนเงินไปแล้ว",
  REFUND_NOT_PAID: "รายการนี้ยังไม่ได้ชำระเงิน",
  REFUND_WINDOW_EXPIRED: "เกินระยะเวลาขอคืนเงิน 7 วัน",
  REFUND_PROGRESS_EXCEEDED: "เรียนเกิน 20% แล้ว ไม่สามารถคืนเงินได้",

  // review
  REVIEW_NOT_ENROLLED: "ต้องลงทะเบียนคอร์สก่อนจึงรีวิวได้",

  // admin
  COURSE_NOT_FOUND: "ไม่พบคอร์สนี้",
  COURSE_SLUG_TAKEN: "slug นี้ถูกใช้แล้ว",
  COURSE_HAS_SALES: "คอร์สนี้มียอดขายแล้ว ลบไม่ได้ ให้ยกเลิกการเผยแพร่แทน",
  LESSON_POSITION_TAKEN: "ลำดับบทเรียนนี้ถูกใช้แล้ว",

  // ทั่วไป
  VALIDATION_FAILED: "ข้อมูลไม่ถูกต้อง",
} as const

export type ErrorCode = keyof typeof ERROR_MESSAGES

export type AppError = {
  code: ErrorCode
  message: string
  fieldErrors?: Record<string, string[]>
}

export function appError(
  code: ErrorCode,
  fieldErrors?: Record<string, string[]>
): AppError {
  return fieldErrors
    ? { code, message: ERROR_MESSAGES[code], fieldErrors }
    : { code, message: ERROR_MESSAGES[code] }
}
