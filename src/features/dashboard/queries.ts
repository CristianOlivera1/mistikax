import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  inArray,
  lt,
  ne,
  sql,
} from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  orderItems,
  orders,
  productStock,
  products,
  siteSettings,
} from "@/db/schema";
import { formatDayMonth } from "@/lib/format";
import {
  ADMIN_NAV,
  type AdminBadgeCounts,
  type AdminSearchItem,
} from "@/lib/nav";
import type {
  DashboardOverview,
  DashboardRange,
  LowStockItem,
  OrderFixture,
  SalesPoint,
  StockStatus,
  TopProduct,
} from "./types";

const DAY_MS = 86_400_000;
const LIMA_TZ = "America/Lima";

function limaDayKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: LIMA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function dayStart(dayKey: string): number {
  return Date.parse(`${dayKey}T15:00:00.000Z`);
}

const SALES_DAY = sql<string>`to_char(${orders.createdAt} at time zone 'America/Lima', 'YYYY-MM-DD')`;

async function getSalesByDay(
  inclusiveFrom: Date,
  exclusiveTo: Date,
): Promise<Map<string, DayAggregate>> {
  const rows = await db
    .select({
      day: SALES_DAY,
      totalCents: sql<string>`coalesce(sum(${orders.totalCents}), 0)`,
      orderCount: count(),
    })
    .from(orders)
    .where(
      and(
        ne(orders.status, "cancelled"),
        gte(orders.createdAt, inclusiveFrom),
        lt(orders.createdAt, exclusiveTo),
      ),
    )
    .groupBy(SALES_DAY)
    .orderBy(SALES_DAY);
  const byDay = new Map<string, DayAggregate>();

  for (const row of rows) {
    byDay.set(row.day, {
      day: row.day,
      totalCents: Number(row.totalCents),
      orderCount: Number(row.orderCount),
    });
  }

  return byDay;
}

type DayAggregate = { day: string; totalCents: number; orderCount: number };

export function parseDashboardRange(value: string | undefined): DashboardRange {
  if (value === "7") return 7;
  if (value === "14") return 14;
  return 30;
}

type StockStat = {
  id: string;
  name: string;
  categoryName: string;
  stockTotal: number;
  sizeCount: number;
  stockStatus: StockStatus;
};

async function getStockStats(): Promise<StockStat[]> {
  const thresholdRows = await db
    .select({ value: siteSettings.lowStockThreshold })
    .from(siteSettings)
    .where(eq(siteSettings.id, 1))
    .limit(1);
  const productRows = await db
    .select({
      id: products.id,
      name: products.name,
      categoryName: categories.name,
      status: products.status,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id));
  const stockRows = await db
    .select({
      productId: productStock.productId,
      stockTotal: sql<string>`coalesce(sum(${productStock.quantity}), 0)`,
      sizeCount: count(),
    })
    .from(productStock)
    .groupBy(productStock.productId);
  const threshold = thresholdRows[0]?.value ?? 5;
  const stockByProduct = new Map(
    stockRows.map((row) => [
      row.productId,
      { total: Number(row.stockTotal), sizes: Number(row.sizeCount) },
    ]),
  );

  return productRows
    .filter((row) => row.status !== "archived")
    .map((row) => {
      const stock = stockByProduct.get(row.id) ?? { total: 0, sizes: 0 };
      let stockStatus: StockStatus;

      if (stock.total === 0) stockStatus = "out";
      else if (stock.total <= threshold * stock.sizes) stockStatus = "low";
      else stockStatus = "ok";

      return {
        id: row.id,
        name: row.name,
        categoryName: row.categoryName,
        stockTotal: stock.total,
        sizeCount: stock.sizes,
        stockStatus,
      };
    });
}

export async function getAdminBadgeCounts(): Promise<AdminBadgeCounts> {
  const pendingRows = await db
    .select({ value: count() })
    .from(orders)
    .where(eq(orders.status, "pending"));
  const stats = await getStockStats();

  return {
    pendingOrders: Number(pendingRows[0]?.value ?? 0),
    lowStock: stats.filter((item) => item.stockStatus !== "ok").length,
  };
}

