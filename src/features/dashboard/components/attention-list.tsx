import Link from "next/link";
import { Icon } from "@/components/icons/icon";
import { ProductThumb } from "@/components/shared/product-thumb";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import type { LowStockItem } from "../types";
import { STOCK_STATUS_LABELS, STOCK_STATUS_TONES } from "./status";

type AttentionListProps = {
  lowStock: LowStockItem[];
  pendingOrders: number;
};

export function AttentionList({ lowStock, pendingOrders }: AttentionListProps) {
  return (
    <SectionCard title="Necesita atención" className="h-fit">
      <div className="divide-border divide-y">
        <Link
          href="/admin/orders"
          className="hover:bg-muted/40 flex items-center justify-between gap-3 px-5 py-3 text-sm transition-colors"
        >
          <span>Pedidos pendientes</span>
          <span className="font-mono text-xs">{pendingOrders}</span>
        </Link>
        {lowStock.map((product) => (
          <Link
            key={product.id}
            href={`/admin/products/${product.id}`}
            className="hover:bg-muted/40 flex items-center gap-3 px-5 py-3 text-sm transition-colors"
          >
            <ProductThumb name={product.name} className="size-7" />
            <span className="min-w-0 flex-1 truncate">{product.name}</span>
            <StatusBadge tone={STOCK_STATUS_TONES[product.stockStatus]}>
              {STOCK_STATUS_LABELS[product.stockStatus]}
            </StatusBadge>
          </Link>
        ))}
        {lowStock.length === 0 ? (
          <p className="text-muted-foreground flex items-center gap-2 px-5 py-4 text-sm">
            <Icon
              icon="lucide:circle-check"
              width={15}
              height={15}
              aria-hidden="true"
            />
            Todo el stock está en orden.
          </p>
        ) : null}
      </div>
    </SectionCard>
  );
}
