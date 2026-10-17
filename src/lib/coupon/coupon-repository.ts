import type { DbClient } from "@/lib/shared/db"
import { COUPON_TYPES, isOneOf } from "@/lib/shared/status"
import type { Coupon, CouponInput, CouponListItem } from "./coupon-types"

export interface CouponRepository {
  /** code ต้องถูก normalize มาแล้ว */
  findByCode(code: string): Promise<Coupon | null>
  list(): Promise<CouponListItem[]>
  create(input: CouponInput): Promise<{ id: number }>
  setActive(id: number, isActive: boolean): Promise<void>
}

type CouponRow = {
  id: number
  code: string
  type: string
  value: number
  maxDiscountSatang: number | null
  isActive: boolean
}

/** แถวจาก DB → Coupon (pure) — type ที่ไม่รู้จักถือว่าใช้งานไม่ได้ */
export function toCoupon(row: CouponRow): Coupon {
  const type = row.type
  const validType = isOneOf(COUPON_TYPES, type)
  return {
    id: row.id,
    code: row.code,
    type: validType ? type : "FIXED",
    value: row.value,
    maxDiscountSatang: row.maxDiscountSatang,
    isActive: validType && row.isActive,
  }
}

export function createPrismaCouponRepository(db: DbClient): CouponRepository {
  return {
    async findByCode(code) {
      const row = await db.coupon.findUnique({ where: { code } })
      return row ? toCoupon(row) : null
    },

    async list() {
      const rows = await db.coupon.findMany({
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { orders: { where: { status: "PAID" } } } } },
      })
      return rows.map((row) => ({
        ...toCoupon(row),
        usedCount: row._count.orders,
        createdAt: row.createdAt,
      }))
    },

    async create(input) {
      return db.coupon.create({ data: input, select: { id: true } })
    },

    async setActive(id, isActive) {
      await db.coupon.update({ where: { id }, data: { isActive } })
    },
  }
}
