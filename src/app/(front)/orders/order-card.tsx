import Link from "next/link";
import { OrderStatusBadge } from "@/components/order-status-badge";
import type { OrderView } from "@/lib/checkout/order-service";
import { refundDeadline } from "@/lib/refund/refund-policy";
import { formatTHB } from "@/lib/shared/money";
import RefundButton from "./refund-button";

const dateTimeFormatter = new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" });

export function OrderCard({ order }: { order: OrderView }) {
  return (
    <article className="overflow-hidden rounded-xl border bg-card" data-testid={`order-${order.id}`}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/40 px-5 py-3 text-sm">
        <div className="flex flex-wrap items-center gap-3">
          <Link className="font-semibold hover:text-primary" href={`/orders/${order.id}`}>
            คำสั่งซื้อ #{order.id}
          </Link>
          <span className="text-muted-foreground">{dateTimeFormatter.format(order.createdAt)}</span>
          <OrderStatusBadge status={order.status} testId={`order-status-${order.id}`} />
        </div>
        <div className="text-right">
          {order.couponCode && <span className="mr-3 text-muted-foreground">คูปอง {order.couponCode}</span>}
          <span className="font-semibold">{formatTHB(order.totalSatang)}</span>
        </div>
      </header>
      <ul className="divide-y">
        {order.items.map((item) => (
          <li className="flex flex-wrap items-center justify-between gap-4 px-5 py-4" data-testid={`order-item-${item.id}`} key={item.id}>
            <div>
              <Link className="font-medium hover:text-primary" href={`/courses/${item.courseSlug}`}>
                {item.courseTitle}
              </Link>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-muted-foreground text-sm">
                <span>
                  จ่าย {formatTHB(item.paidSatang)}
                  {item.discountSatang > 0 && ` (ลด ${formatTHB(item.discountSatang)})`}
                </span>
                {item.status !== "PENDING" && <OrderStatusBadge status={item.status} testId={`order-item-status-${item.id}`} />}
                {item.status === "PAID" && <span>· เรียนแล้ว {item.progressPercent}%</span>}
              </div>
            </div>
            {order.status === "PAID" && item.status === "PAID" && (
              <div>
                <RefundButton
                  courseTitle={item.courseTitle}
                  disabledReason={item.refund.ok ? null : item.refund.error.message}
                  orderItemId={item.id}
                  paidSatang={item.paidSatang}
                />
                {item.refund.ok && order.paidAt && (
                  <p className="mt-1 text-right text-muted-foreground text-xs">
                    ขอคืนได้ถึง {dateTimeFormatter.format(refundDeadline(order.paidAt))}
                  </p>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </article>
  );
}
