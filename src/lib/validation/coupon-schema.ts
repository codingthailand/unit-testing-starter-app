import { z } from "zod"
import { bahtToSatang } from "@/lib/shared/money"
import { COUPON_TYPES } from "@/lib/shared/status"

/**
 * ฟอร์มสร้างคูปอง (admin) — กรอกเป็นบาท แล้วแปลงเป็นสตางค์ตอน transform
 * PERCENT: value 1–100 / FIXED: value > 0 บาท
 */
export const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9]{3,20}$/, "โค้ดต้องเป็น A-Z หรือ 0-9 ยาว 3–20 ตัว"),
    type: z.enum(COUPON_TYPES, { error: "กรุณาเลือกประเภทคูปอง" }),
    value: z.coerce.number({ error: "กรุณากรอกตัวเลข" }),
    maxDiscountBaht: z
      .union([z.literal(""), z.coerce.number().positive("เพดานส่วนลดต้องมากกว่า 0")])
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "PERCENT" && (!Number.isInteger(data.value) || data.value < 1 || data.value > 100)) {
      ctx.addIssue({ code: "custom", path: ["value"], message: "เปอร์เซ็นต์ต้องเป็นจำนวนเต็ม 1–100" })
    }
    if (data.type === "FIXED" && !(data.value > 0)) {
      ctx.addIssue({ code: "custom", path: ["value"], message: "ส่วนลดต้องมากกว่า 0 บาท" })
    }
  })
  .transform((data) => ({
    code: data.code,
    type: data.type,
    value: data.type === "PERCENT" ? data.value : bahtToSatang(data.value),
    maxDiscountSatang:
      data.type === "PERCENT" && typeof data.maxDiscountBaht === "number"
        ? bahtToSatang(data.maxDiscountBaht)
        : null,
    isActive: true,
  }))

export type CouponFormValues = z.input<typeof couponSchema>
