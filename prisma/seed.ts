/**
 * ใส่ข้อมูลตัวอย่างลงฐานข้อมูลที่ DATABASE_URL ชี้อยู่ (ลบข้อมูลเดิมทั้งหมดก่อน)
 *
 *   npm run db:seed                                           # prisma/dev.db
 *   DATABASE_URL="file:./prisma/test.db" npx tsx prisma/seed.ts  # test.db
 *
 * ข้อมูล order ย้อนหลัง 90 วันสุ่มแบบกำหนด seed ไว้ (deterministic) โดยอิงจากวันที่รัน
 * บัญชีตัวอย่างใช้รหัสผ่าน "password123" ทั้งหมด
 */
import "dotenv/config"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { hashPassword } from "better-auth/crypto"
import { randomUUID } from "node:crypto"
import { PrismaClient } from "../generated/prisma/client"
import { allocateDiscount } from "../src/lib/checkout/allocate-discount"
import { calculateDiscount } from "../src/lib/coupon/coupon-rules"
import { formatCertificateCode } from "../src/lib/learning/certificate-code"
import { calculateProgressPercent } from "../src/lib/learning/progress"
import { DAY_MS, toBusinessYear } from "../src/lib/shared/clock"
import { bahtToSatang } from "../src/lib/shared/money"
import { CATEGORIES, COUPONS, COURSES, DEMO_PASSWORD, REVIEW_COMMENTS, YOUTUBE_IDS } from "./seed-data/catalog"

const url = process.env.DATABASE_URL
if (!url) throw new Error("ไม่พบ DATABASE_URL")

const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) })

/** PRNG แบบกำหนด seed ได้ (mulberry32) — รันกี่ครั้งก็ได้ผลเหมือนเดิม */
function createRandom(seed: number) {
  let state = seed
  const next = () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    next,
    int: (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min,
    pick: <T>(items: readonly T[]) => items[Math.floor(next() * items.length)],
    chance: (p: number) => next() < p,
  }
}

const random = createRandom(42)
const now = new Date()

async function resetData() {
  await prisma.review.deleteMany()
  await prisma.certificate.deleteMany()
  await prisma.lessonProgress.deleteMany()
  await prisma.enrollment.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.coupon.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.course.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany({ where: { email: { endsWith: "@example.com" } } })
}

async function createUser(name: string, email: string, role: "user" | "admin", password: string) {
  const id = randomUUID()
  await prisma.user.create({
    data: {
      id,
      name,
      email,
      role,
      emailVerified: true,
      accounts: {
        create: { id: randomUUID(), accountId: id, providerId: "credential", password },
      },
    },
  })
  return id
}

