import "server-only"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { authorizeAdmin, authorizeUser, type SessionUser } from "./authorize"

/**
 * adapter ระหว่าง Better Auth / Next.js กับกฎสิทธิ์ (authorize.ts ที่เป็น pure)
 * ไฟล์นี้เป็นที่เดียวที่ใช้ headers() / redirect() เรื่องสิทธิ์
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return null
  const { id, name, email, role } = session.user
  return { id, name, email, role: role ?? "user" }
}

/** ใช้ในหน้า: ไม่ login → /login?next=... */
export async function requireUser(next: string): Promise<SessionUser> {
  const result = authorizeUser(await getSessionUser())
  if (!result.ok) redirect(`/login?next=${encodeURIComponent(next)}`)
  return result.value
}

/** ใช้ในหน้า admin: ไม่ login → /login, ไม่ใช่ admin → / */
export async function requireAdmin(): Promise<SessionUser> {
  const result = authorizeAdmin(await getSessionUser())
  if (!result.ok) redirect(result.error.code === "UNAUTHENTICATED" ? "/login?next=/admin" : "/")
  return result.value
}
