import { describe, expect, it } from "vitest";
import {
  buildStockRestoreDeltas,
  canTransitionOrderStatus,
  computeOrderTotals,
  statusTransitionRestoresStock,
} from "./service";
import type { OrderStatus } from "../../lib/constants";

describe("computeOrderTotals", () => {
  it("suma precio unitario por cantidad en el subtotal", () => {
    const totals = computeOrderTotals(
      [
        { priceCents: 5990, quantity: 2 },
        { priceCents: 3490, quantity: 1 },
      ],
      1500,
    );

    expect(totals.subtotalCents).toBe(5990 * 2 + 3490);
    expect(totals.totalCents).toBe(5990 * 2 + 3490 + 1500);
  });

  it("mantiene el subtotal cuando la línea repite el producto", () => {
    const totals = computeOrderTotals(
      [
        { priceCents: 2000, quantity: 1 },
        { priceCents: 2000, quantity: 3 },
      ],
      0,
    );

    expect(totals.subtotalCents).toBe(8000);
    expect(totals.totalCents).toBe(8000);
  });

  it("sin líneas el total es solo el envío", () => {
    const totals = computeOrderTotals([], 1500);

    expect(totals.subtotalCents).toBe(0);
    expect(totals.totalCents).toBe(1500);
  });
});

describe("canTransitionOrderStatus", () => {
  const allowed: Array<[OrderStatus, OrderStatus]> = [
    ["pending", "paid"],
    ["paid", "shipped"],
    ["shipped", "delivered"],
    ["pending", "cancelled"],
    ["paid", "cancelled"],
  ];
  const forbidden: Array<[OrderStatus, OrderStatus]> = [
    ["pending", "shipped"],
    ["pending", "delivered"],
    ["paid", "delivered"],
    ["shipped", "cancelled"],
    ["delivered", "pending"],
    ["delivered", "cancelled"],
    ["cancelled", "paid"],
    ["cancelled", "cancelled"],
    ["paid", "paid"],
  ];

  it("permite solo los pasos válidos del flujo y la cancelación temprana", () => {
    for (const [from, to] of allowed) {
      expect(canTransitionOrderStatus(from, to), `${from} -> ${to}`).toBe(true);
    }
  });

  it("rechaza saltos, retrocesos y estados terminales", () => {
    for (const [from, to] of forbidden) {
      expect(canTransitionOrderStatus(from, to), `${from} -> ${to}`).toBe(false);
    }
  });
});

describe("statusTransitionRestoresStock", () => {
  it("restaura stock solo al cancelar", () => {
    expect(statusTransitionRestoresStock("cancelled")).toBe(true);
    expect(statusTransitionRestoresStock("paid")).toBe(false);
    expect(statusTransitionRestoresStock("delivered")).toBe(false);
  });
});

describe("buildStockRestoreDeltas", () => {
  it("agrupa por producto y talla la cantidad a restaurar", () => {
    const deltas = buildStockRestoreDeltas([
      { productId: "polo", size: "S", quantity: 2 },
      { productId: "polo", size: "S", quantity: 1 },
      { productId: "polo", size: "M", quantity: 1 },
      { productId: "gorra", size: "Única", quantity: 3 },
    ]);

    expect(deltas).toEqual([
      { productId: "polo", size: "S", restoreQuantity: 3 },
      { productId: "polo", size: "M", restoreQuantity: 1 },
      { productId: "gorra", size: "Única", restoreQuantity: 3 },
    ]);
  });

  it("no restaura líneas con cantidad cero", () => {
    const deltas = buildStockRestoreDeltas([
      { productId: "polo", size: "S", quantity: 0 },
    ]);

    expect(deltas).toEqual([
      { productId: "polo", size: "S", restoreQuantity: 0 },
    ]);
  });
});
