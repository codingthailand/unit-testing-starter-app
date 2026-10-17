import { z } from "zod"
import {
  MAX_COMMENT_LENGTH,
  MAX_RATING,
  MIN_COMMENT_LENGTH,
  MIN_RATING,
} from "@/lib/review/review-rules"

const RATING_MESSAGE = `คะแนนต้องเป็นจำนวนเต็ม ${MIN_RATING}–${MAX_RATING}`

export const reviewSchema = z.object({
  rating: z.coerce
    .number({ error: RATING_MESSAGE })
    .int(RATING_MESSAGE)
    .min(MIN_RATING, RATING_MESSAGE)
    .max(MAX_RATING, RATING_MESSAGE),
  comment: z
    .string()
    .trim()
    .min(MIN_COMMENT_LENGTH, `รีวิวต้องยาวอย่างน้อย ${MIN_COMMENT_LENGTH} ตัวอักษร`)
    .max(MAX_COMMENT_LENGTH, `รีวิวต้องไม่เกิน ${MAX_COMMENT_LENGTH} ตัวอักษร`),
})

export type ReviewFormValues = z.input<typeof reviewSchema>
