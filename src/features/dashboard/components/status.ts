import type { OrderStatus } from "@/lib/constants";
import type { StatusTone } from "@/components/shared/status-badge";
import type { StockStatus } from "../types";

export const ORDER_STATUS_TONES: Record<OrderStatus, StatusTone> = {
  pending: "warning",
  paid: "info",
  shipped: "violet",
  delivered: "success",
  cancelled: "danger",
};

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  ok: "En stock",
  low: "Stock bajo",
  out: "Agotado",
};

export const STOCK_STATUS_TONES: Record<StockStatus, StatusTone> = {
  ok: "success",
  low: "warning",
  out: "danger",
};
