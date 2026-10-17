# Requirement → User Stories → Test Case Design
### แพลตฟอร์มขายคอร์สออนไลน์ (CodingThailand Course Platform)

เอกสารนี้ใช้ประกอบการสอน unit testing โดยไล่จาก requirement → user story → acceptance criteria → test case design
แต่ละ test case ระบุเทคนิคที่ใช้ออกแบบ ระดับการทดสอบ และฟังก์ชันเป้าหมายในโค้ด

## 0. วิธีอ่านเอกสาร

| ตัวย่อ | ความหมาย |
|---|---|
| **EP** | Equivalence Partitioning — แบ่งกลุ่มข้อมูลที่ระบบปฏิบัติเหมือนกัน เลือกตัวแทนกลุ่มละ 1 ค่า |
| **BVA** | Boundary Value Analysis — ทดสอบค่าที่ขอบ (ขอบ−1, ขอบ, ขอบ+1) |
| **DT** | Decision Table — ทดสอบทุกการผสมของเงื่อนไขที่มีผลต่อผลลัพธ์ |
| **ST** | State Transition — ทดสอบการเปลี่ยนสถานะที่ถูกต้องและที่ต้องถูกปฏิเสธ |
| **EG** | Error Guessing — เคสที่มักผิดจากประสบการณ์ (null, ค่าว่าง, ปัดเศษ, timezone) |

| ระดับ | ความหมายในโปรเจกต์นี้ |
|---|---|
| **Unit** | pure function / mapper / zod schema / cart reducer และ **service ที่ inject fake repository** ไม่แตะ DB หรือเครือข่าย |
| **Integration** | service + Prisma ชี้ไปที่ `prisma/test.db` (`npm run db:test:setup`) inject `clock` / `paymentGateway` / `fetch` |
| **E2E** | เปิด browser จริงผ่าน `data-testid` |

> หน่วยเงินในเอกสารนี้: ค่าในโค้ดเป็น **สตางค์ (Int)** วงเล็บคือบาท เช่น `129050` (1,290.50 บาท)
> เวลา: ตีความด้วย timezone `Asia/Bangkok` (UTC+7) เสมอ
> Error: service และ pure rule คืน `Result` (`{ ok: true, value }` / `{ ok: false, error: { code, message } }`) — assert ที่ `error.code` (เช่น `COUPON_INACTIVE`) ส่วนข้อความภาษาไทยในตารางคือ `error.message` จาก `src/lib/shared/errors.ts`

### สถาปัตยกรรมที่เกี่ยวกับการเทสต์
```
Action/Route ─▶ Service ─▶ Repository interface ◀─ Prisma repo (Integration)
                  │                              ◀─ Fake repo   (Unit — ผู้เรียนเขียนเอง)
                  └─▶ Pure function (Unit ล้วน)
```

## 1. Requirement ภาพรวม

| ID | Requirement |
|---|---|
| R1 | ผู้ใช้สมัครสมาชิกและเข้าสู่ระบบด้วยอีเมล + รหัสผ่าน |
| R2 | ผู้เยี่ยมชมค้นหา กรอง และเรียงลำดับคอร์สได้ |
| R3 | ผู้เยี่ยมชมใส่คอร์สลงตะกร้าได้โดยไม่ต้อง login |
| R4 | ผู้ใช้ใช้คูปองส่วนลดได้ 1 ใบต่อคำสั่งซื้อ |
| R5 | ผู้ใช้ชำระเงินด้วยบัตร (fake gateway) แล้วได้สิทธิ์เข้าเรียนทันที |
| R6 | ผู้ใช้เรียนบทเรียน บันทึกความคืบหน้า และได้ใบประกาศเมื่อเรียนครบ |
| R7 | ผู้ใช้ขอคืนเงินรายคอร์สได้ภายในเงื่อนไขที่กำหนด |
| R8 | ผู้ใช้ที่ลงทะเบียนแล้วรีวิวและให้คะแนนคอร์สได้ |
| R9 | ระบบแสดงคอร์สฟรีจาก API ภายนอก และทำงานต่อได้แม้ API ล่ม |
| R10 | ผู้ดูแลระบบดูรายได้และจัดการคอร์ส/คูปองได้ ผู้ใช้ทั่วไปเข้าไม่ได้ |

---

## US-01 สมัครสมาชิก (R1)
> **ในฐานะ** ผู้เยี่ยมชม **ฉันต้องการ** สมัครสมาชิกด้วยชื่อ อีเมล และรหัสผ่าน **เพื่อ** ซื้อและเรียนคอร์สได้

**Acceptance Criteria**
- AC1 ชื่อยาว 2–50 ตัวอักษร
- AC2 อีเมลต้องอยู่ในรูปแบบที่ถูกต้อง
- AC3 รหัสผ่านอย่างน้อย `MIN_PASSWORD_LENGTH` (8) ตัวอักษร
- AC4 ยืนยันรหัสผ่านต้องตรงกัน

**เป้าหมาย:** `registerSchema` ใน `src/lib/auth-schema.ts` — Unit

| TC | เทคนิค | Input | Expected |
|---|---|---|---|
| TC-01-01 | EP (valid) | name `"สมชาย"`, email `"somchai@example.com"`, password/confirm `"password123"` | ผ่าน |
| TC-01-02 | BVA | name ยาว 1 ตัว `"ก"` | error `ชื่อต้องมีอย่างน้อย 2 ตัวอักษร` |
| TC-01-03 | BVA | name ยาว 2 ตัว | ผ่าน |
| TC-01-04 | BVA | name ยาว 50 ตัว | ผ่าน |
| TC-01-05 | BVA | name ยาว 51 ตัว | error `ชื่อต้องไม่เกิน 50 ตัวอักษร` |
| TC-01-06 | EP | name `""` | error `กรุณากรอกชื่อ` |
| TC-01-07 | EP | email `"somchai@"` | error `รูปแบบอีเมลไม่ถูกต้อง` |
| TC-01-08 | BVA | password ยาว 7 ตัว | error `รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร` |
| TC-01-09 | BVA | password ยาว 8 ตัว | ผ่าน |
| TC-01-10 | EP | confirm ≠ password | error `รหัสผ่านไม่ตรงกัน` ที่ path `confirmPassword` |
| TC-01-11 | EG | `MIN_PASSWORD_LENGTH` เทียบกับ `minPasswordLength` ใน `auth.ts` | ค่าเท่ากัน (กันสองที่ไม่ sync กัน) |
| TC-01-12 | E2E | สมัครผ่านหน้า `/signup` แล้ว login ที่ `/login` | เห็น `nav-user-name` |

