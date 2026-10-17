#!/usr/bin/env node
/**
 * สร้างฐานข้อมูลสำหรับทดสอบแยกจากฐานข้อมูลที่ใช้พัฒนา
 *
 * ทำไมต้องแยก: integration test จะเพิ่ม/ลบข้อมูลระหว่างรัน ถ้าชี้ไปที่ prisma/dev.db
 * ข้อมูลตัวอย่างจะเพี้ยนหรือหายไป
 *
 *   node scripts/setup-test-db.mjs            # สร้างใหม่ที่ prisma/test.db พร้อมข้อมูลตัวอย่าง (prisma/seed.ts)
 *   node scripts/setup-test-db.mjs --empty    # สร้างตารางอย่างเดียว ไม่ใส่ข้อมูล
 *
 * เวลาเขียนเทสต์ให้สร้าง PrismaClient ของตัวเองชี้มาที่ไฟล์นี้ แล้วส่งเข้า repository
 * เช่น createPrismaCourseRepository(testPrisma) — repository ทุกตัวรับ client เป็นพารามิเตอร์อยู่แล้ว
 */
import { execFileSync } from "node:child_process"
import { existsSync, rmSync } from "node:fs"
import { join } from "node:path"

const root = process.cwd()
const TEST_DB_PATH = join(root, "prisma", "test.db")
const TEST_DATABASE_URL = "file:./prisma/test.db"

const withData = !process.argv.includes("--empty")

for (const suffix of ["", "-journal", "-wal", "-shm"]) {
  const file = `${TEST_DB_PATH}${suffix}`
  if (existsSync(file)) rmSync(file)
}
console.log("ลบฐานข้อมูลทดสอบเดิมแล้ว")

execFileSync("npx", ["prisma", "db", "push", "--url", TEST_DATABASE_URL], {
  stdio: "inherit",
})
console.log(`สร้างตารางที่ ${TEST_DB_PATH} เรียบร้อย`)

if (withData) {
  execFileSync("npx", ["tsx", "prisma/seed.ts"], {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
  })
}

console.log(`\nพร้อมใช้งาน ตั้งค่าใน .env.test หรือส่งเข้าไปตอนรันเทสต์:\n  DATABASE_URL="${TEST_DATABASE_URL}"`)
