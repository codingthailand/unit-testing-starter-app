import { appError } from "@/lib/shared/errors"
import { err, ok, type Result } from "@/lib/shared/result"
import type { CourseRepository } from "./course-repository"
import type { CourseDetail, CourseInput, CourseSummary, LessonInput } from "./course-types"

export type CourseAdminServiceDeps = {
  courses: CourseRepository
}

/** use case ฝั่ง admin — input ผ่าน zod schema มาแล้ว service ตรวจกฎที่ต้องใช้ DB */
export function createCourseAdminService({ courses }: CourseAdminServiceDeps) {
  return {
    async listCourses(): Promise<CourseSummary[]> {
      const list = await courses.list({ publishedOnly: false })
      return list.sort((a, b) => a.id - b.id)
    },

    async getCourse(id: number): Promise<CourseDetail | null> {
      return courses.findById(id)
    },

    async createCourse(input: CourseInput): Promise<Result<{ id: number }>> {
      if (await courses.isSlugTaken(input.slug)) return err(appError("COURSE_SLUG_TAKEN"))
      return ok(await courses.create(input))
    },

    async updateCourse(id: number, input: CourseInput): Promise<Result<true>> {
      if (!(await courses.findById(id))) return err(appError("COURSE_NOT_FOUND"))
      if (await courses.isSlugTaken(input.slug, id)) return err(appError("COURSE_SLUG_TAKEN"))
      await courses.update(id, input)
      return ok(true)
    },

    /** คอร์สที่มียอดขายลบไม่ได้ (order_items → courses เป็น Restrict) */
    async deleteCourse(id: number): Promise<Result<true>> {
      if (!(await courses.findById(id))) return err(appError("COURSE_NOT_FOUND"))
      if (await courses.hasSales(id)) return err(appError("COURSE_HAS_SALES"))
      await courses.delete(id)
      return ok(true)
    },

    async addLesson(courseId: number, input: LessonInput): Promise<Result<{ id: number }>> {
      if (!(await courses.findById(courseId))) return err(appError("COURSE_NOT_FOUND"))
      if (await courses.isLessonPositionTaken(courseId, input.position)) {
        return err(appError("LESSON_POSITION_TAKEN"))
      }
      return ok(await courses.createLesson(courseId, input))
    },

    async updateLesson(lessonId: number, input: LessonInput): Promise<Result<true>> {
      const lesson = await courses.findLesson(lessonId)
      if (!lesson) return err(appError("LESSON_NOT_FOUND"))
      if (await courses.isLessonPositionTaken(lesson.courseId, input.position, lessonId)) {
        return err(appError("LESSON_POSITION_TAKEN"))
      }
      await courses.updateLesson(lessonId, input)
      return ok(true)
    },

    async deleteLesson(lessonId: number): Promise<Result<true>> {
      if (!(await courses.findLesson(lessonId))) return err(appError("LESSON_NOT_FOUND"))
      await courses.deleteLesson(lessonId)
      return ok(true)
    },
  }
}

export type CourseAdminService = ReturnType<typeof createCourseAdminService>