**หลัง login กลับไปหน้าเดิม (`?next=`)** — `safeRedirectPath` ใน `src/lib/shared/redirect.ts` — Unit / EP + EG (security)

| TC | Input | Expected |
|---|---|---|
| TC-01-13 | `"/checkout"` | `"/checkout"` |
| TC-01-14 | `null` / `""` | `"/"` |
| TC-01-15 | `"https://evil.com"` | `"/"` (กัน open redirect) |
| TC-01-16 | `"//evil.com"` / `"/\\evil.com"` | `"/"` |

---

## US-02 ค้นหาและกรองคอร์ส (R2)
> **ในฐานะ** ผู้เยี่ยมชม **ฉันต้องการ** ค้นหาคอร์สจากชื่อ กรองตามหมวด/ระดับ และเรียงลำดับ **เพื่อ** หาคอร์สที่เหมาะกับฉัน

**Acceptance Criteria**
- AC1 `q` ถูก trim ถ้าเป็นค่าว่างถือว่าไม่ค้นหา และยาวสุด 100 ตัวอักษร
- AC2 `level` ที่ไม่รู้จักให้ถือว่าไม่กรอง (ไม่ error)
- AC3 `sort` ที่ไม่รู้จักให้ใช้ค่า default คือ `newest`
- AC4 ไม่แสดงคอร์สที่ `isPublished = false`

**เป้าหมาย:** `parseCatalogParams` (Unit), `getCourseList` (Integration)

| TC | เทคนิค | Input | Expected |
|---|---|---|---|
| TC-02-01 | EP | `{}` | `{ q: "", category: undefined, level: undefined, sort: "newest" }` |
| TC-02-02 | EG | `q: "  react  "` | `q: "react"` |
| TC-02-03 | BVA | `q` ยาว 100 / 101 ตัว | 100 ผ่าน / 101 ถูกตัดเหลือ 100 |
| TC-02-04 | EP | `level: "BEGINNER"` | `level: "BEGINNER"` |
| TC-02-05 | EP | `level: "EXPERT"` | `level: undefined` |
| TC-02-06 | EP | `sort` แต่ละค่า `newest`/`price-asc`/`price-desc`/`rating` | ได้ค่านั้นกลับมา |
| TC-02-07 | EP | `sort: "cheap"` | `sort: "newest"` |
| TC-02-08 | EG | searchParams เป็น array `q: ["a","b"]` | ใช้ค่าแรก `"a"` |
| TC-02-09 | Integration | ค้น `"test"` บน test.db | คืนเฉพาะคอร์สที่ชื่อมีคำนั้นและ published |
| TC-02-10 | Integration | `sort: "price-asc"` | ราคาเรียงจากน้อยไปมาก |
| TC-02-11 | Integration | DB มีคอร์ส unpublished | ไม่อยู่ในผลลัพธ์ |

**เรียงลำดับ** — `sortCourses(courses, sort)` ใน `src/lib/course/course-sort.ts` — Unit

| TC | เทคนิค | Input | Expected |
|---|---|---|---|
| TC-02-12 | EP | `price-asc` กับราคา `[2990, 990, 1890]` บาท | `[990, 1890, 2990]` |
| TC-02-13 | EG | `rating` โดยมีคอร์สที่ `averageRating = null` | คอร์สที่ไม่มีรีวิวอยู่ท้ายสุด |
| TC-02-14 | EG | `rating` คะแนนเท่ากัน 4.5 (รีวิว 2 กับ 10 รายการ) | คอร์สที่มีรีวิว 10 รายการขึ้นก่อน |
| TC-02-15 | EG (immutability) | เรียก `sortCourses(list, …)` | `list` เดิมไม่ถูกแก้ |
| TC-02-16 | EP | `toCatalogQueryString({ q: "react", sort: "newest" })` | `"?q=react"` (ไม่ใส่ค่า default) |

**Mapper** — `toCourseSummary(row)` ใน `src/lib/course/course-mapper.ts` — Unit

| TC | Input | Expected |
|---|---|---|
| TC-02-17 | row ที่มีบทเรียน 10 + 15 นาที และรีวิว `[5, 4, 4]` | `lessonCount: 2`, `totalMinutes: 25`, `averageRating: 4.3`, `reviewCount: 3` |
| TC-02-18 | row ที่ `level: "EXPERT"` (ข้อมูลเสีย) | `level: "BEGINNER"` ไม่ throw |

---

## US-03 ตะกร้าสินค้า (R3)
> **ในฐานะ** ผู้เยี่ยมชม **ฉันต้องการ** เพิ่มและลบคอร์สในตะกร้า **เพื่อ** ซื้อหลายคอร์สในครั้งเดียว

**Acceptance Criteria**
- AC1 คอร์สเดียวกันอยู่ในตะกร้าได้แค่ 1 รายการ (ไม่มีจำนวน)
- AC2 ตัวนับบน navbar แสดงจำนวนรายการ
- AC3 ยอดรวมคือผลรวม `priceSatang`
- AC4 ล้างตะกร้าหลัง checkout สำเร็จ

**เป้าหมาย:** pure reducer `addItem(state, item)` / `removeItem(state, courseId)` / `clearCart()` / `setCouponCode(state, code)` / `cartSubtotal(state)` ใน `src/stores/cart-store.ts` (Unit — ไม่ต้อง render React), หน้า `/cart` (E2E)

state: `{ items: CartItem[], couponCode: string | null }`

