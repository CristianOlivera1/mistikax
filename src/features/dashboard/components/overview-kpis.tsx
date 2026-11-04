import Link from "next/link";
import { StatCard } from "@/components/shared/stat-card";
import { formatMoney } from "@/lib/format";
import type { DashboardKpis, DashboardRange } from "../types";

type OverviewKpisProps = {
  kpis: DashboardKpis;
  range: DashboardRange;
};

export function OverviewKpis({ kpis, range }: OverviewKpisProps) {
  const delta = kpis.salesDeltaPercent;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Ventas"
        value={formatMoney(kpis.salesCents)}
        hint={
          delta === null ? (
            `Últimos ${range} días`
          ) : (
            <>
              <span
                className={delta >= 0 ? "text-chart-3" : "text-destructive"}
              >
                {delta >= 0 ? "+" : ""}
                {delta}%
              </span>{" "}
              vs. periodo anterior
            </>
          )
        }
      />
      <StatCard
        label="Pedidos"
        value={kpis.orders}
        hint={`Últimos ${range} días`}
      />
      <StatCard
        label="Ticket promedio"
        value={formatMoney(kpis.averageTicketCents)}
        hint="Pedidos no cancelados"
      />
      <StatCard
        label="Por atender"
        value={kpis.pendingOrders}
        hint={
          <Link
            href="/admin/orders"
            className="hover:text-foreground underline underline-offset-4"
          >
            Ver pedidos pendientes
          </Link>
        }
      />
    </div>
  );
}
