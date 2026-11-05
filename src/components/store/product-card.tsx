import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/format";
import type { StoreProduct } from "@/features/catalog/store-queries";
import { AGE_GROUPS } from "@/lib/constants";

export function ProductCard({ product }: { product: StoreProduct }) {
  const hasOffer =
    product.compareAtCents !== null &&
    product.compareAtCents > product.priceCents;
  const discountPercent = hasOffer
    ? Math.round(
        100 - (product.priceCents / (product.compareAtCents ?? 1)) * 100,
      )
    : 0;

  return (
    <Link href={`/producto/${product.id}`} className="group block">
      <div className="border-grey-light bg-surface relative aspect-[4/5] overflow-hidden border">
        <Image
          src={product.images[0] ?? ""}
          alt={product.name}
          fill
          unoptimized
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {hasOffer ? (
          <span className="bg-error text-background font-space-mono absolute top-4 left-0 px-3 py-1 text-[10px] font-bold tracking-widest">
            -{discountPercent}%
          </span>
        ) : product.isNew ? (
          <span className="bg-foreground text-background font-space-mono absolute top-4 left-0 px-3 py-1 text-[10px] font-bold tracking-widest uppercase">
            Nuevo
          </span>
        ) : null}
      </div>
      <div className="pt-4">
        <p className="text-grey-dark font-space-mono text-[10px] tracking-widest uppercase">
          {product.categoryName} / {AGE_GROUPS[product.ageGroup]}
        </p>
        <h3 className="font-heading group-hover:text-premium-hover mt-1 text-xl tracking-wide uppercase transition-colors">
          {product.name}
        </h3>
        <p className="mt-1 text-sm">
          <b className="font-semibold">{formatMoney(product.priceCents)}</b>
          {hasOffer ? (
            <s className="text-grey-mid ml-1 font-normal">
              {formatMoney(product.compareAtCents ?? 0)}
            </s>
          ) : null}
        </p>
        <div className="mt-3 flex gap-1.5">
          {product.colors.map((color) => (
            <i
              key={color.id}
              title={color.name}
              className="border-grey-light size-3.5 rounded-full border"
              style={{ background: color.hex }}
            />
          ))}
        </div>
      </div>
    </Link>
  );
}
