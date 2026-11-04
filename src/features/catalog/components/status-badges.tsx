import { StatusBadge, type StatusTone } from "@/components/shared/status-badge";
import { PRODUCT_STATUSES, type ProductStatus } from "@/lib/constants";
import type { StockStatus } from "../types";

const PRODUCT_TONES: Record<ProductStatus, StatusTone> = {
  active: "success",
  draft: "neutral",
  archived: "warning",
};

const STOCK_LABELS: Record<StockStatus, string> = {
  ok: "En stock",
  low: "Stock bajo",
  out: "Agotado",
};

const STOCK_TONES: Record<StockStatus, StatusTone> = {
  ok: "success",
  low: "warning",
  out: "danger",
};

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  return (
    <StatusBadge tone={PRODUCT_TONES[status]}>
      {PRODUCT_STATUSES[status]}
    </StatusBadge>
  );
}

export function StockStatusBadge({ status }: { status: StockStatus }) {
  return (
    <StatusBadge tone={STOCK_TONES[status]}>{STOCK_LABELS[status]}</StatusBadge>
  );
}
