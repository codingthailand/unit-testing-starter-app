"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authorizeAdmin } from "@/lib/auth/authorize";
import { getSessionUser } from "@/lib/auth/session";
import { services } from "@/lib/container";
import { toActionState, type ActionState } from "@/lib/shared/action-state";
import type { Result } from "@/lib/shared/result";
import { couponSchema } from "@/lib/validation/coupon-schema";
import { courseSchema, lessonSchema } from "@/lib/validation/course-schema";
import { formDataToObject, parseWithSchema } from "@/lib/validation/form-data";

/**
 * Server Action ฝั่ง admin — ทุกตัวตรวจสิทธิ์ซ้ำเอง (เรียกตรงได้โดยไม่ผ่าน layout)
 * ลำดับ: authorizeAdmin → parse (zod) → service → revalidate
 */
async function asAdmin<T>(run: () => Promise<Result<T>>, message: string): Promise<ActionState<T>> {
  const auth = authorizeAdmin(await getSessionUser());
  if (!auth.ok) return toActionState(auth, "");
  return toActionState(await run(), message);
}

export async function createCourseAction(_prev: ActionState<{ id: number }> | null, formData: FormData) {
  const state = await asAdmin(async () => {
    const parsed = parseWithSchema(courseSchema, formDataToObject(formData, ["isPublished"]));
    return parsed.ok ? services.courseAdmin.createCourse(parsed.value) : parsed;
  }, "สร้างคอร์สเรียบร้อย");
  if (state.ok) {
    revalidatePath("/admin/courses");
    redirect(`/admin/courses/${state.data.id}`);
  }
  return state;
}

export async function updateCourseAction(courseId: number, _prev: ActionState<true> | null, formData: FormData) {
  const state = await asAdmin(async () => {
    const parsed = parseWithSchema(courseSchema, formDataToObject(formData, ["isPublished"]));
    return parsed.ok ? services.courseAdmin.updateCourse(courseId, parsed.value) : parsed;
  }, "บันทึกคอร์สเรียบร้อย");
  if (state.ok) revalidatePath("/", "layout");
  return state;
}

export async function deleteCourseAction(courseId: number): Promise<ActionState<true>> {
  const state = await asAdmin(() => services.courseAdmin.deleteCourse(courseId), "ลบคอร์สเรียบร้อย");
  if (state.ok) revalidatePath("/", "layout");
  return state;
}

export async function addLessonAction(courseId: number, _prev: ActionState<{ id: number }> | null, formData: FormData) {
  const state = await asAdmin(async () => {
    const parsed = parseWithSchema(lessonSchema, formDataToObject(formData, ["isPreview"]));
    return parsed.ok ? services.courseAdmin.addLesson(courseId, parsed.value) : parsed;
  }, "เพิ่มบทเรียนเรียบร้อย");
  if (state.ok) revalidatePath(`/admin/courses/${courseId}`);
  return state;
}

export async function deleteLessonAction(courseId: number, lessonId: number): Promise<ActionState<true>> {
  const state = await asAdmin(() => services.courseAdmin.deleteLesson(lessonId), "ลบบทเรียนเรียบร้อย");
  if (state.ok) revalidatePath(`/admin/courses/${courseId}`);
  return state;
}

export async function createCouponAction(_prev: ActionState<{ id: number }> | null, formData: FormData) {
  const state = await asAdmin(async () => {
    const parsed = parseWithSchema(couponSchema, formDataToObject(formData));
    return parsed.ok ? services.coupon.createCoupon(parsed.value) : parsed;
  }, "สร้างคูปองเรียบร้อย");
  if (state.ok) revalidatePath("/admin/coupons");
  return state;
}

export async function setCouponActiveAction(couponId: number, isActive: boolean): Promise<ActionState<true>> {
  const state = await asAdmin(async () => {
    await services.coupon.setCouponActive(couponId, isActive);
    return { ok: true as const, value: true as const };
  }, isActive ? "เปิดใช้คูปองแล้ว" : "ปิดใช้คูปองแล้ว");
  if (state.ok) revalidatePath("/admin/coupons");
  return state;
}
