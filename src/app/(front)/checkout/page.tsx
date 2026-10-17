import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { requireUser } from "@/lib/auth/session";
import CheckoutForm from "./checkout-form";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = { title: "ชำระเงิน" };

async function CheckoutContent() {
  await connection();
  await requireUser("/checkout"); // ต้อง login ก่อน checkout
  return <CheckoutForm />;
}

// http://localhost:3000/checkout
export default function CheckoutPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <PageHeader title="ชำระเงิน" />
      <div className="mt-8">
        <Suspense fallback={<Skeleton className="h-80 w-full rounded-xl" />}>
          <CheckoutContent />
        </Suspense>
      </div>
    </main>
  );
}
