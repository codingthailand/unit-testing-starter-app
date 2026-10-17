import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { requireUser } from "@/lib/auth/session";
import { services } from "@/lib/container";
import { OrderCard } from "./order-card";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = { title: "ประวัติการสั่งซื้อ" };

async function OrderList() {
  await connection();
  const user = await requireUser("/orders");
  const orders = await services.order.listOrders(user.id);

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center" data-testid="orders-empty">
        <p className="font-medium">ยังไม่มีคำสั่งซื้อ</p>
        <Button asChild className="mt-4">
          <Link href="/courses">เลือกคอร์สเรียน</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="orders">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}

// http://localhost:3000/orders
export default function OrdersPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <PageHeader description="ขอคืนเงินได้รายคอร์ส ภายใน 7 วันหลังชำระเงิน และเรียนไปไม่เกิน 20%" title="ประวัติการสั่งซื้อ" />
      <div className="mt-8">
        <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
          <OrderList />
        </Suspense>
      </div>
    </main>
  );
}
