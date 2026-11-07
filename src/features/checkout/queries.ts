import "server-only";

import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { verifyOrderToken } from "./token";

export type OrderConfirmation = {
  number: number;
  customerName: string;
  city: string;
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

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order || order.number !== number) return null;

  const items = await db
    .select({
      productName: orderItems.productName,
      size: orderItems.size,
      quantity: orderItems.quantity,
      priceCents: orderItems.priceCents,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId))
    .orderBy(asc(orderItems.id));

  return {
    number: order.number,
    customerName: order.customerName,
    city: order.city,
    totalCents: order.totalCents,
    items,
  };
}
