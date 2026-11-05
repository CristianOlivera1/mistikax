import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icons/icon";
import type { StoreCategoryCard } from "@/features/catalog/store-queries";

type CategoriesGridProps = {
  categories: StoreCategoryCard[];
};

export function CategoriesGrid({ categories }: CategoriesGridProps) {
  return (
    <div className="border-grey-light grid grid-cols-2 border-t border-l md:grid-cols-4">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/catalogo?category=${category.id}`}
          className="group border-grey-light relative aspect-square overflow-hidden border-r border-b"
        >
          {category.showcaseImage ? (
            <Image
              src={category.showcaseImage}
              alt={category.name}
              fill
              unoptimized
              sizes="(min-width: 768px) 25vw, 50vw"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-0 w-full p-5 text-white">
            <h3 className="font-heading text-2xl font-medium tracking-wide uppercase">
              {category.name}
            </h3>
            <span className="font-space-mono text-[10px] tracking-widest text-white/70 uppercase">
              {category.productCount} modelos
            </span>
          </div>
        </Link>
      ))}
      <Link
        href="/catalogo"
        className="hover:bg-premium-light border-grey-light flex aspect-square flex-col items-center justify-center gap-3 border-r border-b bg-white transition-colors"
      >
        <span className="font-heading text-2xl tracking-wide uppercase">
          Ver todo
        </span>
        <Icon icon="lucide:arrow-right" width={22} height={22} />
      </Link>
    </div>
  );
}
