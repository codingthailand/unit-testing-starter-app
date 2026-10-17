import type { FreeCourse } from "@/lib/free-course/free-course-schema"

/** คอร์สฟรีจาก API ภายนอก (https://api.codingthailand.com/api/course) */
export type Course = FreeCourse

export type {
  Category,
  CourseDetail,
  CourseSummary,
  LessonInfo,
} from "@/lib/course/course-types"
