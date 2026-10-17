import { averageRating } from "@/lib/review/review-rules"
import { COURSE_LEVELS, isOneOf, type CourseLevel } from "@/lib/shared/status"
import type { CourseDetail, CourseSummary, LessonInfo } from "./course-types"

/** รูปร่างแถวที่ Prisma repository select มา (ไม่ import type จาก Prisma เพื่อให้เทสต์สร้างเองได้ง่าย) */
export type CourseRow = {
  id: number
  slug: string
  title: string
  summary: string
  description: string
  priceSatang: number
  level: string
  imageName: string
  isPublished: boolean
  createdAt: Date
  category: { id: number; name: string; slug: string }
  lessons: LessonInfo[]
  reviews: { rating: number }[]
}

/** level ที่ไม่รู้จัก (ข้อมูลเสีย) ให้ถือเป็น BEGINNER แทนการพังทั้งหน้า */
export function toCourseLevel(value: string): CourseLevel {
  return isOneOf(COURSE_LEVELS, value) ? value : "BEGINNER"
}

/** แถวจาก DB → CourseSummary (pure) */
export function toCourseSummary(row: CourseRow): CourseSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    priceSatang: row.priceSatang,
    level: toCourseLevel(row.level),
    imageName: row.imageName,
    isPublished: row.isPublished,
    category: row.category,
    lessonCount: row.lessons.length,
    totalMinutes: row.lessons.reduce((sum, lesson) => sum + lesson.durationMinutes, 0),
    averageRating: averageRating(row.reviews.map((review) => review.rating)),
    reviewCount: row.reviews.length,
    createdAt: row.createdAt,
  }
}

/** แถวจาก DB → CourseDetail โดยเรียงบทเรียนตาม position (pure) */
export function toCourseDetail(row: CourseRow): CourseDetail {
  return {
    ...toCourseSummary(row),
    description: row.description,
    lessons: [...row.lessons].sort((a, b) => a.position - b.position),
  }
}
