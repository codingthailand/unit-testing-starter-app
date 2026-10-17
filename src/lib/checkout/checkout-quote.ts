import { calculateDiscount } from "@/lib/coupon/coupon-rules"
import type { Coupon } from "@/lib/coupon/coupon-types"
import type { CourseForSale } from "@/lib/course/course-types"
import { appError } from "@/lib/shared/errors"
import { err, ok, type Result } from "@/lib/shared/result"
import { allocateDiscount } from "./allocate-discount"

export type QuoteItem = {
  courseId: number
  title: string
  priceSatang: number
  discountSatang: number
  paidSatang: number
}

export type CheckoutQuote = {
  items: QuoteItem[]
  coupon: Coupon | null
  subtotalSatang: number
  discountSatang: number
  totalSatang: number
}

export type QuoteInput = {
  /** courseId ที่ผู้ใช้ขอซื้อ (อาจซ้ำ — จะถูกตัดซ้ำให้) */
  requestedCourseIds: readonly number[]
  /** คอร์สที่ค้นเจอใน DB (ราคาจาก DB เท่านั้น ไม่เชื่อราคาจาก client) */
  courses: readonly CourseForSale[]
  /** คอร์สที่ผู้ใช้ลงทะเบียน ACTIVE อยู่แล้ว */
  enrolledCourseIds: readonly number[]
  /** ผลการตรวจคูปอง — undefined = ไม่ได้ใช้คูปอง */
  coupon?: Result<Coupon>
}

/**
 * คำนวณใบเสนอราคาก่อนชำระเงิน (pure) ตรวจตามลำดับ:
 * ตะกร้าว่าง → คอร์สไม่เปิดขาย → ลงทะเบียนแล้ว → คูปองไม่ถูกต้อง
 */
export function buildCheckoutQuote(input: QuoteInput): Result<CheckoutQuote> {
  const ids = [...new Set(input.requestedCourseIds)]
  if (ids.length === 0) return err(appError("CART_EMPTY"))

  const byId = new Map(input.courses.map((course) => [course.id, course]))
  const courses: CourseForSale[] = []
  for (const id of ids) {
    const course = byId.get(id)
    if (!course || !course.isPublished) return err(appError("COURSE_NOT_AVAILABLE"))
    courses.push(course)
  }

  const enrolled = new Set(input.enrolledCourseIds)
  if (courses.some((course) => enrolled.has(course.id))) {
    return err(appError("ALREADY_ENROLLED"))
  }

  let coupon: Coupon | null = null
  if (input.coupon) {
    if (!input.coupon.ok) return input.coupon
    coupon = input.coupon.value
  }

  const prices = courses.map((course) => course.priceSatang)
  const subtotalSatang = prices.reduce((sum, price) => sum + price, 0)
  const discountSatang = coupon ? calculateDiscount(coupon, subtotalSatang) : 0
  const shares = allocateDiscount(prices, discountSatang)

  return ok({
    items: courses.map((course, i) => ({
      courseId: course.id,
      title: course.title,
      priceSatang: course.priceSatang,
      discountSatang: shares[i],
      paidSatang: course.priceSatang - shares[i],
    })),
    coupon,
    subtotalSatang,
    discountSatang,
    totalSatang: subtotalSatang - discountSatang,
  })
}
