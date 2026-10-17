export const PERIOD_DAYS = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
} as const

export type Period = keyof typeof PERIOD_DAYS

export const PERIODS = Object.keys(PERIOD_DAYS) as Period[]
export const DEFAULT_PERIOD: Period = "30d"

/** "7d" | "30d" | "90d" → ค่านั้น, อย่างอื่น → "30d" (pure) */
export function parsePeriod(raw: unknown): Period {
  return typeof raw === "string" && raw in PERIOD_DAYS ? (raw as Period) : DEFAULT_PERIOD
}

export function periodDays(period: Period): number {
  return PERIOD_DAYS[period]
}