| TC | เทคนิค | ขั้นตอน | Expected |
|---|---|---|---|
| TC-03-01 | EP | ตะกร้าว่าง แล้วเพิ่มคอร์ส A | `items.length = 1` |
| TC-03-02 | EG | เพิ่มคอร์ส A ซ้ำ | `items.length` ยังเป็น 1 |
| TC-03-03 | EP | เพิ่ม A (`129050`) และ B (`50000`) | `subtotal = 179050` |
| TC-03-04 | EP | ลบ B | เหลือ A, `subtotal = 129050` |
| TC-03-05 | EG | ลบคอร์สที่ไม่มีอยู่ในตะกร้า | state ไม่เปลี่ยน ไม่ throw |
| TC-03-06 | EP | `clearCart()` | `{ items: [], couponCode: null }` |
| TC-03-08 | EG | `setCouponCode(state, "   ")` | `couponCode: null` |
| TC-03-09 | EG (immutability) | `addItem(state, A)` | `state` เดิมไม่ถูกแก้ และ `couponCode` เดิมยังอยู่ |
| TC-03-07 | E2E | กด `add-to-cart` ที่หน้า detail | `nav-cart` แสดง 1 |

---

## US-04 ใช้คูปองส่วนลด (R4)
> **ในฐานะ** ผู้ซื้อ **ฉันต้องการ** กรอกโค้ดคูปอง **เพื่อ** ได้ส่วนลด

**กติกา**
- `PERCENT`: ส่วนลด = `floor(subtotal × value / 100)` และถ้ามี `maxDiscountSatang` ส่วนลดต้องไม่เกินค่านั้น
- `FIXED`: ส่วนลด = `value`
- ทุกแบบ: ส่วนลดไม่เกิน subtotal (ยอดสุทธิต่ำสุด 0)
- โค้ดไม่สนตัวพิมพ์เล็ก/ใหญ่และถูก trim ส่วนคูปองที่ `isActive = false` ใช้ไม่ได้

**เป้าหมาย:** pure `calculateDiscount`, `normalizeCouponCode`, `checkCouponUsable` ใน `src/lib/coupon/coupon-rules.ts` (Unit) และ `couponService.findUsableCoupon(rawCode)` ใน `coupon-service.ts` (Unit ด้วย fake `CouponRepository`)

คูปองตัวอย่าง: `WELCOME20` = PERCENT 20 cap `50000` (500 บาท), `SAVE200` = FIXED `20000` (200 บาท), `OLDCODE` = inactive

| TC | เทคนิค | คูปอง | subtotal | Expected discount |
|---|---|---|---|---|
| TC-04-01 | EP | WELCOME20 | `129050` (1,290.50) | `25810` |
| TC-04-02 | EG (ปัดเศษ) | WELCOME20 | `99999` | `19999` (19,999.8 ปัดลง) |
| TC-04-03 | BVA (cap−) | WELCOME20 | `249995` | `49999` |
| TC-04-04 | BVA (cap) | WELCOME20 | `250000` | `50000` |
| TC-04-05 | BVA (cap+) | WELCOME20 | `300000` | `50000` (โดน cap) |
| TC-04-06 | EP | PERCENT 20 ไม่มี cap | `300000` | `60000` |
| TC-04-07 | EP | SAVE200 | `129050` | `20000` |
| TC-04-08 | BVA | SAVE200 | `20000` | `20000` (ยอดสุทธิ 0) |
| TC-04-09 | BVA | SAVE200 | `15000` | `15000` (ไม่เกิน subtotal) |
| TC-04-10 | BVA | PERCENT 100 | `129050` | `129050` |
| TC-04-11 | EG | ใดก็ได้ | `0` | `0` |

| TC | เทคนิค | Input ของ `couponService.findUsableCoupon` | Expected |
|---|---|---|---|
| TC-04-12 | EP | `"welcome20"` | พบคูปอง WELCOME20 |
| TC-04-13 | EG | `"  WELCOME20 "` | พบคูปอง WELCOME20 |
| TC-04-14 | EP | `"OLDCODE"` | `COUPON_INACTIVE` — `คูปองนี้ใช้งานไม่ได้แล้ว` |
| TC-04-15 | EP | `"NOPE"` | `COUPON_NOT_FOUND` — `ไม่พบคูปองนี้` |
| TC-04-16 | EP | `""` หรือ `"   "` | `COUPON_REQUIRED` — `กรุณากรอกโค้ดคูปอง` (ไม่เรียก repository เลย — ตรวจด้วย spy) |

**ตรวจ schema สร้างคูปอง (admin)** — `couponSchema` ใน `src/lib/validation/coupon-schema.ts` (กรอกเป็นบาท แปลงเป็นสตางค์ตอน transform) — Unit / BVA

| TC | Input | Expected |
|---|---|---|
| TC-04-17 | PERCENT value `0` / `1` / `100` / `101` | ไม่ผ่าน / ผ่าน / ผ่าน / ไม่ผ่าน |
| TC-04-18 | FIXED value `0` / `1` | ไม่ผ่าน / ผ่าน |
| TC-04-19 | `couponService.createCoupon` ด้วย code ซ้ำ | `COUPON_CODE_TAKEN` — `โค้ดนี้ถูกใช้แล้ว` |
| TC-04-20 | FIXED value `199.99` บาท | ผ่าน และ `value = 19999` (สตางค์) |
| TC-04-21 | code `"ab"` / `"abc"` / `"A".repeat(21)` | ไม่ผ่าน / ผ่าน (กลายเป็น `"ABC"`) / ไม่ผ่าน |

---

## US-05 กระจายส่วนลดลงแต่ละคอร์ส (R4, R7)
> **ในฐานะ** ระบบ **ฉันต้องการ** บันทึกยอดที่จ่ายจริงของแต่ละคอร์ส **เพื่อ** คืนเงินรายคอร์สได้ถูกต้อง

**กติกา:** กระจายตามสัดส่วนราคา ใช้ `floor` แล้วยกเศษสตางค์ที่เหลือไปไว้ที่รายการสุดท้าย
**Invariant:** `sum(discounts) === discount` และ `0 ≤ discount_i ≤ price_i`

**เป้าหมาย:** `allocateDiscount(prices, discount)` — Unit

