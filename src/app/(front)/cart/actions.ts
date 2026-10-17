"use server";

import { getSessionUser } from "@/lib/auth/session";
import type { CheckoutQuote } from "@/lib/checkout/checkout-quote";
import { services } from "@/lib/container";
import { toActionState, type ActionState } from "@/lib/shared/action-state";

/**
 * คำนวณราคาจาก server (ราคาจริงจาก DB + ตรวจคูปอง) ให้หน้าตะกร้า/checkout แสดงผล
 * ไม่ login ก็เรียกได้ (ยังไม่รู้ว่าลงทะเบียนคอร์สไหนไว้)
 */
export async function quoteAction(input: { courseIds: number[]; couponCode: string | null }): Promise<ActionState<CheckoutQuote>> {
  const user = await getSessionUser();
  const result = await services.checkout.quote({
    userId: user?.id ?? null,
    courseIds: input.courseIds,
    couponCode: input.couponCode ?? undefined,
  });
  return toActionState(result, "คำนวณราคาเรียบร้อย");
}
