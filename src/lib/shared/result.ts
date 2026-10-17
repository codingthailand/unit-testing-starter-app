import type { AppError } from "./errors"

/**
 * business error ไม่ throw แต่คืนเป็น Result
 * เทสต์จึง assert ได้ตรง ๆ: expect(result).toEqual({ ok: false, error: { code: "...", ... } })
 */
export type Result<T, E = AppError> =
  | { ok: true; value: T }
  | { ok: false; error: E }

export function ok<T>(value: T): { ok: true; value: T } {
  return { ok: true, value }
}

export function err<E>(error: E): { ok: false; error: E } {
  return { ok: false, error }
}
