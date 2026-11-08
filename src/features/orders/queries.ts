import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  or,
  sql,
} from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orderStatusHistory, orders } from "@/db/schema";
import { ORDER_STATUSES, STORE, type OrderStatus } from "@/lib/constants";
import {
  ORDERS_PAGE_SIZE,
  type AdminOrder,
  type OrderFilters,
  type OrderItem,
  type OrderPage,
  type OrderStatusFilter,
} from "./types";
import type { OrderStatusEvent } from "./types";

type OrderRow = typeof orders.$inferSelect;
type OrderItemRow = typeof orderItems.$inferSelect;
type OrderHistoryRow = typeof orderStatusHistory.$inferSelect;

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

function orderConditions(filters: OrderFilters) {
  const conditions = [];

  if (filters.status !== "all") {
    conditions.push(eq(orders.status, filters.status));
  }

  const query = filters.query;

  if (query) {
    const digits = query.replace(/#/g, "").trim();
    const pattern = `%${query}%`;
    const numberPattern = digits ? `%${digits}%` : null;

    conditions.push(
      or(
        ilike(orders.customerName, pattern),
        ilike(orders.email, pattern),
        ...(numberPattern
          ? [sql`cast(${orders.number} as text) ilike ${numberPattern}`]
          : []),
      ),
    );
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

function toItem(row: OrderItemRow): OrderItem {
  return {
    productId: row.productId ?? "",
    productName: row.productName,
    productImage: row.productImage,
    priceCents: row.priceCents,
    size: row.size,
    colorName: row.colorName,
    quantity: row.quantity,
  };
}

function toHistoryEvent(row: OrderHistoryRow): OrderStatusEvent {
  return {
    status: row.status,
    at: row.createdAt.toISOString(),
  };
}

function buildAdminOrder(
  row: OrderRow,
  items: OrderItem[],
  history: OrderStatusEvent[],
): AdminOrder {
  return {
    id: row.id,
    number: row.number,
    customerName: row.customerName,
    customerEmail: row.email,
    customerPhone: row.phone,
    customerCity: row.city,
    customerAddress: row.address,
    shippingMethod: row.shippingMethod,
    shippingZone: row.shippingZone as AdminOrder["shippingZone"],
    status: row.status,
    paymentMethod: row.paymentMethod,
    items,
    shippingCents: row.shippingCents,
    note: row.note,
    createdAt: row.createdAt.toISOString(),
    history,
  };
}

async function getItemsByOrder(
  orderIds: string[],
): Promise<Map<string, OrderItem[]>> {
  const grouped = new Map<string, OrderItem[]>();

  if (orderIds.length === 0) return grouped;

  const rows = await db
    .select()
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds))
    .orderBy(asc(orderItems.id));

  for (const row of rows) {
    const items = grouped.get(row.orderId) ?? [];

    items.push(toItem(row));
    grouped.set(row.orderId, items);
  }

  return grouped;
}

export async function getOrderStatusCounts(): Promise<
  Record<OrderStatusFilter, number>
> {
  const rows = await db
    .select({ status: orders.status, value: count() })
    .from(orders)
    .groupBy(orders.status);
  const counts = {
    all: 0,
    pending: 0,
    paid: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  } satisfies Record<OrderStatusFilter, number>;

  for (const row of rows) {
    counts[row.status] = Number(row.value);
    counts.all += Number(row.value);
  }

  return counts;
}

export async function getOrderPage(filters: OrderFilters): Promise<OrderPage> {
  const where = orderConditions(filters);
  const [totals] = await db
    .select({ value: count() })
    .from(orders)
    .where(where);
  const total = Number(totals?.value ?? 0);
  const pageCount = Math.max(1, Math.ceil(total / ORDERS_PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);
  const rows = await db
    .select()
    .from(orders)
    .where(where)
    .orderBy(desc(orders.createdAt), desc(orders.number))
    .limit(ORDERS_PAGE_SIZE)
    .offset((page - 1) * ORDERS_PAGE_SIZE);
  const itemsByOrder = await getItemsByOrder(rows.map((row) => row.id));

  return {
    items: rows.map((row) =>
      buildAdminOrder(row, itemsByOrder.get(row.id) ?? [], []),
    ),
    total,
    page,
    pageCount,
    pageSize: ORDERS_PAGE_SIZE,
    from: total === 0 ? 0 : (page - 1) * ORDERS_PAGE_SIZE + 1,
    to: Math.min((page - 1) * ORDERS_PAGE_SIZE + ORDERS_PAGE_SIZE, total),
  };
}

export async function getOrderById(
  id: string,
): Promise<AdminOrder | undefined> {
  const [row] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (!row) return undefined;

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, id))
    .orderBy(asc(orderItems.id));
  const historyRows = await db
    .select()
    .from(orderStatusHistory)
    .where(eq(orderStatusHistory.orderId, id))
    .orderBy(asc(orderStatusHistory.createdAt));

  return buildAdminOrder(
    row,
    items.map(toItem),
    historyRows.map(toHistoryEvent),
  );
}

export async function getAllOrdersForPage(): Promise<AdminOrder[]> {
  const rows = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt), desc(orders.number));
  const itemsByOrder = await getItemsByOrder(rows.map((row) => row.id));

  return rows.map((row) =>
    buildAdminOrder(row, itemsByOrder.get(row.id) ?? [], []),
  );
}

export function getOrderWhatsAppHref(order: AdminOrder): string {
  const digits = order.customerPhone.replace(/\D/g, "");
  const phone = digits.startsWith("51") ? digits : `51${digits}`;
  const message = `Hola ${order.customerName}, te escribimos de ${STORE.name} por tu pedido #${order.number}.`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
