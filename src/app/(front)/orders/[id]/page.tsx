import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { requireUser } from "@/lib/auth/session";
import { services } from "@/lib/container";
import { OrderCard } from "../order-card";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = { title: "รายละเอียดคำสั่งซื้อ" };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
};

async function OrderDetail({ params, searchParams }: Props) {
  await connection();
  const { id } = await params;
  const { success } = await searchParams;
  const user = await requireUser(`/orders/${id}`);
  const orderId = Number(id);
  const order = Number.isInteger(orderId) ? await services.order.getOrder(orderId, user.id) : null;
  if (!order) notFound();

  return (
    <div className="space-y-6">
      {success && order.status === "PAID" && (
        <Alert data-testid="checkout-success">
          <CheckCircle2 />
          <AlertTitle>ชำระเงินสำเร็จ ขอบคุณที่สั่งซื้อ</AlertTitle>
          <AlertDescription>คอร์สทั้งหมดพร้อมเรียนแล้วที่หน้า &ldquo;คอร์สของฉัน&rdquo;</AlertDescription>
        </Alert>
      )}
      <OrderCard order={order} />
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/my-courses">ไปที่คอร์สของฉัน</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/orders">คำสั่งซื้อทั้งหมด</Link>
        </Button>
      </div>
    </div>
  );
}

// http://localhost:3000/orders/1
export default function OrderPage(props: Props) {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Suspense fallback={<Skeleton className="h-64 w-full rounded-xl" />}>
        <OrderDetail {...props} />
      </Suspense>
    </main>
  );
}
