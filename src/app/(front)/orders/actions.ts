"use server";

import { revalidatePath } from "next/cache";
import { authorizeUser } from "@/lib/auth/authorize";
import { getSessionUser } from "@/lib/auth/session";
import { services } from "@/lib/container";
import type { RefundSuccess } from "@/lib/refund/refund-service";
import { toActionState, type ActionState } from "@/lib/shared/action-state";

export async function refundAction(input: { orderItemId: number }): Promise<ActionState<RefundSuccess>> {
  const auth = authorizeUser(await getSessionUser());
  if (!auth.ok) return toActionState(auth, "");

  const result = await services.refund.refundOrderItem({ userId: auth.value.id, orderItemId: input.orderItemId });
  revalidatePath("/orders", "layout");
  revalidatePath("/my-courses");
  return toActionState(result, "คืนเงินเรียบร้อย");
}
