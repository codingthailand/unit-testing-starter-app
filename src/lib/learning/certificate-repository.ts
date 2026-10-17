import type { DbClient } from "@/lib/shared/db"
import type { Certificate, CertificateView } from "./learning-types"

export interface CertificateRepository {
  find(userId: string, courseId: number): Promise<Certificate | null>
  findByCode(code: string): Promise<CertificateView | null>
  create(input: Omit<Certificate, "id">): Promise<Certificate>
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

    async create(input) {
      return db.certificate.create({ data: input })
    },
  }
}
