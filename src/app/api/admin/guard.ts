import { authorizeAdmin } from "@/lib/auth/authorize";
import { getSessionUser } from "@/lib/auth/session";
import { errorResponse } from "@/lib/shared/http";

/** คืน Response 401/403 เมื่อไม่ใช่ admin, null เมื่อผ่าน */
export async function guardAdmin(): Promise<Response | null> {
  const result = authorizeAdmin(await getSessionUser());
  return result.ok ? null : errorResponse(result.error);
}
