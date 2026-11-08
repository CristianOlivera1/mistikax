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
import { AGE_GROUPS, PRODUCT_STATUSES } from "@/lib/constants";
import type { CategoryWithCount, ProductFilters } from "../types";

type ProductFiltersProps = {
  filters: ProductFilters;
  categories: CategoryWithCount[];
};

export function ProductFilters({ filters, categories }: ProductFiltersProps) {
  const hasFilters = Boolean(
    filters.query || filters.categoryId || filters.ageGroup || filters.status,
  );

  return (
    <FilterBar>
      <form
        action="/admin/products"
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
            aria-label="Buscar producto"
            className="h-8 w-56 pl-8"
          />
        </div>

        <Select
          name="category"
          defaultValue={filters.categoryId || "__all__"}
        >
          <SelectTrigger
            aria-label="Filtrar por categoría"
            className="w-auto"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start" position="popper">
            <SelectItem value="__all__">Todas las categorías</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select name="age" defaultValue={filters.ageGroup || "all"}>
          <SelectTrigger aria-label="Filtrar por edad" className="w-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start" position="popper">
            <SelectItem value="all">Todas las edades</SelectItem>
            {Object.entries(AGE_GROUPS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select name="status" defaultValue={filters.status || "all"}>
          <SelectTrigger aria-label="Filtrar por estado" className="w-auto">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start" position="popper">
            <SelectItem value="all">Todos los estados</SelectItem>
            {Object.entries(PRODUCT_STATUSES).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button type="submit" variant="secondary" size="sm">
          Filtrar
        </Button>

        {hasFilters ? (
          <Link
            href="/admin/products"
            className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
          >
            Limpiar
          </Link>
        ) : null}
      </form>
    </FilterBar>
  );
}
