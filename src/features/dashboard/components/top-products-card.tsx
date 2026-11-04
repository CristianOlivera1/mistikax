import Link from "next/link";
import { ProductThumb } from "@/components/shared/product-thumb";
import { SectionCard } from "@/components/shared/section-card";
import type { TopProduct } from "../types";

type TopProductsCardProps = {
  products: TopProduct[];
  className?: string;
};

export function TopProductsCard({ products, className }: TopProductsCardProps) {
  return (
    <SectionCard title="Más vendidos" className={className}>
      <div className="divide-border divide-y">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/admin/products/${product.id}`}
            className="hover:bg-muted/40 flex items-center gap-3 px-5 py-3 text-sm transition-colors"
          >
            <ProductThumb name={product.name} className="size-7" />
            <span className="min-w-0 flex-1 truncate">{product.name}</span>
            <span className="text-muted-foreground font-mono text-xs">
              {product.soldCount}
            </span>
          </Link>
        ))}
        {products.length === 0 ? (
          <p className="text-muted-foreground px-5 py-4 text-sm">
            Aún no hay ventas registradas.
          </p>
        ) : null}
      </div>
    </SectionCard>
  );
}
