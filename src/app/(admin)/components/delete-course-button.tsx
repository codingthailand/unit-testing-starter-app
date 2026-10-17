"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteCourseAction } from "../admin/actions";

export default function DeleteCourseButton({ courseId, title }: { courseId: number; title: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const confirm = () =>
    startTransition(async () => {
      const result = await deleteCourseAction(courseId);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      router.push("/admin/courses");
    });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button data-testid="course-delete" variant="destructive">
          <Trash2 /> ลบคอร์ส
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ลบคอร์ส &ldquo;{title}&rdquo;?</DialogTitle>
          <DialogDescription>ลบได้เฉพาะคอร์สที่ยังไม่มียอดขาย บทเรียนทั้งหมดจะถูกลบด้วย</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">ยกเลิก</Button>
          </DialogClose>
          <Button data-testid="course-delete-confirm" disabled={pending} onClick={confirm} variant="destructive">
            ยืนยันลบ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
