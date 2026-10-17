"use server";

import { revalidatePath } from "next/cache";
import { authorizeUser } from "@/lib/auth/authorize";
import { getSessionUser } from "@/lib/auth/session";
import { services } from "@/lib/container";
import type { CompleteLessonResult } from "@/lib/learning/learning-service";
import { toActionState, type ActionState } from "@/lib/shared/action-state";

export async function completeLessonAction(input: { lessonId: number; slug: string }): Promise<ActionState<CompleteLessonResult>> {
  const auth = authorizeUser(await getSessionUser());
  if (!auth.ok) return toActionState(auth, "");

  const result = await services.learning.completeLesson({ userId: auth.value.id, lessonId: input.lessonId });
  if (result.ok) {
    revalidatePath(`/learn/${input.slug}`, "layout");
    revalidatePath("/my-courses");
  }
  return toActionState(
    result,
    result.ok && result.value.certificateCode ? "ยินดีด้วย! คุณเรียนจบคอร์สแล้ว" : "บันทึกความคืบหน้าแล้ว"
  );
}
