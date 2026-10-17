"use client";

import { useHydrated } from "@/hooks/use-hydrated";
import { useCartStore } from "@/stores/cart-store";

/** จำนวนคอร์สในตะกร้า (อ่านจาก localStorage จึงแสดงหลัง hydrate) */
export default function CartCount() {
  const hydrated = useHydrated();
  const count = useCartStore((state) => state.items.length);

  return <span data-testid="nav-cart-count">{hydrated ? count : 0}</span>;
}
