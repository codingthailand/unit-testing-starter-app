import type { EnrollmentRepository } from "@/lib/enrollment/enrollment-repository"
import type { ProgressRepository } from "@/lib/learning/progress-repository"
import { calculateProgressPercent } from "@/lib/learning/progress"
import type { EnrollmentStatus } from "@/lib/shared/status"
import type { CatalogParams } from "./catalog-params"
import type { CourseRepository } from "./course-repository"
import { sortCourses } from "./course-sort"
import type { Category, CourseDetail, CourseSummary } from "./course-types"

export type CourseServiceDeps = {
  courses: CourseRepository
  enrollments: EnrollmentRepository
  progress: ProgressRepository
}

export type CourseListResult = {
  courses: CourseSummary[]
  categories: Category[]
  params: CatalogParams
}

export type CourseDetailResult = {
  course: CourseDetail
  enrollmentStatus: EnrollmentStatus | null
  progressPercent: number
}

export function createCourseService({ courses, enrollments, progress }: CourseServiceDeps) {
  return {
    async getCourseList(params: CatalogParams): Promise<CourseListResult> {
      const [list, categories] = await Promise.all([
        courses.list({ q: params.q, categorySlug: params.category, level: params.level }),
        courses.listCategories(),
      ])
      return { courses: sortCourses(list, params.sort), categories, params }
    },

    async getFeaturedCourses(limit: number): Promise<CourseSummary[]> {
      return sortCourses(await courses.list({}), "rating").slice(0, limit)
    },

    async listCategories(): Promise<Category[]> {
      return courses.listCategories()
    },

    /** คอร์สที่ยังไม่เผยแพร่จะไม่ถูกแสดง (คืน null) */
    async getCourseDetail(slug: string, userId: string | null): Promise<CourseDetailResult | null> {
      const course = await courses.findBySlug(slug)
      if (!course || !course.isPublished) return null
      if (!userId) return { course, enrollmentStatus: null, progressPercent: 0 }

      const [enrollment, completed] = await Promise.all([
        enrollments.find(userId, course.id),
        progress.completedLessonIds(userId, course.id),
      ])
      return {
        course,
        enrollmentStatus: enrollment?.status ?? null,
        progressPercent: calculateProgressPercent(completed.length, course.lessonCount),
      }
    },
  }
}

export type CourseService = ReturnType<typeof createCourseService>
