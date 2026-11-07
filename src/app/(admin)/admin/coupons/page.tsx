import type { Metadata } from "next";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { CouponDialog } from "@/features/coupons/components/coupon-dialog";
import { CouponsTable } from "@/features/coupons/components/coupons-table";
import { getCoupons } from "@/features/coupons/queries";

export const metadata: Metadata = {
  title: "Descuentos",
};

export default async function CouponsPage() {
  const coupons = await getCoupons();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Descuentos"
        description="Códigos que tus clientes aplican al comprar."
        actions={<CouponDialog />}
      />
      <div className="border-border bg-card overflow-hidden rounded-lg border">
        {coupons.length > 0 ? (
          <CouponsTable coupons={coupons} />
        ) : (
          <EmptyState
            icon="lucide:percent"
            title="Sin descuentos"
            description="Crea tu primer código promocional."
          />
        )}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