| TC | เทคนิค | prices | discount | Expected |
|---|---|---|---|---|
| TC-05-01 | EP | `[100000, 50000]` | `30000` | `[20000, 10000]` |
| TC-05-02 | EG (เศษ) | `[33333, 33333, 33334]` | `10000` | `[3333, 3333, 3334]` |
| TC-05-03 | EP | `[129050]` | `25810` | `[25810]` |
| TC-05-04 | BVA | `[100000, 50000]` | `0` | `[0, 0]` |
| TC-05-05 | BVA | `[100000, 50000]` | `150000` | `[100000, 50000]` |
| TC-05-06 | EG | `[0, 50000]` (มีคอร์สฟรี) | `10000` | `[0, 10000]` |
| TC-05-07 | EG | `[]` | `0` | `[]` |
| TC-05-08 | EG (property) | สุ่ม prices/discount 1,000 ชุด | invariant เป็นจริงทุกชุด |

---

## US-06 ชำระเงินและลงทะเบียน (R5)
> **ในฐานะ** ผู้ใช้ที่ login แล้ว **ฉันต้องการ** ชำระเงินด้วยบัตร **เพื่อ** เข้าเรียนคอร์สได้ทันที

**Acceptance Criteria**
- AC1 ต้อง login ก่อน checkout
- AC2 server ดึงราคาจาก DB เอง (ไม่เชื่อราคาที่ client ส่งมา)
- AC3 ซื้อคอร์สที่ลงทะเบียน ACTIVE อยู่แล้ว หรือคอร์สที่ unpublished ไม่ได้
- AC4 ถ้าจ่ายสำเร็จ → Order `PAID`, OrderItem `PAID`, Enrollment `ACTIVE`
- AC5 ถ้าบัตรถูกปฏิเสธ → Order `FAILED` (item ค้างเป็น `PENDING`) ไม่มี Enrollment และคืน `PAYMENT_DECLINED`
- AC6 ถ้ายอดสุทธิเป็น 0 → ไม่เรียก gateway แต่ order เป็น `PAID`

บัตรทดสอบ (`createFakePaymentGateway` ใน `src/lib/payment/fake-payment-gateway.ts`): `4242424242424242` ผ่าน, `4000000000000002` ถูกปฏิเสธ, `4000000000000119` throw (จำลองระบบล่ม) — เลขอื่นถูกปฏิเสธ

**เป้าหมาย:** `buildCheckoutQuote` ใน `checkout-quote.ts` (Unit ล้วน — ทุกกฎ R1–R4 ทดสอบได้ที่นี่โดยไม่มี DB), `createCheckoutService(deps).checkout()` — Unit (fake repositories + fake `UnitOfWork` + stub `PaymentGateway` + `fixedClock`) และ Integration (`createPrismaRepositories(testPrisma)` บน test.db)

**Decision Table**

| เงื่อนไข / กฎ | R1 | R2 | R3 | R4 | R5 | R6 | R7 |
|---|---|---|---|---|---|---|---|
| ตะกร้าว่าง | Y | N | N | N | N | N | N |
| มีคอร์ส unpublished/ไม่มีอยู่ | – | Y | N | N | N | N | N |
| มีคอร์สที่ลงทะเบียนแล้ว | – | – | Y | N | N | N | N |
| คูปองไม่ถูกต้อง | – | – | – | Y | N | N | N |
| ยอดสุทธิ = 0 | – | – | – | – | Y | N | N |
| gateway อนุมัติ | – | – | – | – | – | Y | N |
| **ผลลัพธ์** | `CART_EMPTY` | `COURSE_NOT_AVAILABLE` | `ALREADY_ENROLLED` | error ตาม US-04 | PAID, ไม่เรียก gateway | PAID + Enrollment | `PAYMENT_DECLINED` + Order FAILED ไม่มี Enrollment |
| **สร้าง Order?** | ไม่ | ไม่ | ไม่ | ไม่ | ใช่ | ใช่ | ใช่ |

| TC | กฎ | Expected เพิ่มเติม |
|---|---|---|
| TC-06-01 … 07 | R1–R7 ตามตาราง | ตรวจทั้งค่าที่คืนและแถวใน DB |
| TC-06-08 | R6 + WELCOME20 | `subtotal/discount/total` ตรงกับ US-04 และ `sum(item.paidSatang) = total` |
| TC-06-09 | R6 | `gateway.charge` ถูกเรียก 1 ครั้งด้วย `amount = totalSatang` (spy) |
| TC-06-10 | R5 | `gateway.charge` ไม่ถูกเรียกเลย |
| TC-06-11 | EG | client ส่ง `priceSatang: 1` มา | ระบบใช้ราคาจาก DB |
| TC-06-12 | EG | gateway throw (เครือข่ายล่ม) | Order `FAILED` แล้ว `PAYMENT_ERROR` — `ชำระเงินไม่สำเร็จ กรุณาลองใหม่` |
| TC-06-16 | EG | `requestedCourseIds: [7, 7]` | quote มี 1 item (ตัดซ้ำ) |
| TC-06-13 | ST | ซื้อซ้ำคอร์สที่เคยคืนเงิน (enrollment `REVOKED`) | ซื้อได้ และ enrollment แถวเดิมกลับเป็น `ACTIVE` |
| TC-06-14 | E2E | ไม่ login แล้วเปิด `/checkout` | redirect ไป `/login?next=/checkout` แล้ว login เสร็จกลับมาหน้าเดิม |
| TC-06-15 | E2E | flow ซื้อครบด้วยบัตรผ่าน | เห็นคอร์สใน `/my-courses` และตะกร้าว่าง |

---

## US-07 เรียนและบันทึกความคืบหน้า (R6)
> **ในฐานะ** ผู้เรียน **ฉันต้องการ** กด "เรียนจบบทนี้" แล้วเห็น % ความคืบหน้า **เพื่อ** รู้ว่าเหลืออีกเท่าไร

