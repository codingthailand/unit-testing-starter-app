"use client";

import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { completeLessonAction } from "@/app/(front)/learn/actions";

type CompleteButtonProps = {
  lessonId: number;
  slug: string;
  completed: boolean;
  nextHref: string | null;
};

export default function CompleteButton({ lessonId, slug, completed, nextHref }: CompleteButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const complete = () =>
    startTransition(async () => {
      const result = await completeLessonAction({ lessonId, slug });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      if (nextHref && !result.data.certificateCode) router.push(nextHref);
      else router.refresh();
    });

  if (completed) {
    return (
      <Button data-testid="lesson-completed" disabled variant="secondary">
        <CheckCircle2 /> เรียนจบบทนี้แล้ว
      </Button>
    );
  }

  return (
    <Button data-testid="lesson-complete" disabled={pending} onClick={complete}>
      <CheckCircle2 /> {pending ? "กำลังบันทึก..." : "เรียนจบบทนี้"}
    </Button>
  );
}
