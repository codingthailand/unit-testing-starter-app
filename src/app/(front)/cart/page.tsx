import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import CartView from "./cart-view";

export const metadata: Metadata = { title: "ตะกร้า" };

// http://localhost:3000/cart
export default function CartPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <PageHeader description="ราคาและส่วนลดคำนวณจากระบบทุกครั้งก่อนชำระเงิน" title="ตะกร้าของฉัน" />
      <div className="mt-8">
        <CartView />
      </div>
    </main>
  );
}
