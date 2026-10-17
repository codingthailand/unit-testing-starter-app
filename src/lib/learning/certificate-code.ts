import { randomBytes } from "node:crypto"

/** ฟังก์ชันสุ่มส่วนท้ายของรหัส — inject เข้า service เพื่อให้เทสต์กำหนดค่าเองได้ */
export type CodeGenerator = () => string

export const CERTIFICATE_CODE_PATTERN = /^CT-\d{4}-[A-Z0-9]{6}$/

/** (2026, "ABC123") → "CT-2026-ABC123" (pure) */
export function formatCertificateCode(year: number, suffix: string): string {
  return `CT-${year}-${suffix.toUpperCase()}`
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // ตัด 0/O/1/I ที่อ่านสับสน

/** ตัวสุ่มจริง (adapter) — ไม่ใช่ pure จึงไม่ถูกเรียกตรง ๆ จาก service */
export const randomCodeGenerator: CodeGenerator = () =>
  Array.from(randomBytes(6), (byte) => ALPHABET[byte % ALPHABET.length]).join("")
