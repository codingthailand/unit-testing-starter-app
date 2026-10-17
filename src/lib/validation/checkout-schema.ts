import { z } from "zod"
import { normalizeCardNumber } from "@/lib/payment/fake-payment-gateway"

export const CARD_NUMBER_LENGTH = 16

export const checkoutSchema = z.object({
  courseIds: z.array(z.coerce.number().int().positive()).max(50),
  couponCode: z.string().trim().max(30).optional(),
  cardNumber: z
    .string()
    .transform(normalizeCardNumber)
    .pipe(
      z
        .string()
        .min(1, "กรุณากรอกหมายเลขบัตร")
        .regex(/^\d+$/, "หมายเลขบัตรต้องเป็นตัวเลขเท่านั้น")
        .length(CARD_NUMBER_LENGTH, `หมายเลขบัตรต้องมี ${CARD_NUMBER_LENGTH} หลัก`)
    ),
  cardName: z.string().trim().min(1, "กรุณากรอกชื่อบนบัตร").max(100),
})

export type CheckoutFormValues = z.input<typeof checkoutSchema>

/** ฟอร์มฝั่ง client (ไม่มี courseIds — อ่านจากตะกร้า) */
export const cardFormSchema = checkoutSchema.pick({ cardNumber: true, cardName: true })
export type CardFormValues = z.input<typeof cardFormSchema>
