import { z } from "zod"

/** รูปแบบข้อมูลจาก https://api.codingthailand.com/api/course */
export const freeCourseSchema = z.object({
  id: z.number(),
  title: z.string(),
  detail: z.string(),
  date: z.string(),
  view: z.number(),
  picture: z.string(),
})

export const freeCourseResponseSchema = z.object({
  data: z.array(freeCourseSchema),
})

export type FreeCourse = z.infer<typeof freeCourseSchema>
