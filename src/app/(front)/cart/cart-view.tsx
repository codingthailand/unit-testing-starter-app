"use client";

import { ShoppingCart, Tag, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CourseCover } from "@/components/course/course-cover";
import { Price } from "@/components/course/price";
import { OrderSummary } from "@/components/order-summary";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCartQuote } from "@/hooks/use-cart-quote";
import { useHydrated } from "@/hooks/use-hydrated";
import { cartCourseIds, useCartStore } from "@/stores/cart-store";

export default function CartView() {
  const hydrated = useHydrated();
  const items = useCartStore((state) => state.items);
  const couponCode = useCartStore((state) => state.couponCode);
  const remove = useCartStore((state) => state.remove);
  const setCoupon = useCartStore((state) => state.setCoupon);
  const [couponInput, setCouponInput] = useState("");
  const quote = useCartQuote(cartCourseIds({ items, couponCode }), couponCode, hydrated);

  if (!hydrated) return <Skeleton className="h-64 w-full rounded-xl" />;

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center" data-testid="cart-empty">
        <ShoppingCart className="mx-auto size-10 text-muted-foreground" />
        <p className="mt-4 font-medium">ตะกร้ายังว่างอยู่</p>
        <Button asChild className="mt-4">
          <Link href="/courses">เลือกคอร์สเรียน</Link>
        </Button>
      </div>
    );
  }

  const couponError = quote && !quote.ok && quote.code.startsWith("COUPON") ? quote.message : null;
  const cartError = quote && !quote.ok && !quote.code.startsWith("COUPON") ? quote.message : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <ul className="divide-y rounded-xl border" data-testid="cart-items">
        {items.map((item) => (
          <li className="flex gap-4 p-4" data-testid={`cart-item-${item.courseId}`} key={item.courseId}>
            <CourseCover className="w-32 shrink-0 rounded-lg sm:w-40" imageName={item.imageName} title={item.title} />
            <div className="flex flex-1 flex-col justify-between gap-2">
              <Link className="font-medium hover:text-primary" href={`/courses/${item.slug}`}>
                {item.title}
              </Link>
              <div className="flex items-center justify-between">
                <Price satang={item.priceSatang} />
                <Button
                  aria-label={`ลบ ${item.title}`}
                  data-testid={`cart-remove-${item.courseId}`}
                  onClick={() => remove(item.courseId)}
                  size="sm"
                  variant="ghost"
                >
                  <Trash2 /> ลบ
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="space-y-4 rounded-xl border bg-card p-5">
          <form
            className="space-y-2"
            onSubmit={(event) => {
              event.preventDefault();
              setCoupon(couponInput);
            }}
          >
            <label className="flex items-center gap-2 font-medium text-sm" htmlFor="coupon-input">
              <Tag className="size-4" /> คูปองส่วนลด
            </label>
            {couponCode ? (
              <div className="flex items-center justify-between rounded-md border border-primary/40 bg-primary/5 px-3 py-2 text-sm">
                <span className="font-medium" data-testid="coupon-applied">
                  {couponCode.toUpperCase()}
                </span>
                <Button
                  aria-label="ยกเลิกคูปอง"
                  data-testid="coupon-remove"
                  onClick={() => {
                    setCoupon(null);
                    setCouponInput("");
                  }}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <X />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  data-testid="coupon-input"
                  id="coupon-input"
                  onChange={(event) => setCouponInput(event.target.value)}
                  placeholder="เช่น WELCOME20"
                  value={couponInput}
                />
                <Button data-testid="coupon-apply" type="submit" variant="outline">
                  ใช้คูปอง
                </Button>
              </div>
            )}
            {couponError && (
              <p className="text-destructive text-sm" data-testid="coupon-error">
                {couponError}
              </p>
            )}
          </form>

          {cartError && (
            <Alert data-testid="cart-error" variant="destructive">
              <AlertDescription>{cartError}</AlertDescription>
            </Alert>
          )}

          {quote?.ok ? <OrderSummary quote={quote.data} /> : !cartError && !couponError && <Skeleton className="h-24 w-full" />}

          <Button asChild className="w-full" data-testid="cart-checkout" disabled={!quote?.ok} size="lg">
            <Link aria-disabled={!quote?.ok} href="/checkout">
              ไปชำระเงิน
            </Link>
          </Button>
        </div>
      </aside>
    </div>
  );
}
