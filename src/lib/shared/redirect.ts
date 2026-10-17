/**
 * กัน open redirect: อนุญาตเฉพาะ path ภายในเว็บ (ขึ้นต้นด้วย "/" แต่ไม่ใช่ "//") (pure)
 *   safeRedirectPath("/courses")         → "/courses"
 *   safeRedirectPath("https://evil.com") → "/"
 *   safeRedirectPath("//evil.com")       → "/"
 */
export function safeRedirectPath(next: string | null | undefined, fallback = "/"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback
  return next
}
