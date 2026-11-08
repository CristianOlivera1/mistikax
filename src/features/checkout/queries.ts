import "server-only";

import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import type { ShippingMethod, ShippingZone } from "./shipping";
import { verifyOrderToken } from "./token";

export type OrderConfirmation = {
  number: number;
  customerName: string;
  city: string;
  address: string;
  shippingMethod: ShippingMethod;
  shippingZone: ShippingZone;
  shippingCents: number;
  totalCents: number;
  items: Array<{
    productName: string;
    size: string;
    quantity: number;
    priceCents: number;
  }>;
};

export async function getOrderConfirmation(
  orderId: string,
  number: number,
  token: string,
): Promise<OrderConfirmation | null> {
  if (!verifyOrderToken(orderId, number, token)) return null;

  const [orderRows, items] = await Promise.all([
    db.select().from(orders).where(eq(orders.id, orderId)).limit(1),
    db
      .select({
        productName: orderItems.productName,
        size: orderItems.size,
        quantity: orderItems.quantity,
        priceCents: orderItems.priceCents,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId))
      .orderBy(asc(orderItems.id)),
  ]);
  const [order] = orderRows;

  if (!order || order.number !== number) return null;

  return {
    number: order.number,
    customerName: order.customerName,
    city: order.city,
    address: order.address,
    shippingMethod: order.shippingMethod,
    shippingZone: order.shippingZone as ShippingZone,
    shippingCents: order.shippingCents,
    totalCents: order.totalCents,
    items,
  };
}
