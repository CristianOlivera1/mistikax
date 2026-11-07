import "server-only";

import { desc } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import type { AdminCustomer, CustomerFilters } from "./types";

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export function parseCustomerFilters(
  params: Record<string, string | string[] | undefined>,
): CustomerFilters {
  return { query: first(params.q).trim() };
}

export async function getCustomers(
  filters: CustomerFilters = { query: "" },
): Promise<AdminCustomer[]> {
  const allOrders = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt), desc(orders.number));
  const customers = new Map<string, AdminCustomer>();

  for (const order of allOrders) {
    const current = customers.get(order.email);

    if (!current) {
      customers.set(order.email, {
        id: order.email,
        name: order.customerName,
        email: order.email,
        phone: order.phone,
        city: order.city,
        orderCount: 1,
        spentCents: order.status === "cancelled" ? 0 : order.totalCents,
        lastPurchaseAt: order.createdAt.toISOString(),
      });
      continue;
    }

    current.orderCount += 1;

    if (order.status !== "cancelled") {
      current.spentCents += order.totalCents;
    }
  }

  const query = filters.query.toLowerCase();

  return [...customers.values()]
    .filter(
      (customer) =>
        !query ||
        `${customer.name} ${customer.email} ${customer.phone}`
          .toLowerCase()
          .includes(query),
    )
    .sort((a, b) => b.spentCents - a.spentCents);
}
