const BASE = "http://internal.invalid"

/**
 * กัน open redirect: อนุญาตเฉพาะ path ภายในเว็บ (pure)
 *   safeRedirectPath("/courses")         → "/courses"
 *   safeRedirectPath("https://evil.com") → "/"
 *   safeRedirectPath("//evil.com")       → "/"
 *   safeRedirectPath("/\t/evil.com")     → "/"  (browser ตัด tab/ขึ้นบรรทัดทิ้ง เหลือ //evil.com)
 *
 * ตรวจ 2 ชั้น: ปฏิเสธตัวอักษรควบคุม/backslash ทั้งหมด แล้วให้ URL parser ยืนยันว่ายังอยู่ origin เดิม
 */
export function safeRedirectPath(next: string | null | undefined, fallback = "/"): string {
  if (!next || !next.startsWith("/")) return fallback
  if (/[\u0000-\u001F\u007F\\]/.test(next)) return fallback

  try {
    const url = new URL(next, BASE)
    if (url.origin !== BASE) return fallback
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}
