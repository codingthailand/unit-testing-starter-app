import type { EnrollmentRepository } from "@/lib/enrollment/enrollment-repository"
import { appError } from "@/lib/shared/errors"
import { err, ok, type Result } from "@/lib/shared/result"
import type { ReviewRepository } from "./review-repository"
import { canReview } from "./review-rules"
import type { Review, ReviewInput } from "./review-types"

export type ReviewServiceDeps = {
  reviews: ReviewRepository
  enrollments: EnrollmentRepository
}

export function createReviewService({ reviews, enrollments }: ReviewServiceDeps) {
  return {
    async listReviews(courseId: number): Promise<Review[]> {
      return reviews.listForCourse(courseId)
    },

    async getMyReview(userId: string, courseId: number): Promise<Review | null> {
      return reviews.find(userId, courseId)
    },

    /** input ต้องผ่าน reviewSchema มาแล้ว — service ตรวจเฉพาะสิทธิ์ */
    async submitReview(input: { userId: string; courseId: number } & ReviewInput): Promise<Result<true>> {
      const enrollment = await enrollments.find(input.userId, input.courseId)
      if (!canReview(enrollment?.status ?? null)) return err(appError("REVIEW_NOT_ENROLLED"))

      await reviews.upsert(input.userId, input.courseId, {
        rating: input.rating,
        comment: input.comment,
      })
      return ok(true)
    },
  }
}

export type ReviewService = ReturnType<typeof createReviewService>
