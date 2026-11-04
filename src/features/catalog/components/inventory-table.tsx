import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { ProductThumb } from "@/components/shared/product-thumb";
import { AGE_GROUPS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { LOW_STOCK_THRESHOLD } from "../constants";
import type { InventoryRow } from "../types";
import { StockStatusBadge } from "./status-badges";

type InventoryTableProps = {
  rows: InventoryRow[];
};

export function InventoryTable({ rows }: InventoryTableProps) {
  const columns: DataTableColumn<InventoryRow>[] = [
    {
      id: "product",
      header: "Producto",
      cell: (row) => (
        <Link
          href={`/admin/products/${row.product.id}`}
          className="flex items-center gap-3"
        >
          <ProductThumb
            name={row.product.name}
            src={row.product.images[0]}
            className="size-9"
          />
          <span className="min-w-0">
            <span className="block truncate font-medium hover:underline">
              {row.product.name}
            </span>
            <span className="text-muted-foreground text-xs">
              {AGE_GROUPS[row.product.ageGroup]} · {row.category.name}
            </span>
          </span>
        </Link>
      ),
    },
    {
      id: "sizes",
      header: "Stock por talla",
      cell: (row) => (
        <div className="flex max-w-md flex-wrap gap-1.5">
          {row.sizes.map(({ size, quantity }) => (
            <div
              key={size}
              className={cn(
                "min-w-11 rounded-md border px-1.5 py-1 text-center",
                quantity === 0
                  ? "border-destructive/30 bg-destructive/5"
                  : quantity <= LOW_STOCK_THRESHOLD
                    ? "border-chart-4/40 bg-chart-4/10"
                    : "border-border bg-muted/30",
              )}
            >
              <span className="text-muted-foreground block font-mono text-[10px]">
                {size}
              </span>
              <span className="block text-xs font-medium tabular-nums">
                {quantity}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "total",
      header: "Total",
      cell: (row) => <span className="font-mono text-xs">{row.total}</span>,
    },
    {
      id: "status",
      header: "Estado",
      cell: (row) => <StockStatusBadge status={row.status} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowKey={(row) => row.product.id}
    />
  );
}
