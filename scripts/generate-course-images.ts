/**
 * สร้างรูปปกคอร์สเป็น SVG ใน public/course-image/ (รันครั้งเดียว ผลลัพธ์ commit ไว้แล้ว)
 *   npx tsx scripts/generate-course-images.ts
 */
import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { CATEGORIES, COURSES } from "../prisma/seed-data/catalog"

const outDir = join(process.cwd(), "public", "course-image")
mkdirSync(outDir, { recursive: true })

function escape(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

/** ตัดชื่อคอร์สเป็นไม่เกิน 2 บรรทัด */
function lines(title: string): string[] {
  const words = title.replace(/\s*\(.*\)$/, "").split(" ")
  const result: string[] = [""]
  for (const word of words) {
    const current = result[result.length - 1]
    if ((current + " " + word).trim().length > 20 && current && result.length < 2) result.push(word)
    else result[result.length - 1] = (current + " " + word).trim()
  }
  return result
}

for (const course of COURSES) {
  const category = CATEGORIES.find((item) => item.slug === course.category)!
  const [from, to] = category.color
  const titleLines = lines(course.title)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
    <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.5" fill="#ffffff" fill-opacity="0.18"/>
    </pattern>
  </defs>
  <rect width="640" height="360" fill="url(#g)"/>
  <rect width="640" height="360" fill="url(#dots)"/>
  <circle cx="560" cy="60" r="140" fill="#ffffff" fill-opacity="0.08"/>
  <circle cx="80" cy="340" r="110" fill="#ffffff" fill-opacity="0.06"/>
  <text x="48" y="78" font-family="system-ui, sans-serif" font-size="20" font-weight="600" fill="#ffffff" fill-opacity="0.85" letter-spacing="2">${escape(category.name.toUpperCase())}</text>
  ${titleLines
    .map(
      (line, i) =>
        `<text x="48" y="${200 + i * 56 - (titleLines.length - 1) * 28}" font-family="system-ui, sans-serif" font-size="46" font-weight="700" fill="#ffffff">${escape(line)}</text>`
    )
    .join("\n  ")}
  <text x="48" y="318" font-family="system-ui, sans-serif" font-size="18" fill="#ffffff" fill-opacity="0.8">CodingThailand Academy</text>
</svg>
`
  writeFileSync(join(outDir, `${course.slug}.svg`), svg)
}

console.log(`สร้างรูปปก ${COURSES.length} รูปที่ ${outDir}`)
