import type { DbClient } from "@/lib/shared/db"

export interface ProgressRepository {
  /** บันทึกว่าเรียนจบ — ถ้าเคยบันทึกแล้วไม่ทำอะไร (idempotent) */
  markCompleted(userId: string, lessonId: number, completedAt: Date): Promise<void>
  completedLessonIds(userId: string, courseId: number): Promise<number[]>
}

export function createPrismaProgressRepository(db: DbClient): ProgressRepository {
  return {
    async markCompleted(userId, lessonId, completedAt) {
      await db.lessonProgress.upsert({
        where: { userId_lessonId: { userId, lessonId } },
        create: { userId, lessonId, completedAt },
        update: {},
      })
    },

    async completedLessonIds(userId, courseId) {
      const rows = await db.lessonProgress.findMany({
        where: { userId, lesson: { courseId } },
        select: { lessonId: true },
      })
      return rows.map((row) => row.lessonId)
    },
  }
}
