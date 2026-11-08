import Link from "next/link";
import { FilterBar } from "@/components/admin/filter-bar";
import { Icon } from "@/components/icons/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

        <Select name="status" defaultValue={filters.status}>
          <SelectTrigger
            aria-label="Filtrar por estado del stock"
            className="w-auto"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start" position="popper">
            <SelectItem value="all">Todo el stock</SelectItem>
            <SelectItem value="low">Stock bajo</SelectItem>
            <SelectItem value="out">Agotados</SelectItem>
          </SelectContent>
        </Select>

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
