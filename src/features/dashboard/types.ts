import type { AgeGroup, OrderStatus, ProductStatus } from "@/lib/constants";

export type DashboardRange = 7 | 14 | 30;

export type StockStatus = "ok" | "low" | "out";

export type ProductFixture = {
  id: string;
  name: string;
  categoryName: string;
  ageGroup: AgeGroup;
  status: ProductStatus;
  priceCents: number;
  compareAtCents: number | null;
  soldCount: number;
  stockTotal: number;
  sizeCount: number;
};

export type OrderFixture = {
  id: string;
  number: number;
  customerName: string;
  status: OrderStatus;
  totalCents: number;
  itemCount: number;
  createdAt: string;
};

export type SalesPoint = {
  day: string;
  label: string;
  totalCents: number;
};

export type DashboardKpis = {
  salesCents: number;
  orders: number;
  averageTicketCents: number;
  pendingOrders: number;
  salesDeltaPercent: number | null;
};

export type LowStockItem = {
  id: string;
  name: string;
  categoryName: string;
  stockTotal: number;
  sizeCount: number;
  stockStatus: StockStatus;
};

export type TopProduct = {
  id: string;
  name: string;
  soldCount: number;
};

export type DashboardOverview = {
  range: DashboardRange;
  periodLabel: string;
  kpis: DashboardKpis;
  series: SalesPoint[];
  lowStock: LowStockItem[];
  recentOrders: OrderFixture[];
  topProducts: TopProduct[];
};
