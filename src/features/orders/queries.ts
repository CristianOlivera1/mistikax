import "server-only";

import { ORDER_STATUSES, STORE, type OrderStatus } from "@/lib/constants";
import { ORDERS } from "./fixtures";
import {
  ORDERS_PAGE_SIZE,
  type AdminOrder,
  type OrderFilters,
  type OrderPage,
  type OrderStatusFilter,
} from "./types";

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function isOrderStatus(value: string): value is OrderStatus {
  return value in ORDER_STATUSES;
}

export function parseOrderFilters(
  params: Record<string, string | string[] | undefined>,
): OrderFilters {
  const statusValue = first(params.status);
  const pageValue = Number.parseInt(first(params.page), 10);

  return {
    status: isOrderStatus(statusValue) ? statusValue : "all",
    query: first(params.q).trim(),
    page: Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1,
  };
}

export function getOrderStatusCounts(): Record<OrderStatusFilter, number> {
  const counts = {
    all: ORDERS.length,
    pending: 0,
    paid: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  } satisfies Record<OrderStatusFilter, number>;

  for (const order of ORDERS) {
    counts[order.status] += 1;
  }

  return counts;
}

export function getOrderPage(filters: OrderFilters): OrderPage {
  const query = filters.query.toLowerCase();
  const filtered = ORDERS.filter((order) => {
    const matchesStatus =
      filters.status === "all" || order.status === filters.status;
    const matchesQuery =
      !query ||
      `${order.customerName} ${order.id} ${order.customerEmail}`
        .toLowerCase()
        .includes(query);

    return matchesStatus && matchesQuery;
  });
  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / ORDERS_PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);
  const start = (page - 1) * ORDERS_PAGE_SIZE;

  return {
    items: filtered.slice(start, start + ORDERS_PAGE_SIZE),
    total,
    page,
    pageCount,
    pageSize: ORDERS_PAGE_SIZE,
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + ORDERS_PAGE_SIZE, total),
  };
}

export function getOrderById(id: string): AdminOrder | undefined {
  return ORDERS.find((order) => order.id === id);
}

export function getOrderWhatsAppHref(order: AdminOrder): string {
  const digits = order.customerPhone.replace(/\D/g, "");
  const phone = digits.startsWith("51") ? digits : `51${digits}`;
  const message = `Hola ${order.customerName}, te escribimos de ${STORE.name} por tu pedido #${order.number}.`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
