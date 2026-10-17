import { Badge } from "@/components/ui/badge";
import type { OrderItemStatus, OrderStatus } from "@/lib/shared/status";
import { cn } from "@/lib/utils";

const LABELS: Record<OrderStatus | OrderItemStatus, string> = {
  PENDING: "รอชำระเงิน",
  PAID: "ชำระแล้ว",
  FAILED: "ชำระไม่สำเร็จ",
  REFUNDED: "คืนเงินแล้ว",
};

const STYLES: Record<OrderStatus | OrderItemStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  PAID: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  FAILED: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
  REFUNDED: "bg-slate-200 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300",
};

export function OrderStatusBadge({ status, testId }: { status: OrderStatus | OrderItemStatus; testId?: string }) {
  return (
    <Badge className={cn("rounded-full border-transparent", STYLES[status])} data-testid={testId}>
      {LABELS[status]}
    </Badge>
  );
}
