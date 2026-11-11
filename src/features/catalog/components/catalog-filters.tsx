import Form from "next/form";
import Link from "next/link";
import { AGE_GROUPS } from "@/lib/constants";
import {
  STORE_SORTS,
  type StoreFilters,
  type StoreSort,
} from "@/features/catalog/store-queries";
import { cn } from "@/lib/utils";

type CatalogFiltersProps = {
  filters: StoreFilters;
  categories: Array<{ id: string; name: string }>;
  sizeOptions: string[];
  total: number;
};

function catalogHref(filters: StoreFilters, patch: Partial<StoreFilters>): string {
  const next = { ...filters, ...patch, page: 1 };
  const params = new URLSearchParams();

  if (next.category) params.set("category", next.category);
  if (next.age) params.set("age", next.age);
  if (next.size) params.set("size", next.size);
  if (next.maxCents !== null) {
    params.set("max", String(Math.round(next.maxCents / 100)));
  }
  if (next.sale) params.set("sale", "1");
  if (next.query) params.set("q", next.query);
  if (next.sort !== "featured") params.set("sort", next.sort);

  const query = params.toString();
  return query ? `/catalog?${query}` : "/catalog";
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-grey-light border-b py-5">
      <h3 className="mb-3 text-xs font-bold tracking-widest uppercase">{label}</h3>
      {children}
    </div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "block text-sm transition-colors",
        active ? "text-dark font-semibold" : "text-grey-dark hover:text-dark",
      )}
    >
      {children}
    </Link>
  );
}

export function CatalogFilters({
  filters,
  categories,
  sizeOptions,
  total,
}: CatalogFiltersProps) {
  const activeCount = [
    filters.category,
    filters.age,
    filters.size,
    filters.maxCents !== null ? "max" : "",
    filters.sale ? "sale" : "",
    filters.query,
  ].filter(Boolean).length;

  const content = (
    <>
      <div className="flex items-center justify-between border-b pb-4">
        <p className="text-xs tracking-widest uppercase">Filtros</p>
        {activeCount > 0 ? (
          <Link href="/catalog" className="text-grey-dark text-xs underline underline-offset-4">
            Limpiar ({activeCount})
          </Link>
        ) : null}
      </div>

      <FilterGroup label="Categoría">
        <div className="space-y-2">
          <FilterLink href={catalogHref(filters, { category: "" })} active={!filters.category}>
            Todas
          </FilterLink>
          {categories.map((category) => (
            <FilterLink
              key={category.id}
              href={catalogHref(filters, { category: category.id })}
              active={filters.category === category.id}
            >
              {category.name}
            </FilterLink>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Edad">
        <div className="space-y-2">
          <FilterLink href={catalogHref(filters, { age: "" })} active={!filters.age}>
            Todas las edades
          </FilterLink>
          {(Object.keys(AGE_GROUPS) as Array<keyof typeof AGE_GROUPS>).map((age) => (
            <FilterLink
              key={age}
              href={catalogHref(filters, { age })}
              active={filters.age === age}
            >
              {AGE_GROUPS[age]}
            </FilterLink>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Talla">
        <div className="flex flex-wrap gap-2">
          {sizeOptions.map((size) => {
            const active = filters.size === size;

            return (
              <Link
                key={size}
                href={catalogHref(filters, { size: active ? "" : size })}
                aria-pressed={active}
                className={cn(
                  "min-w-10 border px-2 py-1.5 text-center text-xs transition-colors",
                  active
                    ? "border-dark bg-dark text-white"
                    : "border-grey-light hover:border-grey-mid",
                )}
              >
                {size}
              </Link>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup label="Precio">
        <Form action="/catalog" scroll={false} className="space-y-3">
          {filters.category ? (
            <input type="hidden" name="category" value={filters.category} />
          ) : null}
          {filters.age ? <input type="hidden" name="age" value={filters.age} /> : null}
          {filters.size ? <input type="hidden" name="size" value={filters.size} /> : null}
          {filters.sale ? <input type="hidden" name="sale" value="1" /> : null}
          {filters.query ? <input type="hidden" name="q" value={filters.query} /> : null}
          {filters.sort !== "featured" ? (
            <input type="hidden" name="sort" value={filters.sort} />
          ) : null}
          <label htmlFor="max-price" className="text-grey-dark block text-xs">
            Precio máximo en soles
          </label>
          <div className="flex gap-2">
            <input
              id="max-price"
              name="max"
              type="number"
              min={1}
              step={1}
              defaultValue={filters.maxCents ? filters.maxCents / 100 : undefined}
              className="border-grey-light focus:border-dark w-full border bg-white px-2 py-2 text-sm outline-none"
            />
            <button
              type="submit"
              className="bg-dark text-background hover:bg-premium hover:text-dark px-3 text-[10px] font-bold tracking-widest uppercase transition-colors"
            >
              Aplicar
            </button>
          </div>
        </Form>
      </FilterGroup>

      <FilterGroup label="Ofertas">
        <FilterLink
          href={catalogHref(filters, { sale: !filters.sale })}
          active={filters.sale}
        >
          {filters.sale ? "Solo ofertas activado" : "Ver solo ofertas"}
        </FilterLink>
      </FilterGroup>

      <FilterGroup label="Ordenar por">
        <div className="space-y-2">
          {STORE_SORTS.map((sort) => (
            <FilterLink
              key={sort.value}
              href={catalogHref(filters, { sort: sort.value as StoreSort })}
              active={filters.sort === sort.value}
            >
              {sort.label}
            </FilterLink>
          ))}
        </div>
      </FilterGroup>
    </>
  );

  return (
    <>
      <aside className="hidden w-60 shrink-0 lg:block" aria-label="Filtros del catálogo">
        {content}
        <p className="text-grey-mid pt-4 text-[11px]">{total} productos</p>
      </aside>

      <details className="border-grey-light mb-6 border lg:hidden">
        <summary className="cursor-pointer list-none p-4 text-xs font-bold tracking-widest uppercase">
          Filtrar y ordenar {activeCount > 0 ? `(${activeCount})` : ""}
        </summary>
        <div className="px-4 pb-4">{content}</div>
      </details>
    </>
  );
}
