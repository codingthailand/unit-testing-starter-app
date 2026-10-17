import { z } from "zod"
import { appError } from "@/lib/shared/errors"
import { err, ok, type Result } from "@/lib/shared/result"

/** แปลง zod error → Result แบบเดียวกับ service (pure) */
export function parseWithSchema<S extends z.ZodType>(schema: S, input: unknown): Result<z.output<S>> {
  const parsed = schema.safeParse(input)
  if (parsed.success) return ok(parsed.data)

  const fieldErrors: Record<string, string[]> = {}
  for (const issue of parsed.error.issues) {
    const key = issue.path.join(".") || "_form"
    ;(fieldErrors[key] ??= []).push(issue.message)
  }
  return err(appError("VALIDATION_FAILED", fieldErrors))
}

/** FormData → object (checkbox ที่ไม่ติ๊กจะไม่มีใน FormData จึงต้องระบุ booleanKeys) */
export function formDataToObject(formData: FormData, booleanKeys: readonly string[] = []): Record<string, unknown> {
  const data: Record<string, unknown> = Object.fromEntries(formData.entries())
  for (const key of booleanKeys) data[key] = formData.get(key) === "on" || formData.get(key) === "true"
  return data
}

/**
 * ตัวเลขจากฟอร์มที่ "ต้องกรอก" — z.coerce.number() เฉย ๆ จะแปลง "" เป็น 0 แล้วผ่าน .min(0) ไปเงียบ ๆ
 * helper นี้แปลงค่าว่าง/ช่องว่างล้วนเป็น undefined ก่อน จึงได้ error ว่าต้องกรอก
 */
export function requiredNumber(message: string) {
  return z.preprocess(
    (value) => (value === null || (typeof value === "string" && value.trim() === "") ? undefined : value),
    z.coerce.number({ error: message }).refine((value) => Number.isFinite(value), message)
  )
}
