import "server-only";

import { formatDayMonth } from "@/lib/format";
import {
  ADMIN_NAV,
  type AdminBadgeCounts,
  type AdminSearchItem,
} from "@/lib/nav";
import {
  FIXTURE_LOW_STOCK_THRESHOLD,
  FIXTURE_ORDERS,
  FIXTURE_PRODUCTS,
} from "./fixtures";
import type {
  DashboardOverview,
  DashboardRange,
  LowStockItem,
  OrderFixture,
  ProductFixture,
  SalesPoint,
  StockStatus,
} from "./types";

const DAY_MS = 86_400_000;

function limaDayKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function dayStart(dayKey: string): number {
  return Date.parse(`${dayKey}T15:00:00.000Z`);
}

function orderDayStart(order: OrderFixture): number {
  return dayStart(order.createdAt.slice(0, 10));
}

function stockStatusOf(product: ProductFixture): StockStatus {
  if (product.stockTotal === 0) return "out";
  if (product.stockTotal <= FIXTURE_LOW_STOCK_THRESHOLD * product.sizeCount)
    return "low";
  return "ok";
}

function totalSales(orders: OrderFixture[]): number {
  return orders.reduce((total, order) => total + order.totalCents, 0);
}

export function parseDashboardRange(value: string | undefined): DashboardRange {
  if (value === "7") return 7;
  if (value === "14") return 14;
  return 30;
}

export function getAdminBadgeCounts(): AdminBadgeCounts {
  return {
    pendingOrders: FIXTURE_ORDERS.filter((order) => order.status === "pending")
      .length,
    lowStock: FIXTURE_PRODUCTS.filter(
      (product) =>
        product.status !== "archived" && stockStatusOf(product) !== "ok",
    ).length,
  };
}

export function getAdminSearchItems(): AdminSearchItem[] {
  const navigation: AdminSearchItem[] = ADMIN_NAV.flatMap((group) =>
    group.items.map((item) => ({
      id: `nav:${item.href}`,
      label: item.label,
      href: item.href,
      group: "Ir a",
      icon: item.icon,
    })),
  );

  const products: AdminSearchItem[] = FIXTURE_PRODUCTS.map((product) => ({
    id: `product:${product.id}`,
    label: product.name,
    href: `/admin/products/${product.id}`,
    group: "Productos",
    icon: "lucide:package",
  }));

  const orders: AdminSearchItem[] = FIXTURE_ORDERS.slice(0, 8).map((order) => ({
    id: `order:${order.id}`,
    label: `Pedido #${order.number} · ${order.customerName}`,
    href: `/admin/orders/${order.id}`,
    group: "Pedidos",
    icon: "lucide:shopping-cart",
  }));

  return [...navigation, ...products, ...orders];
}

export function getDashboardOverview(range: DashboardRange): DashboardOverview {
  const todayStart = dayStart(limaDayKey(new Date()));
  const salesOrders = FIXTURE_ORDERS.filter(
    (order) => order.status !== "cancelled",
  );

  const currentOrders = salesOrders.filter((order) => {
    const daysAgo = Math.round((todayStart - orderDayStart(order)) / DAY_MS);
    return daysAgo >= 0 && daysAgo < range;
  });

  const previousOrders = salesOrders.filter((order) => {
    const daysAgo = Math.round((todayStart - orderDayStart(order)) / DAY_MS);
    return daysAgo >= range && daysAgo < range * 2;
  });

  const salesCents = totalSales(currentOrders);
  const previousSalesCents = totalSales(previousOrders);
  const rangeStart = todayStart - (range - 1) * DAY_MS;
  const series: SalesPoint[] = [];

  for (let day = rangeStart; day <= todayStart; day += DAY_MS) {
    const date = new Date(day);
    const key = date.toISOString().slice(0, 10);
    series.push({
      day: key,
      label: formatDayMonth(date),
      totalCents: totalSales(
        currentOrders.filter((order) => order.createdAt.slice(0, 10) === key),
      ),
    });
  }

  const lowStock: LowStockItem[] = FIXTURE_PRODUCTS.filter(
    (product) => product.status !== "archived",
  )
    .map((product) => ({
      id: product.id,
      name: product.name,
      categoryName: product.categoryName,
      stockTotal: product.stockTotal,
      sizeCount: product.sizeCount,
      stockStatus: stockStatusOf(product),
    }))
    .filter((product) => product.stockStatus !== "ok")
    .sort((a, b) => a.stockTotal - b.stockTotal)
    .slice(0, 4);

  return {
    range,
    periodLabel: `${formatDayMonth(new Date(rangeStart))} – ${formatDayMonth(new Date(todayStart))}`,
    kpis: {
      salesCents,
      orders: currentOrders.length,
      averageTicketCents:
        currentOrders.length > 0
          ? Math.round(salesCents / currentOrders.length)
          : 0,
      pendingOrders: FIXTURE_ORDERS.filter(
        (order) => order.status === "pending",
      ).length,
      salesDeltaPercent:
        previousSalesCents > 0
          ? Math.round((salesCents / previousSalesCents - 1) * 100)
          : null,
    },
    series,
    lowStock,
    recentOrders: FIXTURE_ORDERS.slice(0, 5),
    topProducts: FIXTURE_PRODUCTS.filter(
      (product) => product.status !== "archived",
    )
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, 5)
      .map((product) => ({
        id: product.id,
        name: product.name,
        soldCount: product.soldCount,
      })),
  };
}
