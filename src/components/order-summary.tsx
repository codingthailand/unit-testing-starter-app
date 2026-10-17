import { Price } from "@/components/course/price";
import type { CheckoutQuote } from "@/lib/checkout/checkout-quote";
import { formatTHB } from "@/lib/shared/money";

/** สรุปยอดจากใบเสนอราคาที่ server คำนวณ */
export function OrderSummary({ quote }: { quote: CheckoutQuote }) {
  return (
    <dl className="space-y-2 text-sm" data-testid="order-summary">
      <div className="flex justify-between">
        <dt className="text-muted-foreground">ราคารวม</dt>
        <dd data-testid="summary-subtotal">{formatTHB(quote.subtotalSatang)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-muted-foreground">
          ส่วนลด{quote.coupon && <span className="ml-1 font-medium text-primary">({quote.coupon.code})</span>}
        </dt>
        <dd className="text-emerald-600 dark:text-emerald-400" data-testid="summary-discount">
          −{formatTHB(quote.discountSatang)}
        </dd>
      </div>
      <div className="flex justify-between border-t pt-3 font-semibold text-base">
        <dt>ยอดชำระ</dt>
        <dd data-testid="summary-total">
          <Price satang={quote.totalSatang} />
        </dd>
      </div>
    </dl>
  );
}
