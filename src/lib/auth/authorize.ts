import { appError } from "@/lib/shared/errors"
import { err, ok, type Result } from "@/lib/shared/result"

export type SessionUser = {
  id: string
  name: string
  email: string
  /** มาจาก DB ตรง ๆ อาจเป็นค่าอะไรก็ได้ */
  role: string
}

/** ต้อง login (pure) */
export function authorizeUser(user: SessionUser | null): Result<SessionUser> {
  return user ? ok(user) : err(appError("UNAUTHENTICATED"))
}

/** ต้องเป็น admin — เทียบค่าตรงตัว "Admin" ไม่นับ (pure) */
export function authorizeAdmin(user: SessionUser | null): Result<SessionUser> {
  if (!user) return err(appError("UNAUTHENTICATED"))
  if (user.role !== "admin") return err(appError("FORBIDDEN"))
  return ok(user)
}
