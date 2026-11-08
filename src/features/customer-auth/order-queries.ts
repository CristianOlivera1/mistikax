import "server-only";

import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/constants";
import { formatMoney } from "@/lib/format";

export type CustomerOrderSummary = {
  id: string;
  number: number;
  status: OrderStatus;
  statusLabel: string;
  totalCents: number;
  totalFormatted: string;
  createdAt: Date;
};

export async function getCustomerOrders(
  customerId: string,
): Promise<CustomerOrderSummary[]> {
  const rows = await db
    .select({
      id: orders.id,
      number: orders.number,
      status: orders.status,
      totalCents: orders.totalCents,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.customerId, customerId))
    .orderBy(desc(orders.createdAt))
    .limit(50);

  return rows.map((row) => ({
    id: row.id,
    number: row.number,
    status: row.status,
    statusLabel: ORDER_STATUSES[row.status],
    totalCents: row.totalCents,
    totalFormatted: formatMoney(row.totalCents),
    createdAt: row.createdAt,
  }));
}
