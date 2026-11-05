import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { ProductThumb } from "@/components/shared/product-thumb";
import { AGE_GROUPS } from "@/lib/constants";
import { formatMoney } from "@/lib/format";
import { getStockStatus, getStockTotal } from "../queries";
import type { CatalogCategory, CatalogProduct } from "../types";
import { ProductRowActions } from "./product-row-actions";
import { ProductStatusBadge, StockStatusBadge } from "./status-badges";

type ProductsTableProps = {
  products: CatalogProduct[];
  categories: CatalogCategory[];
};

export function ProductsTable({ products, categories }: ProductsTableProps) {
  const categoryName = new Map(categories.map((category) => [category.id, category.name]));
  const columns: DataTableColumn<CatalogProduct>[] = [
    {
      id: "product",
      header: "Producto",
      cell: (product) => (
        <div className="flex items-center gap-3">
          <ProductThumb
            name={product.name}
            src={product.images[0]}
            className="size-10"
          />
          <div className="min-w-0">
            <Link
              href={`/admin/products/${product.id}`}
              className="block truncate font-medium hover:underline"
            >
              {product.name}
            </Link>
            <p className="text-muted-foreground font-mono text-[11px]">
              {product.id}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "status",
      header: "Estado",
      cell: (product) => <ProductStatusBadge status={product.status} />,
    },
    {
      id: "stock",
      header: "Inventario",
      cell: (product) => (
        <div className="flex items-center gap-2">
          <StockStatusBadge status={getStockStatus(product)} />
          <span className="text-muted-foreground font-mono text-xs">
            {getStockTotal(product)}
          </span>
        </div>
      ),
    },
    {
      id: "category",
      header: "Categoría",
      cell: (product) => categoryName.get(product.categoryId) ?? "—",
    },
    {
      id: "age",
      header: "Edad",
      cell: (product) => AGE_GROUPS[product.ageGroup],
    },
    {
      id: "price",
      header: "Precio",
      cell: (product) => (
        <div className="flex items-baseline gap-2">
          <span>{formatMoney(product.priceCents)}</span>
          {product.compareAtCents ? (
            <s className="text-muted-foreground text-xs">
              {formatMoney(product.compareAtCents)}
            </s>
          ) : null}
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      className: "text-right",
      cell: (product) => (
        <div className="flex justify-end">
          <ProductRowActions product={product} />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={products}
      getRowKey={(product) => product.id}
    />
  );
}
