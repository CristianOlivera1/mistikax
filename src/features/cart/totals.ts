export type CartTotalsInput = {
  priceCents: number;
  qty: number;
};

export type CartTotals = {
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  itemCount: number;
  freeShippingRemainingCents: number;
};

export type ShippingRules = {
  shippingCents: number;
  freeShippingCents: number;
};

export function computeCartTotals(
  lines: CartTotalsInput[],
  rules: ShippingRules,
): CartTotals {
  const subtotalCents = lines.reduce(
    (total, line) => total + line.priceCents * line.qty,
    0,
  );
  const itemCount = lines.reduce((total, line) => total + line.qty, 0);
  const freeShippingRemainingCents = Math.max(
    0,
    rules.freeShippingCents - subtotalCents,
  );
  const shippingCents =
    subtotalCents === 0 || freeShippingRemainingCents === 0
      ? 0
      : rules.shippingCents;

  return {
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
    itemCount,
    freeShippingRemainingCents,
  };
}
