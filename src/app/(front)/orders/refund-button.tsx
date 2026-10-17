"use client";

import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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
import { formatTHB } from "@/lib/shared/money";
import { refundAction } from "./actions";

type RefundButtonProps = {
  orderItemId: number;
  courseTitle: string;
  paidSatang: number;
  /** null = ขอคืนได้ / ข้อความ = เหตุผลที่คืนไม่ได้ */
  disabledReason: string | null;
};

export default function RefundButton({ orderItemId, courseTitle, paidSatang, disabledReason }: RefundButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  if (disabledReason) {
    return (
      <div className="text-right">
        <Button data-testid={`refund-button-${orderItemId}`} disabled size="sm" variant="outline">
          <RotateCcw /> ขอคืนเงิน
        </Button>
        <p className="mt-1 text-muted-foreground text-xs" data-testid={`refund-reason-${orderItemId}`}>
          {disabledReason}
        </p>
      </div>
    );
  }

  const confirm = () =>
    startTransition(async () => {
      const result = await refundAction({ orderItemId });
      if (result.ok) toast.success(`${result.message} ${formatTHB(result.data.refundedSatang)}`);
      else toast.error(result.message);
      setOpen(false);
      router.refresh();
    });

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button data-testid={`refund-button-${orderItemId}`} size="sm" variant="outline">
          <RotateCcw /> ขอคืนเงิน
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ยืนยันการขอคืนเงิน</DialogTitle>
          <DialogDescription>
            คืนเงิน {formatTHB(paidSatang)} สำหรับคอร์ส &ldquo;{courseTitle}&rdquo; — คุณจะเข้าเรียนคอร์สนี้ไม่ได้อีก
            และรีวิวของคุณจะถูกลบ
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">ยกเลิก</Button>
          </DialogClose>
          <Button data-testid="refund-confirm" disabled={pending} onClick={confirm} variant="destructive">
            ยืนยันคืนเงิน
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
