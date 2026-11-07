import type { Metadata } from "next";
import { StoreBreadcrumbs } from "@/components/store/breadcrumbs";
import { StoreEmptyState } from "@/components/store/empty-state";
import { StorePagination } from "@/components/store/pagination";
import { ProductGrid } from "@/components/store/product-grid";
import { CatalogFilters } from "@/features/catalog/components/catalog-filters";
import {
  getStoreActiveCategoryNames,
  listStoreProducts,
  parseStoreFilters,
} from "@/features/catalog/store-queries";
import { AGE_GROUPS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Polos, camisas, pantalones, casacas, calzado, gorras y accesorios para niños, jóvenes y adultos.",
};

type CatalogPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const filters = parseStoreFilters(params);
  const categories = await getStoreActiveCategoryNames();
  const result = await listStoreProducts(filters);

  const categoryName = filters.category
    ? categories.find((category) => category.id === filters.category)?.name
    : undefined;
  const title =
    categoryName ??
    (filters.query
      ? `Resultados para “${filters.query}”`
      : filters.sale
        ? "Ofertas"
        : filters.age
          ? `Para ${AGE_GROUPS[filters.age]}`
          : "Catálogo");

  const paginationParams = {
    category: filters.category || undefined,
    age: filters.age || undefined,
    size: filters.size || undefined,
    max: filters.maxCents ? String(Math.round(filters.maxCents / 100)) : undefined,
    sale: filters.sale ? "1" : undefined,
    q: filters.query || undefined,
    sort: filters.sort !== "featured" ? filters.sort : undefined,
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-12">
      <StoreBreadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: categoryName ?? "Catálogo" },
        ]}
      />

      <header className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-premium font-space-mono mb-3 text-xs font-bold tracking-[0.2em] uppercase">
            Tienda
          </p>
          <h1 className="font-heading text-5xl leading-none font-light tracking-[0.05em] uppercase md:text-6xl">
            {title}
          </h1>
        </div>
        <p className="text-grey-dark text-sm">
          {result.total} {result.total === 1 ? "producto" : "productos"}
          {filters.size ? ` en talla ${filters.size}` : ""}
        </p>
      </header>

      <div className="flex flex-col gap-10 lg:flex-row">
        <CatalogFilters
          filters={filters}
          categories={categories}
          sizeOptions={result.sizeOptions}
          total={result.total}
        />

        <div className="min-w-0 flex-1">
          {result.products.length > 0 ? (
            <>
              <ProductGrid products={result.products} />
              <StorePagination
                page={result.page}
                pageCount={result.pageCount}
                basePath="/catalog"
                params={paginationParams}
              />
            </>
          ) : (
            <StoreEmptyState
              title="No encontramos productos"
              description="Prueba con otra talla, categoría o rango de precio. También puedes revisar todo el catálogo."
              ctaLabel="Ver todo"
              ctaHref="/catalog"
            />
          )}
        </div>
      </div>
    </div>
  );
}
