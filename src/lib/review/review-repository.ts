import type { DbClient } from "@/lib/shared/db"
import type { Review, ReviewInput } from "./review-types"

export interface ReviewRepository {
  listForCourse(courseId: number): Promise<Review[]>
  find(userId: string, courseId: number): Promise<Review | null>
  /** 1 คน 1 รีวิวต่อคอร์ส — รีวิวซ้ำคือแก้ไขรีวิวเดิม */
  upsert(userId: string, courseId: number, input: ReviewInput): Promise<void>
  delete(userId: string, courseId: number): Promise<void>
}

const include = { user: { select: { name: true } } } as const

type ReviewRow = Omit<Review, "userName"> & { user: { name: string } }

function toReview({ user, ...row }: ReviewRow): Review {
  return { ...row, userName: user.name }
}

export function createPrismaReviewRepository(db: DbClient): ReviewRepository {
  return {
    async listForCourse(courseId) {
      const rows = await db.review.findMany({
        where: { courseId },
        include,
        orderBy: { updatedAt: "desc" },
      })
      return rows.map(toReview)
    },

    async find(userId, courseId) {
      const row = await db.review.findUnique({
        where: { userId_courseId: { userId, courseId } },
        include,
      })
      return row ? toReview(row) : null
    },

    async upsert(userId, courseId, input) {
      await db.review.upsert({
        where: { userId_courseId: { userId, courseId } },
        create: { userId, courseId, ...input },
        update: input,
      })
    },

    async delete(userId, courseId) {
      await db.review.deleteMany({ where: { userId, courseId } })
    },
  }
}
