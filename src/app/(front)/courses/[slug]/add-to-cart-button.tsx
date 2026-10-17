"use client";

import { Check, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/use-hydrated";
import { useCartStore } from "@/stores/cart-store";
import type { CartItem } from "@/types/cart";
import { enrollFreeAction } from "./actions";

export default function AddToCartButton({ item, isLoggedIn }: { item: CartItem; isLoggedIn: boolean }) {
  const hydrated = useHydrated();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const inCart = useCartStore((state) => state.items.some((current) => current.courseId === item.courseId));
  const add = useCartStore((state) => state.add);

  if (item.priceSatang === 0) {
    const enroll = () =>
      startTransition(async () => {
        if (!isLoggedIn) {
          router.push(`/login?next=/courses/${item.slug}`);
          return;
        }
        const result = await enrollFreeAction({ courseId: item.courseId, slug: item.slug });
        if (result.ok) toast.success(result.message);
        else toast.error(result.message);
        router.refresh();
      });
    return (
      <Button className="w-full" data-testid="enroll-free" disabled={pending} onClick={enroll} size="lg">
        ลงทะเบียนเรียนฟรี
      </Button>
    );
  }

  if (hydrated && inCart) {
    return (
      <Button asChild className="w-full" data-testid="go-to-cart" size="lg" variant="secondary">
        <Link href="/cart">
          <Check /> อยู่ในตะกร้าแล้ว — ไปที่ตะกร้า
        </Link>
      </Button>
    );
  }

  return (
    <Button
      className="w-full"
      data-testid="add-to-cart"
      disabled={!hydrated}
      onClick={() => {
        add(item);
        toast.success("เพิ่มลงตะกร้าแล้ว");
      }}
      size="lg"
    >
      <ShoppingCart /> เพิ่มลงตะกร้า
    </Button>
  );
}
