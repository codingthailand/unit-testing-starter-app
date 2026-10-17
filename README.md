# ระบบ E-Commerce CodingThailand

เว็บแอปตัวอย่างสำหรับเรียนการเขียน Next.js — มีระบบสมาชิก ตะกร้าสินค้า รายการสินค้า และฟอร์มติดต่อ

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

### 6. ใส่ข้อมูลสินค้าตัวอย่าง (แนะนำ)

ถ้าข้ามขั้นนี้ ฐานข้อมูลจะว่างเปล่า หน้า `/product` จะไม่มีสินค้าแสดง และส่วน "สินค้าแนะนำ" บนหน้าแรกจะหายไปทั้งบล็อก

```bash
sqlite3 prisma/dev.db < docs/insert_data_ecom_example_50_products.sql
```

จะได้สินค้า 50 รายการ, 5 หมวดหมู่, ลูกค้าและคำสั่งซื้อตัวอย่าง

> Windows หรือเครื่องที่ไม่มีคำสั่ง `sqlite3` ใช้คำสั่งนี้แทน:
>
> ```bash
> node -e "const D=require('better-sqlite3'),f=require('fs');new D('prisma/dev.db').exec(f.readFileSync('docs/insert_data_ecom_example_50_products.sql','utf8'))"
> ```

### 7. รันเซิร์ฟเวอร์

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) ในเบราว์เซอร์

ลองสมัครสมาชิกที่ `/signup` แล้วเข้าสู่ระบบที่ `/login` และดูรายการสินค้าที่ `/product`

---

## คำสั่งที่ใช้บ่อย

| งาน | คำสั่ง |
|-----|--------|
| รัน dev server | `npm run dev` |
| รัน dev server พอร์ตอื่น | `npm run dev -- -p 3100` |
| Build สำหรับ production | `npm run build` |
| รันตัวที่ build แล้ว | `npm start` |
| ตรวจ lint | `npm run lint` |
| สร้าง Prisma Client ใหม่ | `npx prisma generate` |
| อัปเดตโครงสร้างฐานข้อมูล | `npx prisma db push` |
| สร้างฐานข้อมูลสำหรับทดสอบ | `npm run db:test:setup` |
| ใส่คำสั่งซื้อย้อนหลัง 90 วัน | `npm run db:seed:orders` |
| เปิดดู/แก้ข้อมูลผ่าน GUI | `npx prisma studio` |

> โปรเจกต์นี้ยังไม่มีการตั้งค่า test framework แต่โครงสร้างโค้ดเตรียมไว้ให้เขียนเทสต์ได้แล้ว (ดูหัวข้อถัดไป)

---

## ตัวแปรใน `.env`

| ตัวแปร | จำเป็น | คำอธิบาย |
|--------|--------|----------|
| `DATABASE_URL` | ✅ | ตำแหน่งไฟล์ SQLite ตั้งค่ามาให้แล้วเป็น `file:./prisma/dev.db` |
| `BETTER_AUTH_SECRET` | ✅ | กุญแจเข้ารหัส session ต้องสุ่มเอง (ดูขั้นตอนที่ 3) |
| `BETTER_AUTH_URL` | ✅ | URL ของเว็บ ตอนพัฒนาคือ `http://localhost:3000` |
| `RESEND_API_KEY` | ❌ | ใช้เฉพาะให้ฟอร์มติดต่อส่งอีเมลได้จริง |
| `CONTACT_FROM_EMAIL` | ❌ | อีเมลผู้ส่งของฟอร์มติดต่อ |
| `CONTACT_TO_EMAIL` | ❌ | อีเมลผู้รับของฟอร์มติดต่อ |
| `COURSE_API_URL` | ❌ | ชี้ API หลักสูตรไปที่อื่น ใช้ตอนรัน e2e ถ้าไม่ตั้งจะใช้ API จริง |

ถ้าไม่ตั้งค่า 3 ตัวล่าง ฟอร์มติดต่อจะยังใช้งานได้ตามปกติ แต่ตอนกดส่งจะขึ้นข้อความว่ายังไม่ได้ตั้งค่าการส่งอีเมล

> ไฟล์ `.env` ไม่ถูกเก็บลง Git (อยู่ใน `.gitignore`) อย่า commit ขึ้น repository

---

## หน้าผู้ดูแลระบบ (Admin)

เข้าที่ `/admin` — มีแดชบอร์ดสรุปยอดขายและหน้าจัดการสินค้าแบบ CRUD

**ต้องตั้งตัวเองเป็นแอดมินก่อน** ระบบไม่มีปุ่มให้เลื่อนขั้นตัวเอง (กันไม่ให้ใครก็สมัครแล้วเป็นแอดมินได้) ต้องแก้ในฐานข้อมูลโดยตรง:

```bash
sqlite3 prisma/dev.db "UPDATE user SET role='admin' WHERE email='อีเมลของคุณ';"
```

> เครื่องที่ไม่มี `sqlite3` ใช้ `npx prisma studio` แล้วแก้ช่อง `role` ในตาราง `user` เป็น `admin`

จากนั้นออกจากระบบแล้วเข้าใหม่ เพื่อให้ session อ่านค่า role ใหม่

**ใส่ข้อมูลให้กราฟมีอะไรดู** ข้อมูลตัวอย่างชุดหลักมีคำสั่งซื้อไม่กี่รายการและเป็นวันที่ตายตัว พอเวลาผ่านไปจะหลุดออกนอกช่วง 7/30/90 วัน ทำให้กราฟว่าง รันคำสั่งนี้เพื่อสร้างคำสั่งซื้อย้อนหลังโดยอิงวันที่ปัจจุบัน:

```bash
npm run db:seed:orders
```

**สิ่งที่ทำได้ในหน้า Admin**

| หน้า | ทำอะไรได้ |
|------|-----------|
| `/admin` | ดูยอดขายรวม จำนวนคำสั่งซื้อ สินค้า ลูกค้า, กราฟยอดขายเลือกช่วง 7/30/90 วัน, คำสั่งซื้อล่าสุด (รีเฟรชเองทุก 30 วินาที) |
| `/admin/products` | ค้นหา แบ่งหน้า เพิ่ม แก้ไข และลบสินค้า |

> สินค้าที่มีคนสั่งซื้อไปแล้วจะลบไม่ได้ ระบบจะขึ้นข้อความอธิบายแทนที่จะพัง