**Acceptance Criteria**
- AC1 progress = `floor(completed / total × 100)` ถ้า total = 0 ให้ได้ 0 และผลลัพธ์ไม่เกิน 100
- AC2 กดจบบทเดิมซ้ำไม่เพิ่ม progress (idempotent)
- AC3 บท `isPreview` ดูได้ทุกคน ส่วนบทอื่นต้องมี enrollment `ACTIVE`

**เป้าหมาย:** pure `calculateProgressPercent` (`src/lib/learning/progress.ts`) และ `canAccessLesson({ isPreview, enrollmentStatus })` (`src/lib/enrollment/access-rules.ts`) — Unit; `learningService.completeLesson` / `getLessonPage` — Unit (fake repo) และ Integration

| TC | เทคนิค | Input | Expected |
|---|---|---|---|
| TC-07-01 | BVA | `(0, 5)` | `0` |
| TC-07-02 | EP | `(1, 5)` | `20` |
| TC-07-03 | EG (ปัดลง) | `(1, 3)` / `(2, 3)` | `33` / `66` |
| TC-07-04 | BVA | `(5, 5)` | `100` |
| TC-07-05 | EG | `(0, 0)` | `0` (ไม่ใช่ `NaN`) |
| TC-07-06 | EG | `(6, 5)` | `100` (clamp) |
| TC-07-07 | Integration | `completeLesson` บทเดิม 2 ครั้ง | มี LessonProgress 1 แถว |
| TC-07-08 | DT | บท preview + ไม่ login (`enrollmentStatus: null`) | เข้าได้ |
| TC-07-09 | DT | บทปกติ + ไม่ login | เข้าไม่ได้ |
| TC-07-10 | DT | บทปกติ + enrollment `ACTIVE` | เข้าได้ |
| TC-07-11 | DT | บทปกติ + enrollment `REVOKED` | เข้าไม่ได้ |
| TC-07-13 | Unit (service) | `completeLesson` โดยไม่มี enrollment | `NOT_ENROLLED` และ `progress.markCompleted` ไม่ถูกเรียก |
| TC-07-14 | Unit (service) | `getLessonPage` บทปกติ ไม่ login | `UNAUTHENTICATED` (หน้าเว็บ redirect ไป login) |
| TC-07-12 | E2E | กด `lesson-complete` | `progress-percent` เปลี่ยนเป็นค่าใหม่ |

---

## US-08 ใบประกาศนียบัตร (R6)
> **ในฐานะ** ผู้เรียน **ฉันต้องการ** ได้ใบประกาศเมื่อเรียนครบ 100% **เพื่อ** ใช้ยืนยันว่าเรียนจบ

**Acceptance Criteria**
- AC1 ออกใบประกาศอัตโนมัติเมื่อบทสุดท้ายทำให้ progress = 100
- AC2 ออก 1 ใบต่อผู้ใช้ต่อคอร์สเท่านั้น
- AC3 รหัสมีรูปแบบ `CT-YYYY-XXXXXX` — ปีตาม `clock` ใน timezone ไทย (`toBusinessYear`), ส่วนท้ายจาก `generateCode` ที่ inject เข้ามา (`formatCertificateCode` เป็น pure)
- AC4 `/certificates/[code]` เปิดดูได้โดยไม่ต้อง login ถ้ารหัสไม่มีอยู่ให้แสดงหน้า 404

| TC | เทคนิค | สถานการณ์ | Expected |
|---|---|---|---|
| TC-08-01 | BVA | จบบท 4/5 | ยังไม่มี Certificate |
| TC-08-02 | BVA | จบบท 5/5 | มี Certificate 1 ใบ |
| TC-08-03 | EG | กดจบบทสุดท้ายซ้ำ | ยังมี 1 ใบ และ `generateCode` ไม่ถูกเรียกซ้ำ |
| TC-08-04 | EP | clock = `2026-10-17` และ stub code `ABC123` | `code = "CT-2026-ABC123"` |
| TC-08-05 | E2E | เปิด `/certificates/CT-0000-XXXXXX` | หน้า 404 |
| TC-08-06 | EG (timezone) | clock = `2026-12-31T18:00:00Z` (= 1 ม.ค. 2027 เวลาไทย) | `code` ขึ้นต้น `CT-2027-` |

---

## US-09 ขอคืนเงินรายคอร์ส (R7)
> **ในฐานะ** ผู้ซื้อ **ฉันต้องการ** ขอคืนเงินคอร์สที่ไม่ถูกใจ **เพื่อ** ได้เงินคืน

**กติกา** (`src/lib/refund/refund-policy.ts`)
- `REFUND_WINDOW_DAYS = 7`: คืนได้ถ้า `now − paidAt ≤ 7 × 24 ชม.` (นับรวมขอบ)
- `REFUND_MAX_PROGRESS_PERCENT = 20`: คืนได้ถ้า progress ≤ 20
- item ต้องมีสถานะ `PAID`
- ยอดที่คืน = `orderItem.paidSatang`

**เป้าหมาย:** pure `canRefund({ itemStatus, paidAt, progressPercent }, now)` ใน `src/lib/refund/refund-policy.ts` (Unit), `refundService.refundOrderItem` (Unit ด้วย fake repo + fake `UnitOfWork`, และ Integration)

กำหนด `paidAt = 2026-10-01T10:00:00+07:00`

