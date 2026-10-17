import type { Clock } from "@/lib/shared/clock"
import type { PaymentGateway } from "./payment-gateway"

/** บัตรทดสอบ (เลียนแบบ Stripe test cards) */
export const TEST_CARDS = {
  APPROVED: "4242424242424242",
  DECLINED: "4000000000000002",
  /** จำลองระบบชำระเงินล่ม (throw) */
  NETWORK_ERROR: "4000000000000119",
} as const

/** "4242 4242-4242 4242" → "4242424242424242" (pure) */
export function normalizeCardNumber(cardNumber: string): string {
  return cardNumber.replace(/[\s-]/g, "")
}

/**
 * gateway ปลอมที่ใช้ตอนรันแอปจริงในคอร์ส (ไม่มีการตัดเงินจริง)
 * เลขบัตรอื่นนอกเหนือจาก TEST_CARDS ถือว่าถูกปฏิเสธ
 */
export function createFakePaymentGateway({ clock }: { clock: Clock }): PaymentGateway {
  let sequence = 0
  return {
    async charge({ cardNumber }) {
      const card = normalizeCardNumber(cardNumber)
      if (card === TEST_CARDS.NETWORK_ERROR) {
        throw new Error("Fake gateway: network error")
      }
      if (card === TEST_CARDS.APPROVED) {
        sequence += 1
        return { status: "approved", reference: `FAKE-${clock().getTime()}-${sequence}` }
      }
      return { status: "declined", reason: "card_declined" }
    },

    async refund({ reference, amountSatang }) {
      if (!reference.startsWith("FAKE-") || amountSatang < 0) {
        throw new Error(`Fake gateway: cannot refund ${reference}`)
      }
    },
  }
}