async function main() {
  await resetData()

  // ---------- แคตตาล็อก ----------
  const categoryIds = new Map<string, number>()
  for (const category of CATEGORIES) {
    const row = await prisma.category.create({ data: { name: category.name, slug: category.slug } })
    categoryIds.set(category.slug, row.id)
  }

  let videoIndex = 0
  const courses: { id: number; priceSatang: number; isPublished: boolean; lessonIds: number[] }[] = []
  for (const course of COURSES) {
    const row = await prisma.course.create({
      data: {
        slug: course.slug,
        title: course.title,
        summary: course.summary,
        description: `${course.summary}\n\nในคอร์สนี้คุณจะได้เรียนรู้ทีละขั้นตอน พร้อมตัวอย่างโค้ดและแบบฝึกหัดท้ายบท เหมาะสำหรับผู้ที่ต้องการนำไปใช้ในงานจริง`,
        priceSatang: bahtToSatang(course.priceBaht),
        level: course.level,
        imageName: `${course.slug}.svg`,
        isPublished: course.isPublished,
        categoryId: categoryIds.get(course.category)!,
        createdAt: new Date(now.getTime() - course.createdDaysAgo * DAY_MS),
        lessons: {
          create: course.lessons.map((title, i) => ({
            title,
            position: i + 1,
            isPreview: i === 0,
            durationMinutes: 8 + ((i * 7 + course.slug.length) % 18),
            youtubeId: YOUTUBE_IDS[videoIndex++ % YOUTUBE_IDS.length],
          })),
        },
      },
      include: { lessons: { select: { id: true }, orderBy: { position: "asc" } } },
    })
    courses.push({
      id: row.id,
      priceSatang: row.priceSatang,
      isPublished: row.isPublished,
      lessonIds: row.lessons.map((lesson) => lesson.id),
    })
  }

  const coupons = await Promise.all(COUPONS.map((coupon) => prisma.coupon.create({ data: { ...coupon } })))
  const welcome = coupons.find((coupon) => coupon.code === "WELCOME20")!
  const save200 = coupons.find((coupon) => coupon.code === "SAVE200")!

  // ---------- ผู้ใช้ ----------
  const password = await hashPassword(DEMO_PASSWORD)
  await createUser("ผู้ดูแลระบบ", "admin@example.com", "admin", password)
  const demoUserId = await createUser("ผู้เรียนตัวอย่าง", "user@example.com", "user", password)
  const students: string[] = []
  for (let i = 1; i <= 20; i++) {
    students.push(await createUser(`นักเรียน ${String(i).padStart(2, "0")}`, `student${String(i).padStart(2, "0")}@example.com`, "user", password))
  }

  // ---------- order ย้อนหลัง 90 วัน ----------
  const forSale = courses.filter((course) => course.isPublished && course.priceSatang > 0)
  const enrolled = new Set<string>()
  let orderCount = 0

  async function placeOrder(userId: string, picked: typeof forSale, paidAt: Date, options: {
    coupon?: (typeof coupons)[number] | null
    failed?: boolean
    refundIndex?: number | null
    completedLessons?: number[]
  }) {
    const prices = picked.map((course) => course.priceSatang)
    const subtotal = prices.reduce((sum, price) => sum + price, 0)
    const discount = options.coupon
      ? calculateDiscount(
          { type: options.coupon.type as "PERCENT" | "FIXED", value: options.coupon.value, maxDiscountSatang: options.coupon.maxDiscountSatang },
          subtotal
        )
      : 0
    const shares = allocateDiscount(prices, discount)
    const order = await prisma.order.create({
      data: {
        userId,
        status: options.failed ? "FAILED" : "PAID",
        subtotalSatang: subtotal,
        discountSatang: discount,
        totalSatang: subtotal - discount,
        couponId: options.coupon?.id ?? null,
        paymentRef: options.failed ? null : `FAKE-SEED-${++orderCount}`,
        paidAt: options.failed ? null : paidAt,
        createdAt: paidAt,
        items: {
          create: picked.map((course, i) => ({
            courseId: course.id,
            priceSatang: course.priceSatang,
            discountSatang: shares[i],
            paidSatang: course.priceSatang - shares[i],
            status: options.failed ? "PENDING" : options.refundIndex === i ? "REFUNDED" : "PAID",
            refundedAt: options.refundIndex === i ? new Date(paidAt.getTime() + DAY_MS) : null,
          })),
        },
      },
      include: { items: true },
    })
    if (options.failed) return

    for (const [i, item] of order.items.entries()) {
      const course = picked[i]
      const refunded = options.refundIndex === i
      enrolled.add(`${userId}:${course.id}`)
      await prisma.enrollment.create({
        data: { userId, courseId: course.id, orderItemId: item.id, status: refunded ? "REVOKED" : "ACTIVE", enrolledAt: paidAt },
      })
      if (refunded) continue

      const done = options.completedLessons?.[i] ?? random.int(0, course.lessonIds.length)
      for (const lessonId of course.lessonIds.slice(0, done)) {
        await prisma.lessonProgress.create({
          data: { userId, lessonId, completedAt: new Date(paidAt.getTime() + random.int(1, 72) * 3600_000) },
        })
      }
      if (calculateProgressPercent(done, course.lessonIds.length) === 100) {
        await prisma.certificate.create({
          data: {
            code: formatCertificateCode(toBusinessYear(paidAt), `S${String(orderCount).padStart(3, "0")}${i}X`.slice(0, 6)),
            userId,
            courseId: course.id,
            issuedAt: new Date(paidAt.getTime() + 3 * DAY_MS),
          },
        })
      }
      if (done > 0 && random.chance(0.6)) {
        await prisma.review.create({
          data: { userId, courseId: course.id, rating: random.pick([3, 4, 4, 5, 5, 5]), comment: random.pick(REVIEW_COMMENTS) },
        })
      }
    }
  }

  for (let daysAgo = 89; daysAgo >= 1; daysAgo--) {
    const ordersToday = random.int(0, 3)
    for (let n = 0; n < ordersToday; n++) {
      const userId = random.pick(students)
      const available = forSale.filter((course) => !enrolled.has(`${userId}:${course.id}`))
      if (available.length === 0) continue
      const picked = [...new Set([random.pick(available), random.pick(available)].slice(0, random.int(1, 2)))]
      const day = new Date(now.getTime() - daysAgo * DAY_MS)
      day.setUTCHours(random.int(1, 15), random.int(0, 59), 0, 0) // 08:00–22:59 เวลาไทย
      const roll = random.next()
      await placeOrder(userId, picked, day, {
        coupon: roll < 0.15 ? welcome : roll < 0.25 ? save200 : null,
        failed: random.chance(0.08),
        refundIndex: random.chance(0.06) ? 0 : null,
      })
    }
  }

  // ผู้เรียนตัวอย่าง: ซื้อ React เมื่อ 2 วันก่อน เรียนไป 1 บท (ยังขอคืนเงินได้)
  const react = forSale.find((course) => course.id === courses[0].id)!
  await placeOrder(demoUserId, [react], new Date(now.getTime() - 2 * DAY_MS), { completedLessons: [1] })
  await prisma.review.deleteMany({ where: { userId: demoUserId } })

  const summary = {
    categories: await prisma.category.count(),
    courses: await prisma.course.count(),
    lessons: await prisma.lesson.count(),
    users: await prisma.user.count(),
    orders: await prisma.order.count(),
    enrollments: await prisma.enrollment.count(),
    reviews: await prisma.review.count(),
    certificates: await prisma.certificate.count(),
  }
  console.log("seed เรียบร้อย:", summary)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