| TC | เทคนิค | now | progress | status | Expected |
|---|---|---|---|---|---|
| TC-09-01 | EP | `2026-10-03T10:00+07:00` | 0 | PAID | อนุญาต |
| TC-09-02 | BVA | `2026-10-08T09:59:59.999+07:00` | 0 | PAID | อนุญาต |
| TC-09-03 | BVA | `2026-10-08T10:00:00.000+07:00` (ครบ 7 วันพอดี) | 0 | PAID | อนุญาต |
| TC-09-04 | BVA | `2026-10-08T10:00:00.001+07:00` | 0 | PAID | `REFUND_WINDOW_EXPIRED` — `เกินระยะเวลาขอคืนเงิน 7 วัน` |
| TC-09-05 | BVA | วันที่ 3 | 19 | PAID | อนุญาต |
| TC-09-06 | BVA | วันที่ 3 | 20 | PAID | อนุญาต |
| TC-09-07 | BVA | วันที่ 3 | 21 | PAID | `REFUND_PROGRESS_EXCEEDED` — `เรียนเกิน 20% แล้ว ไม่สามารถคืนเงินได้` |
| TC-09-08 | EP | วันที่ 3 | 0 | REFUNDED | `REFUND_ALREADY_REFUNDED` — `รายการนี้คืนเงินไปแล้ว` |
| TC-09-08b | EP | วันที่ 3 | 0 | PENDING (หรือ `paidAt = null`) | `REFUND_NOT_PAID` |
| TC-09-09 | DT | วันที่ 10 | 50 | PAID | `REFUND_WINDOW_EXPIRED` (รายงานเหตุผลแรกตามลำดับ: สถานะ → เวลา → progress) |
| TC-09-10 | EG | `now` อยู่ก่อน `paidAt` (นาฬิกาเพี้ยน) | 0 | PAID | อนุญาต |

**State Transition**

```
OrderItem:  PAID ──refund──▶ REFUNDED     (REFUNDED ──refund──▶ ✗)
Enrollment: ACTIVE ──refund──▶ REVOKED ──ซื้อใหม่──▶ ACTIVE
```

| TC | เทคนิค | สถานการณ์ | Expected |
|---|---|---|---|
| TC-09-11 | ST | refund item ที่เป็น PAID | item `REFUNDED` + `refundedAt = now`, enrollment `REVOKED` |
| TC-09-12 | ST | refund ซ้ำ | error และ DB ไม่เปลี่ยน |
| TC-09-13 | Integration | order มี 2 คอร์ส แล้ว refund คอร์สเดียว | อีกคอร์สยัง `PAID`/`ACTIVE` |
| TC-09-14 | Integration | ผู้ใช้มีรีวิวคอร์สนั้นอยู่ | รีวิวถูกลบ |
| TC-09-15 | Security | user B ขอ refund item ของ user A | `ORDER_ITEM_NOT_FOUND` — `ไม่พบรายการนี้` |
| TC-09-16 | EG (อภิปราย) | progress จริง 20.9% → `floor` ได้ 20 | อนุญาต — ใช้ถกในห้องว่าเป็นพฤติกรรมที่ต้องการหรือไม่ |
| TC-09-17 | E2E | progress เกิน 20% | `refund-button-{itemId}` เป็น disabled และ `refund-reason-{itemId}` แสดงเหตุผล |
| TC-09-18 | Unit (service) | คืนเงินสำเร็จ | `uow.run` ถูกเรียก 1 ครั้ง และใน callback เรียก `markItemRefunded` → `revoke` → `reviews.delete` |

---

## US-10 รีวิวคอร์ส (R8)
> **ในฐานะ** ผู้เรียน **ฉันต้องการ** ให้ดาวและเขียนรีวิว **เพื่อ** แบ่งปันความเห็นกับผู้อื่น

**Acceptance Criteria**
- AC1 `rating` เป็นจำนวนเต็ม 1–5
- AC2 `comment` ยาว 10–1000 ตัวอักษร (นับหลัง trim)
- AC3 ต้องมี enrollment `ACTIVE` ถ้ารีวิวซ้ำคือแก้ไขรีวิวเดิม (1 คน 1 รีวิวต่อคอร์ส)
- AC4 คะแนนเฉลี่ยปัดเป็นทศนิยม 1 ตำแหน่ง ถ้ายังไม่มีรีวิวให้ได้ `null`

**เป้าหมาย:** `reviewSchema` (`src/lib/validation/review-schema.ts`), pure `averageRating` / `canReview` (`src/lib/review/review-rules.ts`) — Unit; `reviewService.submitReview` — Unit (fake repo) และ Integration

| TC | เทคนิค | Input | Expected |
|---|---|---|---|
| TC-10-01 | BVA | rating `0` / `1` / `5` / `6` | ไม่ผ่าน / ผ่าน / ผ่าน / ไม่ผ่าน |
| TC-10-02 | EP | rating `3.5` | ไม่ผ่าน `คะแนนต้องเป็นจำนวนเต็ม 1–5` |
| TC-10-03 | BVA | comment ยาว 9 / 10 / 1000 / 1001 | ไม่ผ่าน / ผ่าน / ผ่าน / ไม่ผ่าน |
| TC-10-04 | EG | comment `"          ดี"` (มีช่องว่าง) | นับหลัง trim ได้ 2 ตัว → ไม่ผ่าน |
| TC-10-05 | EP | `averageRating([])` | `null` |
| TC-10-06 | EP | `averageRating([5, 4, 4])` | `4.3` |
| TC-10-07 | EG | `averageRating([5, 4])` | `4.5` |
| TC-10-08 | DT | ไม่มี enrollment | `REVIEW_NOT_ENROLLED` — `ต้องลงทะเบียนคอร์สก่อนจึงรีวิวได้` |
| TC-10-09 | DT | enrollment `REVOKED` | error เดียวกับ TC-10-08 |
| TC-10-10 | Integration | รีวิวซ้ำด้วย rating ใหม่ | มีรีวิว 1 แถวที่ rating ถูกอัปเดต |

---

## US-11 คอร์สฟรีจาก API ภายนอก (R9)
> **ในฐานะ** ผู้เยี่ยมชม **ฉันต้องการ** ดูรายการคอร์สฟรี **เพื่อ** ลองเรียนก่อนตัดสินใจซื้อ

**Acceptance Criteria**
- AC1 ใช้ `COURSE_API_URL` ถ้ามีกำหนดไว้ ถ้าไม่มีใช้ `https://api.codingthailand.com/api/course`
- AC2 timeout ตาม `timeoutMs` (ค่า default 5000)
- AC3 ถ้า API ล่ม, timeout หรือรูปแบบข้อมูลผิด → `{ courses: [], error: true }` โดยหน้าเว็บไม่พัง

**เป้าหมาย:** `fetchFreeCourses({ fetch, baseUrl, timeoutMs })` ใน `src/lib/free-course/free-course-client.ts` — Unit (inject `fetch` ปลอม — ไม่ต้องต่อเน็ต), E2E (ตั้ง `COURSE_API_URL` ไปที่ mock server)

