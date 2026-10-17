/**
 * Port ของระบบชำระเงิน — service รู้จักแค่ interface นี้
 * ตอนรันจริงใช้ FakePaymentGateway ตอนเทสต์ใช้ stub/spy ที่เขียนเองได้เลย
 */
export type ChargeRequest = {
  amountSatang: number
  cardNumber: string
  description: string
}

export type ChargeResult =
  | { status: "approved"; reference: string }
  | { status: "declined"; reason: string }

export type RefundRequest = {
  /** reference ที่ได้จาก charge */
  reference: string
  amountSatang: number
}

export interface PaymentGateway {
  /** throw เมื่อเชื่อมต่อไม่ได้ (network error) — คืน declined เมื่อบัตรถูกปฏิเสธ */
  charge(request: ChargeRequest): Promise<ChargeResult>
  /** คืนเงิน (ทั้งหมดหรือบางส่วน) — throw เมื่อทำไม่สำเร็จ */
  refund(request: RefundRequest): Promise<void>
}
