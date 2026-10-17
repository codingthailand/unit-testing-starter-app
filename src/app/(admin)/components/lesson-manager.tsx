"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useTransition } from "react";
import { toast } from "react-toastify";
import { useActionFormSubmit } from "@/hooks/use-action-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { LessonInfo } from "@/lib/course/course-types";
import { addLessonAction, deleteLessonAction } from "../admin/actions";
import { FormField } from "./form-field";

export default function LessonManager({ courseId, lessons }: { courseId: number; lessons: LessonInfo[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(addLessonAction.bind(null, courseId), null);
  const onSubmit = useActionFormSubmit(formAction);
  const [deleting, startDelete] = useTransition();
  const errors = state && !state.ok ? state.fieldErrors : undefined;
  const nextPosition = Math.max(0, ...lessons.map((lesson) => lesson.position)) + 1;

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message);
      formRef.current?.reset();
    } else {
      toast.error(state.message);
    }
  }, [state]);

  const remove = (lessonId: number) =>
    startDelete(async () => {
      const result = await deleteLessonAction(courseId, lessonId);
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
      router.refresh();
    });

  return (
    <section className="space-y-4 rounded-xl border bg-card p-6" data-testid="lesson-manager">
      <h2 className="font-semibold">บทเรียน ({lessons.length})</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ลำดับ</TableHead>
            <TableHead>ชื่อบทเรียน</TableHead>
            <TableHead>YouTube</TableHead>
            <TableHead className="text-right">นาที</TableHead>
            <TableHead>ดูฟรี</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {lessons.map((lesson) => (
            <TableRow data-testid={`admin-lesson-${lesson.id}`} key={lesson.id}>
              <TableCell>{lesson.position}</TableCell>
              <TableCell>{lesson.title}</TableCell>
              <TableCell className="font-mono text-xs">{lesson.youtubeId}</TableCell>
              <TableCell className="text-right">{lesson.durationMinutes}</TableCell>
              <TableCell>{lesson.isPreview ? "ใช่" : "-"}</TableCell>
              <TableCell className="text-right">
                <Button
                  aria-label={`ลบบทเรียน ${lesson.title}`}
                  data-testid={`admin-lesson-delete-${lesson.id}`}
                  disabled={deleting}
                  onClick={() => remove(lesson.id)}
                  size="icon"
                  variant="ghost"
                >
                  <Trash2 />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <form onSubmit={onSubmit} className="grid gap-4 border-t pt-4 md:grid-cols-[80px_1fr_160px_100px_auto_auto] md:items-end" ref={formRef}>
        <FormField errors={errors} label="ลำดับ" name="position">
          <Input data-testid="lesson-position-input" defaultValue={nextPosition} id="position" key={nextPosition} name="position" type="number" />
        </FormField>
        <FormField errors={errors} label="ชื่อบทเรียน" name="title">
          <Input data-testid="lesson-title-input" id="title" name="title" />
        </FormField>
        <FormField errors={errors} label="YouTube ID" name="youtubeId">
          <Input data-testid="lesson-youtube-input" id="youtubeId" name="youtubeId" placeholder="dQw4w9WgXcQ" />
        </FormField>
        <FormField errors={errors} label="นาที" name="durationMinutes">
          <Input data-testid="lesson-duration-input" defaultValue={10} id="durationMinutes" name="durationMinutes" type="number" />
        </FormField>
        <label className="flex h-9 items-center gap-2 text-sm">
          <input className="size-4 accent-primary" data-testid="lesson-preview-input" name="isPreview" type="checkbox" /> ดูฟรี
        </label>
        <Button data-testid="lesson-add" disabled={pending} type="submit">
          เพิ่มบทเรียน
        </Button>
      </form>
    </section>
  );
}
