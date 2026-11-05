import type { Metadata } from "next";
import { Pagination } from "@/components/admin/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { OrderFilters } from "@/features/orders/components/order-filters";
import { OrdersTable } from "@/features/orders/components/orders-table";
import { getOrderPage, parseOrderFilters } from "@/features/orders/queries";

export const metadata: Metadata = {
  title: "Pedidos",
};

type OrdersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const filters = parseOrderFilters(await searchParams);
  const ordersPage = getOrderPage(filters);
  const params = new URLSearchParams();

  if (filters.status !== "all") params.set("status", filters.status);
  if (filters.query) params.set("q", filters.query);

  function hrefForPage(page: number) {
    const nextParams = new URLSearchParams(params);
    if (page > 1) nextParams.set("page", String(page));
    const query = nextParams.toString();
    return `/admin/orders${query ? `?${query}` : ""}`;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Pedidos"
        description="Gestiona y actualiza el estado de cada pedido."
      />

      <div className="border-border bg-card overflow-hidden rounded-lg border">
        <OrderFilters filters={filters} />
        {ordersPage.items.length > 0 ? (
          <OrdersTable orders={ordersPage.items} />
        ) : (
          <EmptyState
            icon="lucide:shopping-cart"
            title="Sin pedidos"
            description="No hay pedidos con este filtro."
          />
        )}
        <Pagination
          page={ordersPage.page}
          pageCount={ordersPage.pageCount}
          from={ordersPage.from}
          to={ordersPage.to}
          total={ordersPage.total}
          hrefForPage={hrefForPage}
        />
      </div>
    </div>
  );
}
