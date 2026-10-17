# CodingThailand Academy — แพลตฟอร์มขายคอร์สออนไลน์

แอปตัวอย่างสำหรับคอร์ส **Software Testing / Unit Testing** — ขายคอร์ส, ตะกร้า + คูปอง, ชำระเงิน (จำลอง), คืนเงินรายคอร์ส, เรียนพร้อมติดตามความคืบหน้า, ใบประกาศนียบัตร, รีวิว และระบบหลังบ้าน

โค้ดออกแบบมาให้ **เขียนเทสต์ได้ง่าย** (pure function + repository pattern + dependency injection) และมีเอกสารออกแบบ test case ที่ [`docs/requirements/user-stories-and-test-cases.md`](docs/requirements/user-stories-and-test-cases.md)

สร้างด้วย Next.js 16 (App Router) + React 19, Prisma 7 + SQLite, Better Auth, shadcn/ui และ Tailwind CSS v4

---

## ความต้องการของระบบ

| รายการ | เวอร์ชัน | หมายเหตุ |
|--------|----------|----------|
| Node.js | **20.9.0 ขึ้นไป** | ตรวจด้วย `node -v` |
| npm | มากับ Node.js | ตรวจด้วย `npm -v` |
| Git | เวอร์ชันใดก็ได้ | |

> **ไม่ต้องติดตั้ง MySQL/MariaDB** โปรเจกต์นี้ใช้ SQLite ซึ่งเก็บข้อมูลเป็นไฟล์เดียวที่ `prisma/dev.db` สร้างขึ้นเองตอนตั้งค่า

---

## เริ่มต้นใช้งาน

### 1. Clone โปรเจกต์

```bash
git clone https://github.com/codingthailand/unit-testing-starter-app.git
cd unit-testing-starter-app
```

### 2. สร้างไฟล์ `.env`

```bash
cp .env.example .env
```

> Windows (Command Prompt) ใช้ `copy .env.example .env`

`DATABASE_URL` ในไฟล์ตั้งค่ามาให้เรียบร้อยแล้ว ไม่ต้องแก้

### 3. ตั้งค่า `BETTER_AUTH_SECRET`

**ขั้นตอนนี้ห้ามข้าม** ถ้าปล่อยว่างไว้ `npm run dev` จะยังรันได้ แต่ `npm run build` จะพังด้วยข้อความ `You are using the default secret`

สร้างค่าสุ่มด้วยคำสั่ง (ใช้ได้ทุกระบบปฏิบัติการ):

```bash
npx @better-auth/cli secret
```

แล้วนำค่าที่ได้ไปใส่ในไฟล์ `.env`:

```env
BETTER_AUTH_SECRET=ค่าที่สุ่มได้จากคำสั่งด้านบน
```

> บน macOS/Linux จะใช้ `openssl rand -base64 32` แทนก็ได้

### 4. ติดตั้ง dependencies

```bash
npm install
```

### 5. เตรียมฐานข้อมูล

```bash
npx prisma generate    # สร้าง Prisma Client ไปที่ generated/prisma/
npx prisma db push     # สร้างไฟล์ prisma/dev.db พร้อมตารางทั้งหมด
```

### 6. ใส่ข้อมูลตัวอย่าง (แนะนำ)

```bash
npm run db:seed
```

จะได้ 5 หมวดหมู่, 13 คอร์ส (มีคอร์สฟรี 1 และฉบับร่าง 1), บทเรียน ~75 บท, คูปอง 3 ใบ, ผู้ใช้ 22 คน และคำสั่งซื้อย้อนหลัง 90 วันนับจากวันที่รัน (ให้กราฟรายได้มีข้อมูล)

| บัญชีตัวอย่าง | รหัสผ่าน | หมายเหตุ |
|---|---|---|
| `admin@example.com` | `password123` | ผู้ดูแลระบบ เข้า `/admin` ได้ |
| `user@example.com` | `password123` | ซื้อคอร์ส React ไว้ 2 วันก่อน เรียนไป 1 บท (ยังขอคืนเงินได้) |
| `student01…20@example.com` | `password123` | ลูกค้าที่มีประวัติการสั่งซื้อ |

