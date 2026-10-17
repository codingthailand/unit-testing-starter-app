import { isUniqueConstraintError, type DbClient } from "@/lib/shared/db"

export interface ProgressRepository {
  /** บันทึกว่าเรียนจบ — ถ้าเคยบันทึกแล้วไม่ทำอะไร (idempotent) */
  markCompleted(userId: string, lessonId: number, completedAt: Date): Promise<void>
  completedLessonIds(userId: string, courseId: number): Promise<number[]>
  /** จำนวนบทที่เรียนจบแยกตามคอร์ส (query เดียว) — คอร์สที่ยังไม่เรียนจะไม่อยู่ใน Map */
  completedCountByCourse(userId: string, courseIds: readonly number[]): Promise<Map<number, number>>
}

export function createPrismaProgressRepository(db: DbClient): ProgressRepository {
  return {
    async markCompleted(userId, lessonId, completedAt) {
      try {
        await db.lessonProgress.upsert({
          where: { userId_lessonId: { userId, lessonId } },
          create: { userId, lessonId, completedAt },
          update: {},
        })
      } catch (error) {
        // request ที่มาพร้อมกันสร้างแถวไปก่อนแล้ว — ผลลัพธ์เหมือนกัน จึงไม่ถือเป็น error
        if (!isUniqueConstraintError(error)) throw error
      }
    },

    async completedLessonIds(userId, courseId) {
      const rows = await db.lessonProgress.findMany({
        where: { userId, lesson: { courseId } },
        select: { lessonId: true },
      })
      return rows.map((row) => row.lessonId)
    },

    async completedCountByCourse(userId, courseIds) {
      const rows = await db.lessonProgress.findMany({
        where: { userId, lesson: { courseId: { in: [...courseIds] } } },
        select: { lesson: { select: { courseId: true } } },
      })
      return countBy(rows.map((row) => row.lesson.courseId))
    },
  }
}

/** [7, 7, 9] → Map { 7 → 2, 9 → 1 } (pure) */
export function countBy(values: readonly number[]): Map<number, number> {
  const counts = new Map<number, number>()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  return counts
}
