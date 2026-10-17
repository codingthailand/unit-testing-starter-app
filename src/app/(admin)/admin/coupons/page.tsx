import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { services } from "@/lib/container";
import { AdminPage } from "../../components/admin-page";
import CouponManager from "../../components/coupon-manager";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = { title: "คูปอง" };

async function Coupons() {
  await connection();
  return <CouponManager coupons={await services.coupon.listCoupons()} />;
}

// http://localhost:3000/admin/coupons
export default function AdminCouponsPage() {
  return (
    <AdminPage description="คูปองใช้ได้ 1 ใบต่อคำสั่งซื้อ ลดทั้งตะกร้า" title="คูปอง">
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <Coupons />
      </Suspense>
    </AdminPage>
  );
}