รูปแบบ response จริง: `{ "data": [{ id, title, detail, date, view, picture }] }`

| TC | เทคนิค | `fetch` ปลอมคืนค่า | Expected |
|---|---|---|---|
| TC-11-01 | EP | 200 + ข้อมูลถูกต้อง 3 รายการ | `courses.length = 3`, `error: false` |
| TC-11-02 | EP | 200 + `[]` | `courses: []`, `error: false` |
| TC-11-03 | EP | 500 | `courses: []`, `error: true` |
| TC-11-04 | EG | 200 + JSON ผิดรูปแบบ (ขาด `title`) | `error: true` |
| TC-11-05 | EG | reject (network error) | `error: true` ไม่ throw |
| TC-11-06 | BVA | `fetch` ที่ไม่ resolve เลย + `timeoutMs: 100` (หรือใช้ fake timers) | `error: true` |
| TC-11-07 | EP | มี `baseUrl` | `fetch` ถูกเรียกด้วย URL นั้น (spy) |
| TC-11-08 | E2E | ตั้ง `COURSE_API_URL` เป็น URL ที่ใช้ไม่ได้ | หน้า `/free-courses` แสดงข้อความ `ไม่สามารถโหลดคอร์สฟรีได้ในขณะนี้` |

---

## US-12 Dashboard รายได้ (R10)
> **ในฐานะ** ผู้ดูแลระบบ **ฉันต้องการ** ดูกราฟรายได้รายวันย้อนหลัง 7/30/90 วัน **เพื่อ** ติดตามยอดขาย

**กติกา**
- `parsePeriod`: รับ `7d`/`30d`/`90d` ถ้าค่าอื่นหรือไม่ส่งมาให้ได้ `30d`
- รายได้ = ผลรวม `paidSatang` ของ OrderItem ที่สถานะ `PAID` (ไม่นับ `REFUNDED` และ order ที่ `FAILED`)
- จัดกลุ่มตามวันที่ใน `Asia/Bangkok` วันที่ไม่มียอดต้องได้ 0 และ period `7d` ต้องได้ 7 จุดซึ่งรวมวันนี้ด้วย

**เป้าหมาย:** pure `parsePeriod` (`src/lib/admin/period.ts`), `groupRevenueByDay(items, period, now, timeZone?)` / `lastDateKeys` (`revenue.ts`), `buildDashboardStats` (`stats.ts`) — Unit; `GET /api/admin/revenue` — Integration

| TC | เทคนิค | Input | Expected |
|---|---|---|---|
| TC-12-01 | EP | `"7d"` / `"30d"` / `"90d"` | ได้ค่านั้นกลับมา |
| TC-12-02 | EP | `undefined` / `"1y"` | `"30d"` |
| TC-12-03 | BVA | period `7d`, now = `2026-10-17T12:00+07:00` | 7 จุด ตั้งแต่ `2026-10-11` ถึง `2026-10-17` |
| TC-12-04 | EG (timezone) | item ที่ `paidAt = 2026-10-16T17:30:00Z` | นับเป็นวันที่ `2026-10-17` |
| TC-12-05 | BVA | item ที่ `2026-10-10T23:59:59+07:00` (นอกช่วง) | ไม่ถูกนับ |
| TC-12-06 | EP | วันที่ไม่มีการขาย | จุดนั้นได้ `0` |
| TC-12-07 | EP | มี item `REFUNDED` | ไม่ถูกนับ |
| TC-12-08 | EP | 2 item ในวันเดียวกัน | รวมเป็นจุดเดียว |
| TC-12-09 | EG | `buildDashboardStats` ที่ `paidOrders = 0` | `averageOrderSatang: 0` (ไม่หารด้วยศูนย์) |
| TC-12-10 | EP | `paidItems: 94, refundedItems: 6` | `refundRatePercent: 6` |

---

## US-13 สิทธิ์ผู้ดูแลระบบ (R10)
> **ในฐานะ** เจ้าของระบบ **ฉันต้องการ** ให้เฉพาะ admin เข้าหน้า `/admin` และ `/api/admin/*` ได้ **เพื่อ** ปกป้องข้อมูลยอดขาย

**เป้าหมาย:** pure `authorizeAdmin(user)` (Unit), adapter `requireAdmin` + route handler (Integration), E2E

| TC | เทคนิค | session | Expected |
|---|---|---|---|
| TC-13-01 | EP | ไม่มี | `UNAUTHENTICATED` → หน้าเว็บ redirect `/login?next=/admin` และ API ตอบ `401` |
| TC-13-02 | EP | role `user` | `FORBIDDEN` → หน้าเว็บ redirect `/` และ API ตอบ `403` |
| TC-13-03 | EP | role `admin` | เข้าได้ |
| TC-13-04 | EG | role `"Admin"` (ตัวพิมพ์ใหญ่) | ไม่ถือว่าเป็น admin (เทียบค่าตรงตัว) |

**แปลง error code เป็น HTTP status** — `httpStatusForError(code)` ใน `src/lib/shared/http.ts` — Unit / EP

| TC | Input | Expected |
|---|---|---|
| TC-13-05 | `UNAUTHENTICATED` / `FORBIDDEN` | `401` / `403` |
| TC-13-06 | `COUPON_NOT_FOUND`, `ORDER_ITEM_NOT_FOUND` (ลงท้าย `_NOT_FOUND`) | `404` |
| TC-13-07 | `VALIDATION_FAILED` / `ALREADY_ENROLLED` | `400` / `422` |

---

## US-14 แสดงราคาเป็นเงินบาท (ใช้ร่วมกันทุกหน้า)
**เป้าหมาย:** `formatTHB(satang)` ใน `src/lib/money.ts` — Unit

