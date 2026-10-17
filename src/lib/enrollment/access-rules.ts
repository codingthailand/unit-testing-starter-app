import type { EnrollmentStatus } from "@/lib/shared/status"

/**
 * เข้าดูบทเรียนได้หรือไม่ (pure)
 * - บท preview ดูได้ทุกคน (ไม่ต้อง login)
 * - บทอื่นต้องลงทะเบียน ACTIVE
 */
export function canAccessLesson(input: {
  isPreview: boolean
  enrollmentStatus: EnrollmentStatus | null
}): boolean {
  return input.isPreview || input.enrollmentStatus === "ACTIVE"
}
