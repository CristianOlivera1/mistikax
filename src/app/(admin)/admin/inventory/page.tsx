import type { Metadata } from "next";
import { Icon } from "@/components/icons/icon";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InventoryFilters } from "@/features/catalog/components/inventory-filters";
import { InventoryTable } from "@/features/catalog/components/inventory-table";
import {
  getInventoryRows,
  getInventorySummary,
  parseInventoryFilters,
} from "@/features/catalog/queries";
import { LOW_STOCK_THRESHOLD } from "@/features/catalog/constants";

export const metadata: Metadata = {
  title: "Inventario",
};

type InventoryPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function InventoryPage({
  searchParams,
}: InventoryPageProps) {
  const filters = parseInventoryFilters(await searchParams);
  const rows = getInventoryRows(filters);
  const summary = getInventorySummary();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Inventario"
        description={`Alerta de stock bajo cuando el promedio por talla es de ${LOW_STOCK_THRESHOLD} unidades o menos.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Productos"
          value={summary.products}
          hint="Sin archivar"
        />
        <StatCard
          label="Stock bajo"
          value={summary.lowStock}
          hint={`${LOW_STOCK_THRESHOLD} unidades o menos por talla`}
        />
        <StatCard
          label="Agotados"
          value={summary.outOfStock}
          hint="Sin unidades disponibles"
        />
        <StatCard
          label="Unidades"
          value={summary.units}
          hint="Stock total del catálogo"
        />
      </div>

      <Alert className="bg-muted/40">
        <Icon icon="lucide:info" width={15} height={15} aria-hidden="true" />
        <AlertDescription>
          La edición de stock por talla se habilitará en la Fase 4. Por ahora
          esta vista es de solo lectura.
        </AlertDescription>
      </Alert>

      <div className="border-border bg-card overflow-hidden rounded-lg border">
        <InventoryFilters filters={filters} />
        {rows.length > 0 ? (
          <InventoryTable rows={rows} />
        ) : (
          <EmptyState
            icon="lucide:archive"
            title="Sin resultados"
            description="No hay productos que coincidan con la búsqueda o el estado elegido."
          />
        )}
      </div>
    </div>
  );
}
