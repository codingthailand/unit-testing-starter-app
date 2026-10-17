import { z } from "zod"
import { bahtToSatang } from "@/lib/shared/money"
import { COURSE_LEVELS } from "@/lib/shared/status"
import { requiredNumber } from "./form-data"

/** ฟอร์มคอร์ส (admin) — ราคาเป็นบาท แปลงเป็นสตางค์ตอน transform */
export const courseSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug ใช้ได้เฉพาะ a-z, 0-9 และ - เช่น react-basic")
      .max(80, "slug ต้องไม่เกิน 80 ตัวอักษร"),
    title: z.string().trim().min(3, "ชื่อคอร์สต้องมีอย่างน้อย 3 ตัวอักษร").max(120, "ชื่อคอร์สต้องไม่เกิน 120 ตัวอักษร"),
    summary: z.string().trim().min(10, "คำโปรยต้องมีอย่างน้อย 10 ตัวอักษร").max(200, "คำโปรยต้องไม่เกิน 200 ตัวอักษร"),
    description: z.string().trim().min(10, "รายละเอียดต้องมีอย่างน้อย 10 ตัวอักษร"),
    priceBaht: requiredNumber("กรุณากรอกราคา")
      .pipe(z.number().min(0, "ราคาต้องไม่ติดลบ")
      .max(100000, "ราคาต้องไม่เกิน 100,000 บาท")),
    level: z.enum(COURSE_LEVELS, { error: "กรุณาเลือกระดับ" }),
    imageName: z.string().trim().min(1, "กรุณาระบุชื่อไฟล์รูปปก"),
    categoryId: requiredNumber("กรุณาเลือกหมวดหมู่").pipe(z.number().int().positive("กรุณาเลือกหมวดหมู่")),
    isPublished: z.coerce.boolean(),
  })
  .transform(({ priceBaht, ...rest }) => ({ ...rest, priceSatang: bahtToSatang(priceBaht) }))

export type CourseFormValues = z.input<typeof courseSchema>

export const lessonSchema = z.object({
  title: z.string().trim().min(3, "ชื่อบทเรียนต้องมีอย่างน้อย 3 ตัวอักษร").max(120),
  youtubeId: z.string().trim().regex(/^[A-Za-z0-9_-]{11}$/, "YouTube ID ต้องยาว 11 ตัวอักษร"),
  durationMinutes: requiredNumber("กรุณากรอกความยาว (นาที)").pipe(
    z.number().int("ความยาวต้องเป็นจำนวนเต็ม").min(1, "ความยาวอย่างน้อย 1 นาที").max(600, "ความยาวต้องไม่เกิน 600 นาที")
  ),
  position: requiredNumber("กรุณากรอกลำดับ").pipe(z.number().int("ลำดับต้องเป็นจำนวนเต็ม").min(1, "ลำดับต้องเริ่มที่ 1")),
  isPreview: z.coerce.boolean(),
})

export type LessonFormValues = z.input<typeof lessonSchema>
