"use server";

import { revalidatePath } from "next/cache";
import { authorizeUser } from "@/lib/auth/authorize";
import { getSessionUser } from "@/lib/auth/session";
import type { CheckoutSuccess } from "@/lib/checkout/checkout-service";
import { services } from "@/lib/container";
import { toActionState, type ActionState } from "@/lib/shared/action-state";
import { checkoutSchema } from "@/lib/validation/checkout-schema";
import { parseWithSchema } from "@/lib/validation/form-data";

/** ชำระเงิน — ราคาคำนวณใหม่ที่ server จาก courseIds เท่านั้น */
export async function checkoutAction(input: {
  courseIds: number[];
  couponCode: string | null;
  cardNumber: string;
  cardName: string;
}): Promise<ActionState<CheckoutSuccess>> {
  const auth = authorizeUser(await getSessionUser());
  if (!auth.ok) return toActionState(auth, "");

  const parsed = parseWithSchema(checkoutSchema, { ...input, couponCode: input.couponCode ?? undefined });
  if (!parsed.ok) return toActionState(parsed, "");

  const result = await services.checkout.checkout({
    userId: auth.value.id,
    courseIds: parsed.value.courseIds,
    couponCode: parsed.value.couponCode,
    cardNumber: parsed.value.cardNumber,
  });
  revalidatePath("/orders");
  revalidatePath("/my-courses");
  return toActionState(result, "ชำระเงินสำเร็จ");
}
