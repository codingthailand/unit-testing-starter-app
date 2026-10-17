/**
 * กระจายส่วนลดรวมลงแต่ละรายการตามสัดส่วนราคา (pure)
 *
 * - ใช้ floor ทุกรายการ แล้วยกเศษสตางค์ที่เหลือไปไว้รายการสุดท้ายที่ยังรับได้
 * - invariant: sum(ผลลัพธ์) === discount และ 0 ≤ ผลลัพธ์[i] ≤ prices[i]
 *
 * ใช้บันทึก "ยอดที่จ่ายจริง" ต่อคอร์ส เพื่อคืนเงินรายคอร์สได้ถูกต้อง
 */
export function allocateDiscount(prices: readonly number[], discount: number): number[] {
  const subtotal = prices.reduce((sum, price) => sum + price, 0)
  if (subtotal <= 0 || discount <= 0) return prices.map(() => 0)

  const cappedDiscount = Math.min(discount, subtotal)
  const shares = prices.map((price) => Math.floor((price * cappedDiscount) / subtotal))

  let remainder = cappedDiscount - shares.reduce((sum, share) => sum + share, 0)
  for (let i = prices.length - 1; i >= 0 && remainder > 0; i--) {
    const room = prices[i] - shares[i]
    const add = Math.min(room, remainder)
    shares[i] += add
    remainder -= add
  }

  return shares
}
