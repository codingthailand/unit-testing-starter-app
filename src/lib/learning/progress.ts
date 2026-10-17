/**
 * % ความคืบหน้า = floor(completed / total × 100) (pure)
 * - total = 0 → 0 (ไม่ใช่ NaN)
 * - ผลลัพธ์อยู่ในช่วง 0–100 เสมอ
 */
export function calculateProgressPercent(completed: number, total: number): number {
  if (total <= 0 || completed <= 0) return 0
  return Math.min(100, Math.floor((completed / total) * 100))
}

/** ออกใบประกาศเมื่อเรียนครบ 100% */
export function shouldIssueCertificate(progressPercent: number): boolean {
  return progressPercent >= 100
}
