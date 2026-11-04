import Link from "next/link";
import { FilterBar } from "@/components/admin/filter-bar";
import { Icon } from "@/components/icons/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
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

        <NativeSelect
          name="category"
          defaultValue={filters.categoryId}
          aria-label="Filtrar por categoría"
          className="w-auto"
        >
          <option value="">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </NativeSelect>

        <NativeSelect
          name="age"
          defaultValue={filters.ageGroup}
          aria-label="Filtrar por edad"
          className="w-auto"
        >
          <option value="">Todas las edades</option>
          {Object.entries(AGE_GROUPS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </NativeSelect>

        <NativeSelect
          name="status"
          defaultValue={filters.status}
          aria-label="Filtrar por estado"
          className="w-auto"
        >
          <option value="">Todos los estados</option>
          {Object.entries(PRODUCT_STATUSES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </NativeSelect>

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
