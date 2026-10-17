"use client"

import { useEffect, useState } from "react"
import { quoteAction } from "@/app/(front)/cart/actions"
import type { CheckoutQuote } from "@/lib/checkout/checkout-quote"
import type { ActionState } from "@/lib/shared/action-state"

/** ขอใบเสนอราคาจาก server ทุกครั้งที่รายการในตะกร้าหรือคูปองเปลี่ยน */
export function useCartQuote(courseIds: number[], couponCode: string | null, enabled: boolean) {
  const [quote, setQuote] = useState<ActionState<CheckoutQuote> | null>(null)
  const key = `${courseIds.join(",")}|${couponCode ?? ""}`

  useEffect(() => {
    if (!enabled || courseIds.length === 0) return
    let cancelled = false
    quoteAction({ courseIds, couponCode }).then((result) => {
      if (!cancelled) setQuote(result)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- key รวม courseIds + couponCode แล้ว
  }, [key, enabled])

  return courseIds.length === 0 ? null : quote
}
