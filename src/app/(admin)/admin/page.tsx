import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons/icon";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { AttentionList } from "@/features/dashboard/components/attention-list";
import { OverviewKpis } from "@/features/dashboard/components/overview-kpis";
import { RangeSelect } from "@/features/dashboard/components/range-select";
import { RecentOrdersCard } from "@/features/dashboard/components/recent-orders-card";
import { SalesChart } from "@/features/dashboard/components/sales-chart";
import { TopProductsCard } from "@/features/dashboard/components/top-products-card";
import {
  getDashboardOverview,
  parseDashboardRange,
} from "@/features/dashboard/queries";
import { STORE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Resumen",
};

type AdminOverviewPageProps = {
  searchParams: Promise<{ range?: string }>;
};

export default async function AdminOverviewPage({
  searchParams,
}: AdminOverviewPageProps) {
  const { range } = await searchParams;
  const overview = getDashboardOverview(parseDashboardRange(range));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Resumen"
        description={`Actividad de ${STORE.name}`}
        actions={
          <>
            <RangeSelect value={overview.range} />
            <Button asChild>
              <Link href="/admin/products/new">
                <Icon
                  icon="lucide:plus"
                  width={15}
                  height={15}
                  aria-hidden="true"
                />
                Nuevo producto
              </Link>
            </Button>
          </>
        }
      />

      <OverviewKpis kpis={overview.kpis} range={overview.range} />

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Ventas diarias"
          description={overview.periodLabel}
          className="lg:col-span-2"
          bodyClassName="px-5 pb-5 pt-3"
        >
          <SalesChart points={overview.series} range={overview.range} />
        </SectionCard>
        <AttentionList
          lowStock={overview.lowStock}
          pendingOrders={overview.kpis.pendingOrders}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <RecentOrdersCard
          orders={overview.recentOrders}
          className="lg:col-span-2"
        />
        <TopProductsCard products={overview.topProducts} />
      </div>
    </div>
  );
}
