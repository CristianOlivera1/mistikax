import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatMoney } from "@/lib/format";
import { isCouponExpired } from "../queries";
import type { AdminCoupon } from "../types";
import { CouponActions } from "./coupon-actions";

function formatCouponValue(coupon: AdminCoupon): string {
  return coupon.kind === "percent"
    ? `${coupon.value}%`
    : formatMoney(coupon.value);
}

function CouponStateBadge({ coupon }: { coupon: AdminCoupon }) {
  if (isCouponExpired(coupon)) {
    return <StatusBadge tone="danger">Vencido</StatusBadge>;
  }

  return (
    <StatusBadge tone={coupon.active ? "success" : "neutral"}>
      {coupon.active ? "Activo" : "Inactivo"}
    </StatusBadge>
  );
}

type CouponsTableProps = {
  coupons: AdminCoupon[];
};

export function CouponsTable({ coupons }: CouponsTableProps) {
  const columns: DataTableColumn<AdminCoupon>[] = [
    {
      id: "code",
      header: "Código",
      cell: (coupon) => (
        <span className="font-mono font-medium">{coupon.code}</span>
      ),
    },
    {
      id: "value",
      header: "Descuento",
      cell: (coupon) => formatCouponValue(coupon),
    },
    {
      id: "uses",
      header: "Usos",
      cell: (coupon) => <span className="font-mono">{coupon.uses}</span>,
    },
    {
      id: "expires",
      header: "Vence",
      cell: (coupon) => (
        <span className="text-muted-foreground">
          {formatDate(`${coupon.expiresAt}T12:00:00.000Z`)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Estado",
      cell: (coupon) => <CouponStateBadge coupon={coupon} />,
    },
    {
      id: "actions",
      header: "",
      className: "text-right",
      cell: (coupon) => <CouponActions coupon={coupon} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={coupons}
      getRowKey={(coupon) => coupon.code}
    />
  );
}
