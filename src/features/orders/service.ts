import type { OrderStatus } from "../../lib/constants";

export type OrderTotals = {
  subtotalCents: number;
  totalCents: number;
};

export type PricedOrderLineInput = {
  priceCents: number;
  quantity: number;
};

const FORWARD_FLOW: OrderStatus[] = ["pending", "paid", "shipped", "delivered"];

function isForwardStep(from: OrderStatus, to: OrderStatus): boolean {
  const fromIndex = FORWARD_FLOW.indexOf(from);
  const toIndex = FORWARD_FLOW.indexOf(to);

  return fromIndex !== -1 && toIndex === fromIndex + 1;
}

export function canTransitionOrderStatus(
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  if (from === to) return false;
  if (from === "cancelled" || from === "delivered") return false;
  if (to === "cancelled") return from === "pending" || from === "paid";

  return isForwardStep(from, to);
}

export function statusTransitionRestoresStock(to: OrderStatus): boolean {
  return to === "cancelled";
}

export function computeOrderTotals(
  lines: PricedOrderLineInput[],
  shippingCents: number,
): OrderTotals {
  const subtotalCents = lines.reduce(
    (total, line) => total + line.priceCents * line.quantity,
    0,
  );

  return {
    subtotalCents,
    totalCents: subtotalCents + shippingCents,
  };
}

export type StockLineInput = {
  productId: string;
  size: string;
  quantity: number;
};

export type StockDelta = {
  productId: string;
  size: string;
  restoreQuantity: number;
};

export function buildStockRestoreDeltas(
  lines: StockLineInput[],
): StockDelta[] {
  const deltas = new Map<string, StockDelta>();

  for (const line of lines) {
    const key = `${line.productId}·${line.size}`;
    const current = deltas.get(key);

    if (current) {
      current.restoreQuantity += line.quantity;
    } else {
      deltas.set(key, {
        productId: line.productId,
        size: line.size,
        restoreQuantity: line.quantity,
      });
    }
  }

  return [...deltas.values()];
}
