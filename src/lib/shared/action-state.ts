import type { Result } from "./result"

/** รูปแบบผลลัพธ์ที่ Server Action ส่งกลับให้ Client Component */
export type ActionState<T = undefined> =
  | { ok: true; message: string; data: T }
  | { ok: false; message: string; code: string; fieldErrors?: Record<string, string[]> }

/** Result จาก service → ActionState (pure) */
export function toActionState<T>(result: Result<T>, successMessage: string): ActionState<T> {
  if (result.ok) return { ok: true, message: successMessage, data: result.value }
  return {
    ok: false,
    message: result.error.message,
    code: result.error.code,
    ...(result.error.fieldErrors ? { fieldErrors: result.error.fieldErrors } : {}),
  }
}