> รัน `npm run db:seed` ซ้ำได้ — จะลบข้อมูลคอร์ส/คำสั่งซื้อ และผู้ใช้ `@example.com` เดิมก่อนใส่ใหม่

### 7. รันเซิร์ฟเวอร์

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) ในเบราว์เซอร์

> ถ้ารันพอร์ตอื่น ต้องตั้ง `BETTER_AUTH_URL` ให้ตรงด้วย ไม่งั้น login จะขึ้น `Invalid origin` เช่น
> `BETTER_AUTH_URL=http://localhost:3100 npm run dev -- -p 3100`

---

## ฟีเจอร์และกติกาทางธุรกิจ (โจทย์สำหรับเขียนเทสต์)

| เรื่อง | กติกา | ไฟล์หลัก |
|---|---|---|
| เงิน | เก็บเป็น **สตางค์ (Int)** ทุกที่ แสดงผลด้วย `formatTHB` | `src/lib/shared/money.ts` |
| คูปอง | `PERCENT` (ปัดลงเป็นสตางค์ + เพดานส่วนลด) / `FIXED` ส่วนลดไม่เกินยอดรวม, 1 ใบต่อคำสั่งซื้อ | `src/lib/coupon/coupon-rules.ts` |
| กระจายส่วนลด | แบ่งตามสัดส่วนราคา เศษสตางค์ไปรายการสุดท้าย | `src/lib/checkout/allocate-discount.ts` |
| ชำระเงิน | Fake gateway: `4242424242424242` ผ่าน, `4000000000000002` ถูกปฏิเสธ, `4000000000000119` ระบบล่ม | `src/lib/payment/` |
| คืนเงิน | รายคอร์ส ภายใน **7 วัน** และเรียน **ไม่เกิน 20%** | `src/lib/refund/refund-policy.ts` |
| ความคืบหน้า | `floor(จบ / ทั้งหมด × 100)` ครบ 100% ออกใบประกาศ `CT-YYYY-XXXXXX` | `src/lib/learning/` |
| รีวิว | เฉพาะผู้ลงทะเบียน 1 คน 1 รีวิว/คอร์ส คะแนน 1–5 ความยาว 10–1000 | `src/lib/review/` |
| คอร์สฟรี | ดึงจาก API ภายนอก timeout 5 วินาที ล่มแล้วไม่พัง | `src/lib/free-course/` |
| รายได้รายวัน | นับเฉพาะ item ที่ PAID แบ่งวันตามเวลาไทย | `src/lib/admin/revenue.ts` |

## หน้าเว็บ

| หน้า | คำอธิบาย |
|---|---|
| `/` | หน้าแรก หมวดหมู่ คอร์สยอดนิยม |
| `/courses` | ค้นหา กรองหมวด/ระดับ เรียงลำดับ |
| `/courses/[slug]` | รายละเอียด หลักสูตร (บทแรกดูฟรี) รีวิว ปุ่มเพิ่มลงตะกร้า |
| `/cart` → `/checkout` | ตะกร้า (เก็บใน localStorage) ใช้คูปอง ชำระเงิน (ต้อง login) |
| `/orders`, `/orders/[id]` | ประวัติการสั่งซื้อ ขอคืนเงินรายคอร์ส |
| `/my-courses` | คอร์สที่ลงทะเบียนพร้อม progress |
| `/learn/[slug]/[lessonId]` | ดูวิดีโอ กด "เรียนจบบทนี้" |
| `/certificates/[code]` | ใบประกาศ (เปิดได้ไม่ต้อง login, พิมพ์ได้) |
| `/free-courses` | คอร์สฟรีจาก `api.codingthailand.com` |
| `/admin` | แดชบอร์ด กราฟรายได้ 7/30/90 วัน, จัดการคอร์ส/บทเรียน/คูปอง, คำสั่งซื้อ |

---

## โครงสร้างโค้ด (ออกแบบให้เทสต์ได้)

