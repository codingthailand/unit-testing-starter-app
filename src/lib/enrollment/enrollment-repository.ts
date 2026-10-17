import type { DbClient } from "@/lib/shared/db"
import { ENROLLMENT_STATUSES, isOneOf } from "@/lib/shared/status"
import type { Enrollment } from "./enrollment-types"

export interface EnrollmentRepository {
  findActiveCourseIds(userId: string, courseIds?: readonly number[]): Promise<number[]>
  find(userId: string, courseId: number): Promise<Enrollment | null>
  listActive(userId: string): Promise<Enrollment[]>
  /** สร้างใหม่ หรือเปลี่ยนแถวเดิม (REVOKED) กลับเป็น ACTIVE */
  activate(input: {
    userId: string
    courseId: number
    orderItemId: number | null
    enrolledAt: Date
  }): Promise<void>
  /**
   * ถอนสิทธิ์เฉพาะเมื่อ enrollment ผูกกับ orderItem นี้ (ถ้าผูกกับ order อื่นแล้ว จะไม่แตะ)
   * คืน true เมื่อถอนสิทธิ์จริง
   */
  revokeForOrderItem(userId: string, courseId: number, orderItemId: number): Promise<boolean>
}

type EnrollmentRow = Omit<Enrollment, "status"> & { status: string }

/** สถานะที่ไม่รู้จักถือว่า REVOKED (ปลอดภัยไว้ก่อน) */
export function toEnrollment(row: EnrollmentRow): Enrollment {
  return {
    ...row,
    status: isOneOf(ENROLLMENT_STATUSES, row.status) ? row.status : "REVOKED",
  }
}

export function createPrismaEnrollmentRepository(db: DbClient): EnrollmentRepository {
  return {
    async findActiveCourseIds(userId, courseIds) {
      const rows = await db.enrollment.findMany({
        where: {
          userId,
          status: "ACTIVE",
          ...(courseIds ? { courseId: { in: [...courseIds] } } : {}),
        },
        select: { courseId: true },
      })
      return rows.map((row) => row.courseId)
    },

    async find(userId, courseId) {
      const row = await db.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
      })
      return row ? toEnrollment(row) : null
    },

    async listActive(userId) {
      const rows = await db.enrollment.findMany({
        where: { userId, status: "ACTIVE" },
        orderBy: { enrolledAt: "desc" },
      })
      return rows.map(toEnrollment)
    },

    async activate({ userId, courseId, orderItemId, enrolledAt }) {
      await db.enrollment.upsert({
        where: { userId_courseId: { userId, courseId } },
        create: { userId, courseId, orderItemId, enrolledAt, status: "ACTIVE" },
        update: { orderItemId, enrolledAt, status: "ACTIVE" },
      })
    },

    async revokeForOrderItem(userId, courseId, orderItemId) {
      const { count } = await db.enrollment.updateMany({
        where: { userId, courseId, orderItemId, status: "ACTIVE" },
        data: { status: "REVOKED" },
      })
      return count === 1
    },
  }
}
