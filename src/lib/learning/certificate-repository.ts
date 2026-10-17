import { isUniqueConstraintError, type DbClient } from "@/lib/shared/db"
import type { Certificate, CertificateView } from "./learning-types"

export interface CertificateRepository {
  find(userId: string, courseId: number): Promise<Certificate | null>
  findByCode(code: string): Promise<CertificateView | null>
  /**
   * ออกใบประกาศ — ถ้าผู้ใช้มีใบของคอร์สนี้อยู่แล้ว (เช่น request ซ้อนกัน) คืนใบเดิม
   * คืน null เมื่อ `code` ชนกับใบของคนอื่น ให้ผู้เรียกสุ่มรหัสใหม่
   */
  issue(input: Omit<Certificate, "id">): Promise<Certificate | null>
}

export function createPrismaCertificateRepository(db: DbClient): CertificateRepository {
  return {
    async find(userId, courseId) {
      return db.certificate.findUnique({ where: { userId_courseId: { userId, courseId } } })
    },

    async findByCode(code) {
      const row = await db.certificate.findUnique({
        where: { code },
        include: {
          user: { select: { name: true } },
          course: {
            select: { title: true, slug: true, lessons: { select: { durationMinutes: true } } },
          },
        },
      })
      if (!row) return null
      const { user, course, ...certificate } = row
      return {
        ...certificate,
        userName: user.name,
        courseTitle: course.title,
        courseSlug: course.slug,
        totalMinutes: course.lessons.reduce((sum, lesson) => sum + lesson.durationMinutes, 0),
      }
    },

    async issue(input) {
      try {
        return await db.certificate.create({ data: input })
      } catch (error) {
        if (!isUniqueConstraintError(error)) throw error
        return db.certificate.findUnique({
          where: { userId_courseId: { userId: input.userId, courseId: input.courseId } },
        })
      }
    },
  }
}
