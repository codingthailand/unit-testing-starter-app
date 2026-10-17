import type { CourseRepository } from "@/lib/course/course-repository"
import type { CourseDetail, CourseSummary, LessonInfo } from "@/lib/course/course-types"
import { canAccessLesson } from "@/lib/enrollment/access-rules"
import type { EnrollmentRepository } from "@/lib/enrollment/enrollment-repository"
import { toBusinessYear, type Clock } from "@/lib/shared/clock"
import { appError } from "@/lib/shared/errors"
import { err, ok, type Result } from "@/lib/shared/result"
import type { EnrollmentStatus } from "@/lib/shared/status"
import type { CertificateRepository } from "./certificate-repository"
import { formatCertificateCode, type CodeGenerator } from "./certificate-code"
import type { CertificateView } from "./learning-types"
import { calculateProgressPercent, shouldIssueCertificate } from "./progress"
import type { ProgressRepository } from "./progress-repository"

/** จำนวนครั้งที่ลองสุ่มรหัสใบประกาศใหม่เมื่อรหัสชนกัน */
export const MAX_CERTIFICATE_CODE_ATTEMPTS = 3

export type LearningServiceDeps = {
  courses: CourseRepository
  enrollments: EnrollmentRepository
  progress: ProgressRepository
  certificates: CertificateRepository
  clock: Clock
  generateCode: CodeGenerator
}

export type LessonPage = {
  course: CourseDetail
  lesson: LessonInfo
  enrollmentStatus: EnrollmentStatus | null
  completedLessonIds: number[]
  progressPercent: number
  certificateCode: string | null
}

export type CompleteLessonResult = {
  progressPercent: number
  /** มีค่าเมื่อเรียนครบแล้ว (ทั้งที่เพิ่งออกและที่เคยออกไว้) */
  certificateCode: string | null
}

export type MyCourse = {
  course: CourseSummary
  progressPercent: number
  certificateCode: string | null
  nextLessonId: number | null
}

export function createLearningService(deps: LearningServiceDeps) {
  const { courses, enrollments, progress, certificates, clock, generateCode } = deps

  return {
    async getLessonPage(input: {
      slug: string
      lessonId: number
      userId: string | null
    }): Promise<Result<LessonPage>> {
      const course = await courses.findBySlug(input.slug)
      const lesson = course?.lessons.find((item) => item.id === input.lessonId)
      if (!course || !course.isPublished || !lesson) return err(appError("LESSON_NOT_FOUND"))

      const enrollment = input.userId ? await enrollments.find(input.userId, course.id) : null
      const enrollmentStatus = enrollment?.status ?? null
      if (!canAccessLesson({ isPreview: lesson.isPreview, enrollmentStatus })) {
        return err(appError(input.userId ? "NOT_ENROLLED" : "UNAUTHENTICATED"))
      }

      const [completedLessonIds, certificate] = input.userId
        ? await Promise.all([
            progress.completedLessonIds(input.userId, course.id),
            certificates.find(input.userId, course.id),
          ])
        : [[], null]

      return ok({
        course,
        lesson,
        enrollmentStatus,
        completedLessonIds,
        progressPercent: calculateProgressPercent(completedLessonIds.length, course.lessonCount),
        certificateCode: certificate?.code ?? null,
      })
    },

    /** กดจบบทเรียน (idempotent) และออกใบประกาศเมื่อครบ 100% ครั้งเดียว */
    async completeLesson(input: { userId: string; lessonId: number }): Promise<Result<CompleteLessonResult>> {
      const lesson = await courses.findLesson(input.lessonId)
      if (!lesson) return err(appError("LESSON_NOT_FOUND"))

      const enrollment = await enrollments.find(input.userId, lesson.courseId)
      if (enrollment?.status !== "ACTIVE") return err(appError("NOT_ENROLLED"))

      const now = clock()
      await progress.markCompleted(input.userId, lesson.id, now)

      const [total, completed] = await Promise.all([
        courses.countLessons(lesson.courseId),
        progress.completedLessonIds(input.userId, lesson.courseId),
      ])
      const progressPercent = calculateProgressPercent(completed.length, total)
      if (!shouldIssueCertificate(progressPercent)) return ok({ progressPercent, certificateCode: null })

      const existing = await certificates.find(input.userId, lesson.courseId)
      if (existing) return ok({ progressPercent, certificateCode: existing.code })

      const year = toBusinessYear(now)
      for (let attempt = 0; attempt < MAX_CERTIFICATE_CODE_ATTEMPTS; attempt++) {
        const certificate = await certificates.issue({
          code: formatCertificateCode(year, generateCode()),
          userId: input.userId,
          courseId: lesson.courseId,
          issuedAt: now,
        })
        if (certificate) return ok({ progressPercent, certificateCode: certificate.code })
      }
      throw new Error("สุ่มรหัสใบประกาศไม่สำเร็จ (รหัสชนกันซ้ำหลายครั้ง)")
    },

    async getMyCourses(userId: string): Promise<MyCourse[]> {
      const active = await enrollments.listActive(userId)
      const result = await Promise.all(
        active.map(async (enrollment): Promise<MyCourse | null> => {
          const course = await courses.findById(enrollment.courseId)
          if (!course) return null
          const [completed, certificate] = await Promise.all([
            progress.completedLessonIds(userId, course.id),
            certificates.find(userId, course.id),
          ])
          const done = new Set(completed)
          return {
            course,
            progressPercent: calculateProgressPercent(completed.length, course.lessonCount),
            certificateCode: certificate?.code ?? null,
            nextLessonId: (course.lessons.find((lesson) => !done.has(lesson.id)) ?? course.lessons[0])?.id ?? null,
          }
        })
      )
      return result.filter((item): item is MyCourse => item !== null)
    },

    async getCertificate(code: string): Promise<CertificateView | null> {
      return certificates.findByCode(code.trim().toUpperCase())
    },
  }
}

export type LearningService = ReturnType<typeof createLearningService>