```
src/lib/<feature>/
  *-rules.ts / *-policy.ts / progress.ts ...   ← pure function: กฎทางธุรกิจ ไม่แตะ DB/เวลา/สุ่ม/env
  *-repository.ts                              ← interface + createPrismaXxxRepository(db)
  *-service.ts                                 ← createXxxService(deps) รู้จักแค่ interface
src/lib/validation/                            ← zod schema แยกจาก component
src/lib/repositories.ts                        ← รวม repository + UnitOfWork (transaction)
src/lib/container.ts                           ← composition root: ประกอบของจริงเข้าด้วยกัน
src/app/**/actions.ts, src/app/api/**          ← shell บาง ๆ: ตรวจสิทธิ์ → parse → เรียก service
```

- business error ไม่ throw แต่คืน `Result` ที่มี `error.code` (รายการทั้งหมดใน `src/lib/shared/errors.ts`)
- เวลาใช้ `Clock` ที่ inject ได้ (`fixedClock("2026-10-01T10:00:00+07:00")` ตอนเทสต์)
- ปุ่ม/ช่องกรอกทุกจุดมี `data-testid` สำหรับ E2E

---

## คำสั่งที่ใช้บ่อย

| งาน | คำสั่ง |
|-----|--------|
| รัน dev server | `npm run dev` |
| Build สำหรับ production | `npm run build` |
| รันตัวที่ build แล้ว | `npm start` |
| ตรวจ lint | `npm run lint` |
| ตรวจ type | `npx tsc --noEmit` |
| สร้าง Prisma Client ใหม่ | `npx prisma generate` |
| อัปเดตโครงสร้างฐานข้อมูล | `npx prisma db push` |
| ใส่ข้อมูลตัวอย่าง | `npm run db:seed` |
| สร้างฐานข้อมูลสำหรับทดสอบ (`prisma/test.db`) | `npm run db:test:setup` (`-- --empty` = ตารางเปล่า) |
| เปิดดู/แก้ข้อมูลผ่าน GUI | `npx prisma studio` |

> โปรเจกต์นี้ **ยังไม่ติดตั้ง test framework โดยตั้งใจ** — การติดตั้ง Vitest/Playwright เป็นส่วนหนึ่งของเนื้อหาคอร์ส

> **อัปเกรดจากเวอร์ชันร้านค้าเดิม:** schema เปลี่ยนทั้งหมด ให้ลบ `prisma/dev.db` เดิม (หรือสำรองไว้) แล้วรัน `npx prisma db push` และ `npm run db:seed` ใหม่

---

## ตัวแปรใน `.env`

| ตัวแปร | จำเป็น | คำอธิบาย |
|--------|--------|----------|
| `DATABASE_URL` | ✅ | ตำแหน่งไฟล์ SQLite ตั้งค่ามาให้แล้วเป็น `file:./prisma/dev.db` |
| `BETTER_AUTH_SECRET` | ✅ | กุญแจเข้ารหัส session ต้องสุ่มเอง (ดูขั้นตอนที่ 3) |
| `BETTER_AUTH_URL` | ✅ | URL ของเว็บ ตอนพัฒนาคือ `http://localhost:3000` (ต้องตรงกับพอร์ตที่รัน) |
| `COURSE_API_URL` | ❌ | ชี้ API คอร์สฟรีไปที่อื่น (เช่น mock server ตอน e2e) ถ้าไม่ตั้งจะใช้ API จริง |

> ไฟล์ `.env` ไม่ถูกเก็บลง Git (อยู่ใน `.gitignore`) อย่า commit ขึ้น repository

---

## หน้าผู้ดูแลระบบ (Admin)

ใช้บัญชี `admin@example.com` จาก seed หรือตั้งบัญชีของตัวเองเป็นแอดมินในฐานข้อมูล (ระบบไม่มีปุ่มเลื่อนขั้นตัวเอง):

```bash
sqlite3 prisma/dev.db "UPDATE user SET role='admin' WHERE email='อีเมลของคุณ';"
```

> เครื่องที่ไม่มี `sqlite3` ใช้ `npx prisma studio` แล้วแก้ช่อง `role` ในตาราง `user` เป็น `admin` จากนั้นออกจากระบบแล้วเข้าใหม่

> คอร์สที่มียอดขายแล้วลบไม่ได้ ให้ยกเลิกการเผยแพร่แทน
