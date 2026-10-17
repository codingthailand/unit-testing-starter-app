import type { CourseLevel } from "@/lib/shared/status"

/** domain type ที่ repository คืนออกไป — ไม่มี null และไม่ผูกกับ Prisma */

export type Category = {
  id: number
  name: string
  slug: string
}

export type LessonInfo = {
  id: number
  title: string
  youtubeId: string
  durationMinutes: number
  position: number
  isPreview: boolean
}

export type CourseSummary = {
  id: number
  slug: string
  title: string
  summary: string
  priceSatang: number
  level: CourseLevel
  imageName: string
  isPublished: boolean
  category: Category
  lessonCount: number
  totalMinutes: number
  /** null = ยังไม่มีรีวิว */
  averageRating: number | null
  reviewCount: number
  createdAt: Date
}

export type CourseDetail = CourseSummary & {
  description: string
  lessons: LessonInfo[]
}

/** ข้อมูลที่ checkout ต้องใช้ */
export type CourseForSale = {
  id: number
  title: string
  priceSatang: number
  isPublished: boolean
}

export type LessonWithCourse = LessonInfo & {
  courseId: number
  courseSlug: string
  courseTitle: string
}

export type CourseInput = {
  slug: string
  title: string
  summary: string
  description: string
  priceSatang: number
  level: CourseLevel
  imageName: string
  isPublished: boolean
  categoryId: number
}

export type LessonInput = {
  title: string
  youtubeId: string
  durationMinutes: number
  position: number
  isPreview: boolean
}
