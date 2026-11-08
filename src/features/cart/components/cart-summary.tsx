import type { ReactNode } from "react";
import { formatMoney } from "@/lib/format";
import type { CartTotals } from "@/features/cart/totals";

type CartSummaryProps = {
  totals: CartTotals;
  estimate?: boolean;
  children?: ReactNode;
};

export function CartSummary({
  totals,
  estimate = false,
  children,
}: CartSummaryProps) {
  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-grey-dark">Subtotal</span>
        <span>{formatMoney(totals.subtotalCents)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-grey-dark">
          {estimate ? "Envío (desde)" : "Envío"}
        </span>
        <span>
          {totals.shippingCents === 0
            ? "Gratis"
            : formatMoney(totals.shippingCents)}
        </span>
      </div>
      <div className="border-grey-light flex items-center justify-between border-t pt-3 text-base font-semibold">
        <span>Total</span>
        <span>{formatMoney(totals.totalCents)}</span>
      </div>
      {children}
    </div>
  );
}
