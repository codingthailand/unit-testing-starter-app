export type DashboardCounts = {
  /** ผลรวม paidSatang ของ item ที่ PAID ทั้งหมด */
  revenueSatang: number
  paidItems: number
  refundedItems: number
  paidOrders: number
  activeStudents: number
  publishedCourses: number
}

export type DashboardStats = DashboardCounts & {
  /** % ของ item ที่ถูกคืนเงิน เทียบกับที่ขายได้ทั้งหมด (ทศนิยม 1 ตำแหน่ง) */
  refundRatePercent: number
  /** ยอดเฉลี่ยต่อ order (สตางค์) */
  averageOrderSatang: number
}

/** คำนวณตัวเลขที่ derive จาก counts (pure) — กันหารด้วยศูนย์ */
export function buildDashboardStats(counts: DashboardCounts): DashboardStats {
  const soldItems = counts.paidItems + counts.refundedItems
  return {
    ...counts,
    refundRatePercent: soldItems === 0 ? 0 : Math.round((counts.refundedItems / soldItems) * 1000) / 10,
    averageOrderSatang: counts.paidOrders === 0 ? 0 : Math.round(counts.revenueSatang / counts.paidOrders),
  }
}
