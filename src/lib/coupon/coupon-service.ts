import { appError } from "@/lib/shared/errors"
import { err, ok, type Result } from "@/lib/shared/result"
import type { CouponRepository } from "./coupon-repository"
import { checkCouponUsable, normalizeCouponCode } from "./coupon-rules"
import type { Coupon, CouponInput, CouponListItem } from "./coupon-types"

export type CouponServiceDeps = {
  coupons: CouponRepository
}

export function createCouponService({ coupons }: CouponServiceDeps) {
  return {
    /** รับโค้ดที่ผู้ใช้พิมพ์มา → คูปองที่ใช้ได้ หรือ error */
    async findUsableCoupon(rawCode: string): Promise<Result<Coupon>> {
      const code = normalizeCouponCode(rawCode)
      if (code === "") return err(appError("COUPON_REQUIRED"))
      return checkCouponUsable(await coupons.findByCode(code))
    },

    async listCoupons(): Promise<CouponListItem[]> {
      return coupons.list()
    },

    async createCoupon(input: CouponInput): Promise<Result<{ id: number }>> {
      const code = normalizeCouponCode(input.code)
      if (await coupons.findByCode(code)) return err(appError("COUPON_CODE_TAKEN"))
      return ok(await coupons.create({ ...input, code }))
    },

    async setCouponActive(id: number, isActive: boolean): Promise<void> {
      await coupons.setActive(id, isActive)
    },
  }
}

export type CouponService = ReturnType<typeof createCouponService>