| TC | เทคนิค | Input | Expected |
|---|---|---|---|
| TC-14-01 | BVA | `0` | `"฿0.00"` |
| TC-14-02 | EP | `129050` | `"฿1,290.50"` |
| TC-14-03 | BVA | `1` | `"฿0.01"` |
| TC-14-04 | EP | `100000000` | `"฿1,000,000.00"` |
| TC-14-05 | EP | `bahtToSatang(1290.5)` | `129050` |
| TC-14-06 | EG | `bahtToSatang(0.1 + 0.2)` | `30` (ไม่ใช่ `30.000000000000004`) |
| TC-14-07 | BVA | `formatDuration(59)` / `(60)` / `(61)` | `"59 นาที"` / `"1 ชม."` / `"1 ชม. 1 นาที"` |

---

## ภาคผนวก: Traceability Matrix

| Requirement | User Story | ฟังก์ชันหลัก | Unit | Integration | E2E |
|---|---|---|---|---|---|
| R1 | US-01 | `registerSchema` | ✔ | | ✔ |
| R2 | US-02 | `parseCatalogParams`, `getCourseList` | ✔ | ✔ | |
| R3 | US-03 | `addItem`/`removeItem`/`setCouponCode`/`cartSubtotal` (reducer) | ✔ | | ✔ |
| R4 | US-04, US-05 | `calculateDiscount`, `checkCouponUsable`, `findUsableCoupon`, `allocateDiscount` | ✔ | ✔ | ✔ |
| R5 | US-06 | `buildCheckoutQuote`, `checkout` | ✔ | ✔ | ✔ |
| R6 | US-07, US-08 | `calculateProgressPercent`, `canAccessLesson`, `formatCertificateCode`, `completeLesson` | ✔ | ✔ | ✔ |
| R7 | US-09 | `canRefund`, `refundOrderItem` | ✔ | ✔ | ✔ |
| R8 | US-10 | `reviewSchema`, `averageRating`, `canReview`, `submitReview` | ✔ | ✔ | ✔ |
| R9 | US-11 | `fetchFreeCourses` | ✔ | | ✔ |
| R10 | US-12, US-13 | `groupRevenueByDay`, `buildDashboardStats`, `authorizeAdmin`, `httpStatusForError` | ✔ | ✔ | ✔ |

## ภาคผนวก: ลำดับการสอนที่แนะนำ
1. **Unit ล้วน (ไม่มี dependency):** US-14 `formatTHB` → US-07 `calculateProgressPercent` → US-04 `calculateDiscount` (EP/BVA)
2. **Schema validation:** US-01, US-10 (ทดสอบ zod)
3. **Invariant / property:** US-05 `allocateDiscount`
4. **เวลาและ timezone:** US-09 `canRefund`, US-12 `groupRevenueByDay` (inject clock / fake timers)
5. **Test double:** US-11 (stub `fetch`), US-06 (spy/stub `PaymentGateway` + เขียน in-memory repository เองเพื่อเทสต์ service โดยไม่มี DB)
6. **Mapper / Repository:** `toCourseSummary` (Unit) แล้วต่อด้วย Prisma repository บน test.db
7. **Integration กับ DB:** US-06, US-09 State Transition (`prisma/test.db`)
8. **E2E:** flow ซื้อ → เรียน → คืนเงิน ผ่าน `data-testid`

## ภาคผนวก: แผนที่โค้ด — จะเทสต์อะไร ไปดูที่ไหน

| ชั้น | ตำแหน่ง | วิธีเทสต์ |
|---|---|---|
| Pure rule | `src/lib/**/*-rules.ts`, `*-policy.ts`, `progress.ts`, `allocate-discount.ts`, `checkout-quote.ts`, `catalog-params.ts`, `course-sort.ts`, `period.ts`, `revenue.ts`, `stats.ts`, `authorize.ts`, `shared/*.ts` | เรียกฟังก์ชันตรง ๆ — ไม่มี mock |
| Mapper | `course-mapper.ts`, `toCoupon`, `toEnrollment`, `toOrder` | สร้าง object แถวเอง แล้วเทียบผล |
| Validation | `src/lib/validation/*.ts`, `src/lib/auth-schema.ts` | `schema.safeParse(...)` |
| Service | `src/lib/**/*-service.ts` (`createXxxService(deps)`) | ส่ง fake repository / stub gateway / `fixedClock(...)` เข้าไป |
| Repository | `src/lib/**/*-repository.ts` (`createPrismaXxxRepository(db)`) | Integration กับ `prisma/test.db` |
| Shell | `src/app/**/actions.ts`, `src/app/api/**/route.ts`, หน้า page | E2E ผ่าน `data-testid` |
| Composition root | `src/lib/container.ts` | ไม่ต้องเทสต์ (เทสต์ห้าม import ไฟล์นี้) |

### ตัวอย่าง: ประกอบ service ในเทสต์ (โครง ไม่ผูกกับ test framework)

```ts
import { createRefundService } from "@/lib/refund/refund-service"
import { fixedClock } from "@/lib/shared/clock"
import type { Repositories, UnitOfWork } from "@/lib/repositories"

// fake repository เขียนเองตาม interface — เก็บข้อมูลใน array/Map
const repos = { orders: fakeOrders, enrollments: fakeEnrollments, reviews: fakeReviews /* ... */ } as unknown as Repositories
const uow: UnitOfWork = { run: (fn) => fn(repos) }

const service = createRefundService({
  uow,
  orders: repos.orders,
  courses: fakeCourses,
  progress: fakeProgress,
  clock: fixedClock("2026-10-03T10:00:00+07:00"),
})
const result = await service.refundOrderItem({ userId: "u1", orderItemId: 1 })
// expect(result).toEqual({ ok: true, value: { orderItemId: 1, refundedSatang: 169636 } })
```

### Integration: ชี้ Prisma ไปที่ test.db

```ts
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaClient } from "@generated/prisma/client"
import { createPrismaRepositories } from "@/lib/repositories"

const testPrisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: "file:./prisma/test.db" }) })
const repos = createPrismaRepositories(testPrisma)
```

> เตรียมฐานข้อมูล: `npm run db:test:setup` (มีข้อมูลตัวอย่าง) หรือ `npm run db:test:setup -- --empty`
> บัญชีตัวอย่าง: `admin@example.com`, `user@example.com`, `student01…20@example.com` รหัสผ่าน `password123`
