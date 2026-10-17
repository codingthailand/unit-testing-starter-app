import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { services } from "@/lib/container";
import { AdminPage } from "../../components/admin-page";
import { OrdersTable } from "../../components/orders-table";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = { title: "คำสั่งซื้อ" };

async function AllOrders() {
  await connection();
  return <OrdersTable orders={await services.admin.listOrders(100)} />;
}

// http://localhost:3000/admin/orders
export default function AdminOrdersPage() {
  return (
    <AdminPage description="คำสั่งซื้อล่าสุด 100 รายการ" title="คำสั่งซื้อ">
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <AllOrders />
      </Suspense>
    </AdminPage>
  );
}
