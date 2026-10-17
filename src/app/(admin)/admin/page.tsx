import { BookOpen, Coins, Receipt, RotateCcw, Users } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { services } from "@/lib/container";
import { formatTHB } from "@/lib/shared/money";
import { AdminPage } from "../components/admin-page";
import { OrdersTable } from "../components/orders-table";
import RevenueChart from "./revenue-chart";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

async function StatCards() {
  await connection();
  const stats = await services.admin.getStats();
  const cards = [
    { icon: Coins, label: "รายได้ทั้งหมด", value: formatTHB(stats.revenueSatang), testId: "stat-revenue" },
    { icon: Receipt, label: "คำสั่งซื้อที่ชำระแล้ว", value: stats.paidOrders.toLocaleString("th-TH"), testId: "stat-orders" },
    { icon: Users, label: "ผู้เรียน", value: stats.activeStudents.toLocaleString("th-TH"), testId: "stat-students" },
    { icon: BookOpen, label: "คอร์สที่เปิดขาย", value: String(stats.publishedCourses), testId: "stat-courses" },
    { icon: RotateCcw, label: "อัตราคืนเงิน", value: `${stats.refundRatePercent}%`, testId: "stat-refund-rate" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      {cards.map(({ icon: Icon, label, value, testId }) => (
        <div className="rounded-xl border bg-card p-4" key={label}>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Icon className="size-4" /> {label}
          </div>
          <p className="mt-2 font-semibold text-xl tabular-nums" data-testid={testId}>
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}

async function RecentOrders() {
  await connection();
  return <OrdersTable orders={await services.admin.listOrders(5)} />;
}

// http://localhost:3000/admin
export default function AdminDashboardPage() {
  return (
    <AdminPage description="ภาพรวมยอดขายและผู้เรียน" title="แดชบอร์ด">
      <Suspense fallback={<Skeleton className="h-24 w-full rounded-xl" />}>
        <StatCards />
      </Suspense>
      <RevenueChart />
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">คำสั่งซื้อล่าสุด</h2>
        <Button asChild size="sm" variant="ghost">
          <Link href="/admin/orders">ดูทั้งหมด</Link>
        </Button>
      </div>
      <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
        <RecentOrders />
      </Suspense>
    </AdminPage>
  );
}
