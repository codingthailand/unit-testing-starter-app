/** รายการในตะกร้า (ฝั่ง client) — ไม่มีจำนวน เพราะคอร์สซื้อได้ครั้งเดียว */
export type CartItem = {
  courseId: number
  slug: string
  title: string
  priceSatang: number
  imageName: string
}
