/** 45 → "45 นาที", 60 → "1 ชม.", 135 → "2 ชม. 15 นาที" (pure) */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest} นาที`
  return rest === 0 ? `${hours} ชม.` : `${hours} ชม. ${rest} นาที`
}
