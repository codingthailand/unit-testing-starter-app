import type { ApiErrorResponse } from "@/types/admin"
import type { AppError, ErrorCode } from "./errors"

/** รหัส error → HTTP status (pure) */
export function httpStatusForError(code: ErrorCode): number {
  if (code === "UNAUTHENTICATED") return 401
  if (code === "FORBIDDEN") return 403
  if (code.endsWith("NOT_FOUND")) return 404
  if (code === "VALIDATION_FAILED") return 400
  return 422
}

export function errorResponse(error: AppError): Response {
  const body: ApiErrorResponse = {
    error: error.message,
    code: error.code,
    ...(error.fieldErrors ? { fieldErrors: error.fieldErrors } : {}),
  }
  return Response.json(body, { status: httpStatusForError(error.code) })
}
