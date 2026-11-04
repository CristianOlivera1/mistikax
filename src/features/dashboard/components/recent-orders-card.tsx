import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { ORDER_STATUSES } from "@/lib/constants";
import { formatMoney } from "@/lib/format";
import type { OrderFixture } from "../types";
import { ORDER_STATUS_TONES } from "./status";

const columns: DataTableColumn<OrderFixture>[] = [
  {
    id: "number",
    header: "Pedido",
    cell: (order) => (
      <Link
        href={`/admin/orders/${order.id}`}
        className="font-mono text-xs font-medium hover:underline"
      >
        #{order.number}
      </Link>
    ),
  },
  {
    id: "customer",
    header: "Cliente",
    cell: (order) => <span className="font-medium">{order.customerName}</span>,
  },
  {
    id: "status",
    header: "Estado",
    cell: (order) => (
      <StatusBadge tone={ORDER_STATUS_TONES[order.status]}>
        {ORDER_STATUSES[order.status]}
      </StatusBadge>
    ),
  },
  {
    id: "total",
    header: "Total",
    cell: (order) => (
      <span className="font-medium">{formatMoney(order.totalCents)}</span>
    ),
    className: "text-right",
  },
];

type RecentOrdersCardProps = {
  orders: OrderFixture[];
  className?: string;
};

export function RecentOrdersCard({ orders, className }: RecentOrdersCardProps) {
  return (
    <SectionCard
      title="Pedidos recientes"
      className={className}
      action={
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/orders">Ver todos</Link>
        </Button>
      }
    >
      <DataTable
        columns={columns}
        rows={orders}
        getRowKey={(order) => order.id}
      />
    </SectionCard>
  );
}
