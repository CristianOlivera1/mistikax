import Form from "next/form";
import Link from "next/link";
import { FilterBar } from "@/components/admin/filter-bar";
import { Icon } from "@/components/icons/icon";
import { Input } from "@/components/ui/input";
import type { CustomerFilters as CustomerFiltersValue } from "../types";

type CustomerFiltersProps = {
  filters: CustomerFiltersValue;
};

export function CustomerFilters({ filters }: CustomerFiltersProps) {
  return (
    <FilterBar>
      <Form
        action="/admin/customers"
        scroll={false}
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
            placeholder="Buscar por nombre, correo o teléfono..."
            aria-label="Buscar cliente"
            className="h-8 w-72 pl-8"
          />
        </div>
      </Form>
      {filters.query ? (
        <Link
          href="/admin/customers"
          className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
        >
          Limpiar
        </Link>
      ) : null}
    </FilterBar>
  );
}
