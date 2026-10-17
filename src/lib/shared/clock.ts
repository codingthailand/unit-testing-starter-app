/**
 * นาฬิกาที่ inject ได้ — โค้ดใน lib ห้ามเรียก new Date() / Date.now() เอง
 * ตอนเทสต์ใช้ fixedClock(...) เพื่อให้ผลลัพธ์คงที่
 */
export type Clock = () => Date

export const systemClock: Clock = () => new Date()

export function fixedClock(date: Date | string): Clock {
  const time = new Date(date).getTime()
  return () => new Date(time)
}

export const DAY_MS = 24 * 60 * 60 * 1000

/** timezone ที่ใช้ตีความ "วันที่" ทางธุรกิจ (เช่น กราฟรายได้รายวัน) */
export const BUSINESS_TIME_ZONE = "Asia/Bangkok"

/**
 * แปลงเวลาเป็นคีย์วันที่ "YYYY-MM-DD" ตาม timezone ที่กำหนด (pure)
 * เช่น 2026-10-16T17:30:00Z ใน Asia/Bangkok → "2026-10-17"
 */
export function toDateKey(date: Date, timeZone: string = BUSINESS_TIME_ZONE): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

/** ปีตาม timezone ทางธุรกิจ (pure) */
export function toBusinessYear(date: Date, timeZone: string = BUSINESS_TIME_ZONE): number {
  return Number(toDateKey(date, timeZone).slice(0, 4))
}
