import type { EnrollmentStatus } from "@/lib/shared/status"

export const MIN_RATING = 1
export const MAX_RATING = 5
export const MIN_COMMENT_LENGTH = 10
export const MAX_COMMENT_LENGTH = 1000

/**
 * คะแนนเฉลี่ยปัดทศนิยม 1 ตำแหน่ง (pure)
 * [] → null (ยังไม่มีรีวิว), [5, 4, 4] → 4.3
 */
export function averageRating(ratings: readonly number[]): number | null {
  if (ratings.length === 0) return null
  const sum = ratings.reduce((total, rating) => total + rating, 0)
  return Math.round((sum / ratings.length) * 10) / 10
}

/** รีวิวได้เฉพาะผู้ที่ลงทะเบียนอยู่ (ACTIVE) */
export function canReview(enrollmentStatus: EnrollmentStatus | null): boolean {
  return enrollmentStatus === "ACTIVE"
}
