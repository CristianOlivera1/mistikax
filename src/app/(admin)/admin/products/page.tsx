import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons/icon";
import { Pagination } from "@/components/admin/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ProductFilters } from "@/features/catalog/components/product-filters";
import { ProductsTable } from "@/features/catalog/components/products-table";
import {
  getCategoriesWithCounts,
  getProductPage,
  parseProductFilters,
} from "@/features/catalog/queries";

export const metadata: Metadata = {
  title: "Productos",
};

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const filters = parseProductFilters(await searchParams);
  const [page, categories] = await Promise.all([
    getProductPage(filters),
    getCategoriesWithCounts(),
  ]);

  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.categoryId) params.set("category", filters.categoryId);
  if (filters.ageGroup) params.set("age", filters.ageGroup);
  if (filters.status) params.set("status", filters.status);

  function hrefForPage(nextPage: number) {
    const nextParams = new URLSearchParams(params);
    if (nextPage > 1) nextParams.set("page", String(nextPage));
    const queryString = nextParams.toString();
    return `/admin/products${queryString ? `?${queryString}` : ""}`;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Productos"
        description={`${page.total} ${
          page.total === 1 ? "producto" : "productos"
        } en el catálogo`}
        actions={
          <Button asChild>
            <Link href="/admin/products/new">
              <Icon
                icon="lucide:plus"
                width={15}
                height={15}
                aria-hidden="true"
              />
              Nuevo producto
            </Link>
          </Button>
        }
      />

      <div className="border-border bg-card overflow-hidden rounded-lg border">
        <ProductFilters filters={filters} categories={categories} />
        {page.items.length > 0 ? (
          <ProductsTable products={page.items} categories={categories} />
        ) : (
          <EmptyState
            icon="lucide:package"
            title="Sin resultados"
            description="Prueba con otros filtros o crea un producto nuevo."
            action={
              <Button asChild>
                <Link href="/admin/products/new">Nuevo producto</Link>
              </Button>
            }
          />
        )}
        <Pagination
          page={page.page}
          pageCount={page.pageCount}
          from={page.from}
          to={page.to}
          total={page.total}
          hrefForPage={hrefForPage}
        />
      </div>
    </div>
  );
}
