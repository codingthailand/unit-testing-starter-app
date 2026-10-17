"use client"

import { useEffect, useState } from "react"
import { quoteAction } from "@/app/(front)/cart/actions"
import type { CheckoutQuote } from "@/lib/checkout/checkout-quote"
import type { ActionState } from "@/lib/shared/action-state"

/**
 * ขอใบเสนอราคาจาก server ทุกครั้งที่รายการในตะกร้าหรือคูปองเปลี่ยน
 * ผลลัพธ์ผูกกับ key ของคำขอ — ระหว่างรอผลใหม่จะคืน null (ไม่แสดง/ไม่ใช้ราคาเก่า)
 */
export function useCartQuote(courseIds: number[], couponCode: string | null, enabled: boolean) {
  const [state, setState] = useState<{ key: string; quote: ActionState<CheckoutQuote> } | null>(null)
  const key = `${courseIds.join(",")}|${couponCode ?? ""}`

  useEffect(() => {
    if (!enabled || courseIds.length === 0) return
    let cancelled = false
    quoteAction({ courseIds, couponCode }).then((quote) => {
      if (!cancelled) setState({ key, quote })
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- key รวม courseIds + couponCode แล้ว
  }, [key, enabled])

  if (courseIds.length === 0 || state?.key !== key) return null
  return state.quote
}
