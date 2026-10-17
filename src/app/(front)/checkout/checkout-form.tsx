"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { OrderSummary } from "@/components/order-summary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCartQuote } from "@/hooks/use-cart-quote";
import { useHydrated } from "@/hooks/use-hydrated";
import { TEST_CARDS } from "@/lib/payment/fake-payment-gateway";
import { cardFormSchema, type CardFormValues } from "@/lib/validation/checkout-schema";
import { cartCourseIds, useCartStore } from "@/stores/cart-store";
import { checkoutAction } from "./actions";

export default function CheckoutForm() {
  const hydrated = useHydrated();
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const couponCode = useCartStore((state) => state.couponCode);
  const clear = useCartStore((state) => state.clear);
  const courseIds = cartCourseIds({ items, couponCode });
  const quote = useCartQuote(courseIds, couponCode, hydrated);

  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: { cardName: "", cardNumber: "" },
  });

  async function onSubmit(values: CardFormValues) {
    const result = await checkoutAction({ courseIds, couponCode, ...values });
    if (result.ok) {
      clear();
      toast.success(result.message);
      router.push(`/orders/${result.data.orderId}?success=1`);
      return;
    }
    if (result.fieldErrors) {
      for (const [name, messages] of Object.entries(result.fieldErrors)) {
        if (name === "cardNumber" || name === "cardName") form.setError(name, { message: messages[0] });
      }
    }
    toast.error(result.message);
    router.refresh();
  }

  if (!hydrated) return <Skeleton className="h-80 w-full rounded-xl" />;

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center" data-testid="checkout-empty">
        <p className="font-medium">ไม่มีคอร์สในตะกร้า</p>
        <Button asChild className="mt-4">
          <Link href="/courses">เลือกคอร์สเรียน</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <form className="space-y-6 rounded-xl border bg-card p-6" data-testid="checkout-form" onSubmit={form.handleSubmit(onSubmit)}>
        <h2 className="flex items-center gap-2 font-semibold text-lg">
          <CreditCard className="size-5" /> ชำระด้วยบัตร
        </h2>

        <Alert>
          <Info />
          <AlertTitle>ระบบชำระเงินจำลอง — ไม่มีการตัดเงินจริง</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4">
              <li>
                <code>{TEST_CARDS.APPROVED}</code> ชำระสำเร็จ
              </li>
              <li>
                <code>{TEST_CARDS.DECLINED}</code> บัตรถูกปฏิเสธ
              </li>
              <li>
                <code>{TEST_CARDS.NETWORK_ERROR}</code> ระบบชำระเงินขัดข้อง
              </li>
            </ul>
          </AlertDescription>
        </Alert>

        <FieldGroup>
          <Controller
            control={form.control}
            name="cardName"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="card-name">ชื่อบนบัตร</FieldLabel>
                <Input {...field} aria-invalid={fieldState.invalid} autoComplete="cc-name" data-testid="card-name" id="card-name" />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="cardNumber"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="card-number">หมายเลขบัตร</FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  autoComplete="cc-number"
                  data-testid="card-number"
                  id="card-number"
                  inputMode="numeric"
                  placeholder="4242 4242 4242 4242"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>

        <Button
          className="w-full"
          data-testid="checkout-submit"
          disabled={form.formState.isSubmitting || !quote?.ok}
          size="lg"
          type="submit"
        >
          {form.formState.isSubmitting ? "กำลังชำระเงิน..." : "ยืนยันการชำระเงิน"}
        </Button>
      </form>

      <aside className="space-y-4 rounded-xl border bg-card p-5 lg:sticky lg:top-24 lg:self-start">
        <h2 className="font-semibold">สรุปคำสั่งซื้อ</h2>
        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li className="flex justify-between gap-4" key={item.courseId}>
              <span className="line-clamp-1">{item.title}</span>
            </li>
          ))}
        </ul>
        {quote === null && <Skeleton className="h-24 w-full" />}
        {quote?.ok && <OrderSummary quote={quote.data} />}
        {quote && !quote.ok && (
          <Alert data-testid="checkout-error" variant="destructive">
            <AlertDescription>
              {quote.message} — <Link className="underline" href="/cart">กลับไปแก้ไขตะกร้า</Link>
            </AlertDescription>
          </Alert>
        )}
      </aside>
    </div>
  );
}