export async function getAdminSearchItems(): Promise<AdminSearchItem[]> {
  const productRows = await db
    .select({ id: products.id, name: products.name })
    .from(products)
    .orderBy(asc(products.name));
  const recentOrderRows = await db
    .select({
      id: orders.id,
      number: orders.number,
      customerName: orders.customerName,
    })
    .from(orders)
    .orderBy(desc(orders.createdAt), desc(orders.number))
    .limit(8);

  const navigation: AdminSearchItem[] = ADMIN_NAV.flatMap((group) =>
    group.items.map((item) => ({
      id: `nav:${item.href}`,
      label: item.label,
      href: item.href,
      group: "Ir a",
      icon: item.icon,
    })),
  );

  return [
    ...navigation,
    ...productRows.map<AdminSearchItem>((row) => ({
      id: `product:${row.id}`,
      label: row.name,
      href: `/admin/products/${row.id}`,
      group: "Productos",
      icon: "lucide:package",
    })),
    ...recentOrderRows.map<AdminSearchItem>((row) => ({
      id: `order:${row.id}`,
      label: `Pedido #${row.number} · ${row.customerName}`,
      href: `/admin/orders/${row.id}`,
      group: "Pedidos",
      icon: "lucide:shopping-cart",
    })),
  ];
}

export async function getDashboardOverview(
  range: DashboardRange,
): Promise<DashboardOverview> {
  const todayStart = dayStart(limaDayKey(new Date()));
  const currentStartMs = todayStart - (range - 1) * DAY_MS;
  const previousStartMs = todayStart - (range * 2 - 1) * DAY_MS;
  const currentAggregate = await getSalesByDay(
    new Date(currentStartMs),
    new Date(todayStart + DAY_MS),
  );
  const previousAggregate = await getSalesByDay(
    new Date(previousStartMs),
    new Date(currentStartMs),
  );

  const series: SalesPoint[] = [];

  for (let day = currentStartMs; day <= todayStart; day += DAY_MS) {
    const key = new Date(day).toISOString().slice(0, 10);
    const aggregate = currentAggregate.get(key);

    series.push({
      day: key,
      label: formatDayMonth(new Date(day)),
      totalCents: aggregate?.totalCents ?? 0,
    });
  }

  const salesCents = series.reduce((total, point) => total + point.totalCents, 0);
  const previousSalesCents = [...previousAggregate.values()].reduce(
    (total, item) => total + item.totalCents,
    0,
  );
  const currentOrderCount = series.reduce(
    (total, point) =>
      total + (currentAggregate.get(point.day)?.orderCount ?? 0),
    0,
  );

  const pendingRows = await db
    .select({ value: count() })
    .from(orders)
    .where(eq(orders.status, "pending"));
  const stats = await getStockStats();
  const recentOrderRows = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt), desc(orders.number))
    .limit(5);
  const topRows = await db
    .select({
      id: products.id,
      name: products.name,
      soldCount: products.soldCount,
    })
    .from(products)
    .where(ne(products.status, "archived"))
    .orderBy(desc(products.soldCount), asc(products.name))
    .limit(5);

  const recentIds = recentOrderRows.map((row) => row.id);
  const recentItemCountRows =
    recentIds.length > 0
      ? await db
          .select({
            orderId: orderItems.orderId,
            quantity: sql<string>`coalesce(sum(${orderItems.quantity}), 0)`,
          })
          .from(orderItems)
          .where(inArray(orderItems.orderId, recentIds))
          .groupBy(orderItems.orderId)
      : [];
  const itemCountByOrder = new Map(
    recentItemCountRows.map((row) => [row.orderId, Number(row.quantity)]),
  );
  const recentOrders: OrderFixture[] = recentOrderRows.map((row) => ({
    id: row.id,
    number: row.number,
    customerName: row.customerName,
    status: row.status,
    totalCents: row.totalCents,
    itemCount: itemCountByOrder.get(row.id) ?? 0,
    createdAt: row.createdAt.toISOString(),
  }));
  const lowStock: LowStockItem[] = stats
    .filter((item) => item.stockStatus !== "ok")
    .sort((a, b) => a.stockTotal - b.stockTotal)
    .slice(0, 4);

  return {
    range,
    periodLabel: `${formatDayMonth(new Date(currentStartMs))} – ${formatDayMonth(new Date(todayStart))}`,
    kpis: {
      salesCents,
      orders: currentOrderCount,
      averageTicketCents:
        currentOrderCount > 0 ? Math.round(salesCents / currentOrderCount) : 0,
      pendingOrders: Number(pendingRows[0]?.value ?? 0),
      salesDeltaPercent:
        previousSalesCents > 0
          ? Math.round((salesCents / previousSalesCents - 1) * 100)
          : null,
    },
    series,
    lowStock,
    recentOrders,
    topProducts: topRows.map<TopProduct>((row) => ({
      id: row.id,
      name: row.name,
      soldCount: row.soldCount,
    })),
  };
}
