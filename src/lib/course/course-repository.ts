import type { DbClient } from "@/lib/shared/db"
import type { CourseLevel } from "@/lib/shared/status"
import { toCourseDetail, toCourseSummary } from "./course-mapper"
import type {
  Category,
  CourseDetail,
  CourseForSale,
  CourseInput,
  CourseSummary,
  LessonInput,
  LessonWithCourse,
} from "./course-types"

export type CourseFilter = {
  q?: string
  categorySlug?: string
  level?: CourseLevel
  /** false = รวมคอร์สที่ยังไม่เผยแพร่ (ใช้ในหน้า admin) */
  publishedOnly?: boolean
}

export interface CourseRepository {
  list(filter: CourseFilter): Promise<CourseSummary[]>
  findBySlug(slug: string): Promise<CourseDetail | null>
  findById(id: number): Promise<CourseDetail | null>
  findForSale(ids: readonly number[]): Promise<CourseForSale[]>
  countLessons(courseId: number): Promise<number>
  /** จำนวนบทเรียนแยกตามคอร์ส (query เดียว) */
  countLessonsByCourse(courseIds: readonly number[]): Promise<Map<number, number>>
  findLesson(lessonId: number): Promise<LessonWithCourse | null>
  listCategories(): Promise<Category[]>
  isSlugTaken(slug: string, exceptId?: number): Promise<boolean>
  hasSales(courseId: number): Promise<boolean>
  create(input: CourseInput): Promise<{ id: number }>
  update(id: number, input: CourseInput): Promise<void>
  delete(id: number): Promise<void>
  isLessonPositionTaken(courseId: number, position: number, exceptLessonId?: number): Promise<boolean>
  createLesson(courseId: number, input: LessonInput): Promise<{ id: number }>
  updateLesson(lessonId: number, input: LessonInput): Promise<void>
  deleteLesson(lessonId: number): Promise<void>
}

const lessonSelect = {
  id: true,
  title: true,
  youtubeId: true,
  durationMinutes: true,
  position: true,
  isPreview: true,
} as const

const courseSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  description: true,
  priceSatang: true,
  level: true,
  imageName: true,
  isPublished: true,
  createdAt: true,
  category: { select: { id: true, name: true, slug: true } },
  lessons: { select: lessonSelect, orderBy: { position: "asc" } },
  reviews: { select: { rating: true } },
} as const

export function createPrismaCourseRepository(db: DbClient): CourseRepository {
  return {
    async list(filter) {
      const rows = await db.course.findMany({
        where: {
          ...(filter.publishedOnly === false ? {} : { isPublished: true }),
          ...(filter.q ? { title: { contains: filter.q } } : {}),
          ...(filter.categorySlug ? { category: { slug: filter.categorySlug } } : {}),
          ...(filter.level ? { level: filter.level } : {}),
        },
        select: courseSelect,
      })
      return rows.map(toCourseSummary)
    },

    async findBySlug(slug) {
      const row = await db.course.findUnique({ where: { slug }, select: courseSelect })
      return row ? toCourseDetail(row) : null
    },

    async findById(id) {
      const row = await db.course.findUnique({ where: { id }, select: courseSelect })
      return row ? toCourseDetail(row) : null
    },

    async findForSale(ids) {
      return db.course.findMany({
        where: { id: { in: [...ids] } },
        select: { id: true, title: true, priceSatang: true, isPublished: true },
      })
    },

    async countLessons(courseId) {
      return db.lesson.count({ where: { courseId } })
    },

    async countLessonsByCourse(courseIds) {
      const rows = await db.lesson.groupBy({
        by: ["courseId"],
        where: { courseId: { in: [...courseIds] } },
        _count: { _all: true },
      })
      return new Map(rows.map((row) => [row.courseId, row._count._all]))
    },

    async findLesson(lessonId) {
      const row = await db.lesson.findUnique({
        where: { id: lessonId },
        select: { ...lessonSelect, course: { select: { id: true, slug: true, title: true } } },
      })
      if (!row) return null
      const { course, ...lesson } = row
      return { ...lesson, courseId: course.id, courseSlug: course.slug, courseTitle: course.title }
    },

    async listCategories() {
      return db.category.findMany({ orderBy: { name: "asc" } })
    },

    async isSlugTaken(slug, exceptId) {
      const found = await db.course.findUnique({ where: { slug }, select: { id: true } })
      return found !== null && found.id !== exceptId
    },

    async hasSales(courseId) {
      return (await db.orderItem.count({ where: { courseId } })) > 0
    },

    async create(input) {
      return db.course.create({ data: input, select: { id: true } })
    },

    async update(id, input) {
      await db.course.update({ where: { id }, data: input })
    },

    async delete(id) {
      await db.course.delete({ where: { id } })
    },

    async isLessonPositionTaken(courseId, position, exceptLessonId) {
      const found = await db.lesson.findUnique({
        where: { courseId_position: { courseId, position } },
        select: { id: true },
      })
      return found !== null && found.id !== exceptLessonId
    },

    async createLesson(courseId, input) {
      return db.lesson.create({ data: { ...input, courseId }, select: { id: true } })
    },

    async updateLesson(lessonId, input) {
      await db.lesson.update({ where: { id: lessonId }, data: input })
    },

    async deleteLesson(lessonId) {
      await db.lesson.delete({ where: { id: lessonId } })
    },
  }
}
