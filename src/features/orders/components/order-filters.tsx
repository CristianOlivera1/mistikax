import Link from "next/link";
import { FilterBar } from "@/components/admin/filter-bar";
import { Icon } from "@/components/icons/icon";
import { Input } from "@/components/ui/input";
import { ORDER_STATUSES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { getOrderStatusCounts } from "@/features/orders/queries";
import type {
  OrderFilters as OrderFiltersValue,
  OrderStatusFilter,
} from "../types";

type OrderFiltersProps = {
  filters: OrderFiltersValue;
};

const TABS: Array<{ value: OrderStatusFilter; label: string }> = [
  { value: "all", label: "Todos" },
  ...Object.entries(ORDER_STATUSES).map(([value, label]) => ({
    value: value as OrderStatusFilter,
    label,
  })),
];

export function OrderFilters({ filters }: OrderFiltersProps) {
  const counts = getOrderStatusCounts();

  function statusHref(status: OrderStatusFilter) {
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    if (filters.query) params.set("q", filters.query);
    const query = params.toString();
    return `/admin/orders${query ? `?${query}` : ""}`;
  }

  return (
    <div className="border-border border-b">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-1">
        <nav
          className="flex gap-4 overflow-x-auto"
          aria-label="Estados de pedido"
        >
          {TABS.map((tab) => {
            const active = filters.status === tab.value;

            return (
              <Link
                key={tab.value}
                href={statusHref(tab.value)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "border-b-2 py-3 text-sm whitespace-nowrap transition-colors",
                  active
                    ? "border-foreground text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground border-transparent",
                )}
              >
                {tab.label}{" "}
                <span className="text-muted-foreground font-mono text-xs">
                  {counts[tab.value]}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
      <FilterBar className="border-b-0">
        <form
          action="/admin/orders"
          method="get"
          className="flex flex-1 flex-wrap items-center gap-2"
        >
          {filters.status !== "all" ? (
            <input type="hidden" name="status" value={filters.status} />
          ) : null}
          <div className="relative">
            <Icon
              icon="lucide:search"
              width={14}
              height={14}
              aria-hidden="true"
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2"
            />
            <Input
              type="search"
              name="q"
              defaultValue={filters.query}
              placeholder="Buscar cliente o #..."
              aria-label="Buscar pedido"
              className="h-8 w-56 pl-8"
            />
          </div>
        </form>
      </FilterBar>
    </div>
  );
}
