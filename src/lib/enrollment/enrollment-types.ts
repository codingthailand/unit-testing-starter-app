import type { EnrollmentStatus } from "@/lib/shared/status"

export type Enrollment = {
  id: number
  userId: string
  courseId: number
  orderItemId: number | null
  status: EnrollmentStatus
  enrolledAt: Date
}
