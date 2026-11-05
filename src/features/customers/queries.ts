import "server-only";

import { ORDERS } from "@/features/orders/fixtures";
import { getOrderTotalCents, type AdminOrder } from "@/features/orders/types";
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

function upsertCustomer(
  customers: Map<string, AdminCustomer>,
  order: AdminOrder,
) {
  const current = customers.get(order.customerEmail);

  if (!current) {
    customers.set(order.customerEmail, {
      id: order.customerEmail,
      name: order.customerName,
      email: order.customerEmail,
      phone: order.customerPhone,
      city: order.customerCity,
      orderCount: 1,
      spentCents: order.status === "cancelled" ? 0 : getOrderTotalCents(order),
      lastPurchaseAt: order.createdAt,
    });
    return;
  }

  current.orderCount += 1;

  if (order.status !== "cancelled") {
    current.spentCents += getOrderTotalCents(order);
  }

  if (order.createdAt > current.lastPurchaseAt) {
    current.lastPurchaseAt = order.createdAt;
    current.name = order.customerName;
    current.phone = order.customerPhone;
    current.city = order.customerCity;
  }
}

export function getCustomers(filters: CustomerFilters = { query: "" }) {
  const customers = new Map<string, AdminCustomer>();

  for (const order of ORDERS) {
    upsertCustomer(customers, order);
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
