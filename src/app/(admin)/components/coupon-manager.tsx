"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "react-toastify";
import { useActionFormSubmit } from "@/hooks/use-action-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CouponListItem } from "@/lib/coupon/coupon-types";
import { formatTHB } from "@/lib/shared/money";
import type { CouponType } from "@/lib/shared/status";
import { createCouponAction, setCouponActiveAction } from "../admin/actions";
import { FormField, selectClass } from "./form-field";

function describeCoupon(coupon: CouponListItem): string {
  if (coupon.type === "FIXED") return `ลด ${formatTHB(coupon.value)}`;
  return coupon.maxDiscountSatang === null
    ? `ลด ${coupon.value}%`
    : `ลด ${coupon.value}% สูงสุด ${formatTHB(coupon.maxDiscountSatang)}`;
}

export default function CouponManager({ coupons }: { coupons: CouponListItem[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [type, setType] = useState<CouponType>("PERCENT");
  const [state, formAction, pending] = useActionState(createCouponAction, null);
  const onSubmit = useActionFormSubmit(formAction);
  const [toggling, startToggle] = useTransition();
  const errors = state && !state.ok ? state.fieldErrors : undefined;

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message);
      formRef.current?.reset();
    } else {
      toast.error(state.message);
    }
  }, [state]);

  const toggle = (id: number, isActive: boolean) =>
    startToggle(async () => {
      const result = await setCouponActiveAction(id, isActive);
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
      router.refresh();
    });

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid gap-4 rounded-xl border bg-card p-6 md:grid-cols-5 md:items-end" data-testid="coupon-form" ref={formRef}>
        <FormField errors={errors} label="โค้ด" name="code">
          <Input className="uppercase" data-testid="coupon-code-input" id="code" name="code" placeholder="SUMMER10" />
        </FormField>
        <FormField errors={errors} label="ประเภท" name="type">
          <select
            className={selectClass}
            data-testid="coupon-type-input"
            id="type"
            name="type"
            onChange={(event) => setType(event.target.value as CouponType)}
            value={type}
          >
            <option value="PERCENT">เปอร์เซ็นต์ (%)</option>
            <option value="FIXED">ลดเงินตายตัว (บาท)</option>
          </select>
        </FormField>
        <FormField errors={errors} label={type === "PERCENT" ? "ส่วนลด (%)" : "ส่วนลด (บาท)"} name="value">
          <Input data-testid="coupon-value-input" id="value" name="value" step={type === "PERCENT" ? 1 : 0.01} type="number" />
        </FormField>
        <FormField errors={errors} label="เพดานส่วนลด (บาท)" name="maxDiscountBaht">
          <Input
            data-testid="coupon-max-input"
            disabled={type !== "PERCENT"}
            id="maxDiscountBaht"
            name="maxDiscountBaht"
            placeholder="ไม่จำกัด"
            step="0.01"
            type="number"
          />
        </FormField>
        <Button data-testid="coupon-create" disabled={pending} type="submit">
          สร้างคูปอง
        </Button>
      </form>

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table data-testid="admin-coupons-table">
          <TableHeader>
            <TableRow>
              <TableHead>โค้ด</TableHead>
              <TableHead>เงื่อนไข</TableHead>
              <TableHead className="text-right">ใช้แล้ว (order)</TableHead>
              <TableHead>เปิดใช้งาน</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow data-testid={`admin-coupon-${coupon.code}`} key={coupon.id}>
                <TableCell className="font-medium font-mono">{coupon.code}</TableCell>
                <TableCell>{describeCoupon(coupon)}</TableCell>
                <TableCell className="text-right">{coupon.usedCount}</TableCell>
                <TableCell>
                  <Switch
                    aria-label={`เปิด/ปิดคูปอง ${coupon.code}`}
                    checked={coupon.isActive}
                    data-testid={`coupon-toggle-${coupon.code}`}
                    disabled={toggling}
                    onCheckedChange={(checked) => toggle(coupon.id, checked)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
