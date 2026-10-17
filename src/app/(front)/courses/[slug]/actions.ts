"use server";

import { revalidatePath } from "next/cache";
import { authorizeUser } from "@/lib/auth/authorize";
import { getSessionUser } from "@/lib/auth/session";
import { services } from "@/lib/container";
import { toActionState, type ActionState } from "@/lib/shared/action-state";
import { parseWithSchema } from "@/lib/validation/form-data";
import { reviewSchema } from "@/lib/validation/review-schema";

/** ส่ง/แก้ไขรีวิว — action บาง ๆ: ตรวจสิทธิ์ → parse → เรียก service */
export async function submitReviewAction(input: {
  courseId: number;
  slug: string;
  rating: number;
  comment: string;
}): Promise<ActionState<true>> {
  const auth = authorizeUser(await getSessionUser());
  if (!auth.ok) return toActionState(auth, "");

  const parsed = parseWithSchema(reviewSchema, input);
  if (!parsed.ok) return toActionState(parsed, "");

  const result = await services.review.submitReview({ userId: auth.value.id, courseId: input.courseId, ...parsed.value });
  if (result.ok) revalidatePath(`/courses/${input.slug}`);
  return toActionState(result, "บันทึกรีวิวเรียบร้อย");
}

/** ลงทะเบียนคอร์สฟรี (ยอด 0 บาท ไม่ผ่าน payment gateway) */
export async function enrollFreeAction(input: { courseId: number; slug: string }): Promise<ActionState<{ orderId: number }>> {
  const auth = authorizeUser(await getSessionUser());
  if (!auth.ok) return toActionState(auth, "");

  const quote = await services.checkout.quote({ userId: auth.value.id, courseIds: [input.courseId] });
  if (quote.ok && quote.value.totalSatang > 0) {
    return { ok: false, code: "VALIDATION_FAILED", message: "คอร์สนี้ไม่ใช่คอร์สฟรี" };
  }

  const result = await services.checkout.checkout({ userId: auth.value.id, courseIds: [input.courseId], cardNumber: "" });
  if (result.ok) revalidatePath(`/courses/${input.slug}`);
  return toActionState(
    result.ok ? { ok: true, value: { orderId: result.value.orderId } } : result,
    "ลงทะเบียนเรียบร้อย เริ่มเรียนได้เลย"
  );
}
