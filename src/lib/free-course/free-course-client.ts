import { freeCourseResponseSchema, type FreeCourse } from "./free-course-schema"

export const DEFAULT_COURSE_API_URL = "https://api.codingthailand.com/api/course"
export const DEFAULT_TIMEOUT_MS = 5000

export type FetchFn = (input: string, init?: RequestInit) => Promise<Response>

export type FreeCourseClientDeps = {
  fetch: FetchFn
  /** มาจาก COURSE_API_URL — container เป็นคนอ่าน env ไม่ใช่ฟังก์ชันนี้ */
  baseUrl?: string
  timeoutMs?: number
}

export type FreeCourseResult = {
  courses: FreeCourse[]
  /** true = โหลดไม่สำเร็จ (API ล่ม / timeout / ข้อมูลผิดรูปแบบ) */
  error: boolean
}

class TimeoutError extends Error {}

/**
 * ดึงคอร์สฟรีจาก API ภายนอก — ไม่ throw เลย หน้าเว็บจึงไม่พังเมื่อ API มีปัญหา
 * inject fetch เข้ามา เทสต์จึงส่ง fetch ปลอมได้โดยไม่ต้องต่อเน็ต
 */
export async function fetchFreeCourses({
  fetch,
  baseUrl,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: FreeCourseClientDeps): Promise<FreeCourseResult> {
  const controller = new AbortController()
  let timer: ReturnType<typeof setTimeout> | undefined

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort()
      reject(new TimeoutError())
    }, timeoutMs)
  })

  try {
    const response = await Promise.race([
      fetch(baseUrl || DEFAULT_COURSE_API_URL, { signal: controller.signal }),
      timeout,
    ])
    if (!response.ok) return { courses: [], error: true }

    const parsed = freeCourseResponseSchema.safeParse(await Promise.race([response.json(), timeout]))
    if (!parsed.success) return { courses: [], error: true }

    return { courses: parsed.data.data, error: false }
  } catch {
    return { courses: [], error: true }
  } finally {
    clearTimeout(timer)
  }
}
