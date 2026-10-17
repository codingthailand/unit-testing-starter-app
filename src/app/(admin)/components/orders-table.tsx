import { OrderStatusBadge } from "@/components/order-status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AdminOrderRow } from "@/lib/admin/admin-types";
import { formatTHB } from "@/lib/shared/money";

const dateTimeFormatter = new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" });

export function OrdersTable({ orders }: { orders: AdminOrderRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table data-testid="admin-orders-table">
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>วันที่</TableHead>
            <TableHead>ลูกค้า</TableHead>
            <TableHead className="text-right">คอร์ส</TableHead>
            <TableHead>สถานะ</TableHead>
            <TableHead className="text-right">ยอดชำระ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow data-testid={`admin-order-${order.id}`} key={order.id}>
              <TableCell className="font-medium">{order.id}</TableCell>
              <TableCell className="text-muted-foreground">{dateTimeFormatter.format(order.createdAt)}</TableCell>
              <TableCell>
                <div>{order.customerName}</div>
                <div className="text-muted-foreground text-xs">{order.customerEmail}</div>
              </TableCell>
              <TableCell className="text-right">{order.itemCount}</TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status} />
              </TableCell>
              <TableCell className="text-right tabular-nums">{formatTHB(order.totalSatang)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
