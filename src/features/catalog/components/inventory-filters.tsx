import Link from "next/link";
import { FilterBar } from "@/components/admin/filter-bar";
import { Icon } from "@/components/icons/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import type { InventoryFilters } from "../types";

type InventoryFiltersProps = {
  filters: InventoryFilters;
};

export function InventoryFilters({ filters }: InventoryFiltersProps) {
  const hasFilters = Boolean(filters.query || filters.status !== "all");

  return (
    <FilterBar>
      <form
        action="/admin/inventory"
        method="get"
        className="flex flex-1 flex-wrap items-center gap-2"
      >
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
            placeholder="Buscar producto..."
            aria-label="Buscar producto en inventario"
            className="h-8 w-56 pl-8"
          />
        </div>

        <NativeSelect
          name="status"
          defaultValue={filters.status}
          aria-label="Filtrar por estado del stock"
          className="w-auto"
        >
          <option value="all">Todo el stock</option>
          <option value="low">Stock bajo</option>
          <option value="out">Agotados</option>
        </NativeSelect>

        <Button type="submit" variant="secondary" size="sm">
          Filtrar
        </Button>

        {hasFilters ? (
          <Link
            href="/admin/inventory"
            className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
          >
            Limpiar
          </Link>
        ) : null}
      </form>
    </FilterBar>
  );
}
