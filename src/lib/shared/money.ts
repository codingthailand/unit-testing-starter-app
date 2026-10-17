/**
 * เงินทั้งระบบเก็บเป็นจำนวนเต็มหน่วย "สตางค์" (1 บาท = 100 สตางค์)
 * แปลงเป็นบาทเฉพาะตอนแสดงผลเท่านั้น
 */

const thbFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** 129050 → "฿1,290.50" */
export function formatTHB(satang: number): string {
  return thbFormatter.format(satang / 100)
}

/** 1290.5 → 129050 (ปัดเศษเพื่อกัน 0.1 + 0.2 = 0.30000000000000004) */
export function bahtToSatang(baht: number): number {
  return Math.round(baht * 100)
}

export function satangToBaht(satang: number): number {
  return satang / 100
}
