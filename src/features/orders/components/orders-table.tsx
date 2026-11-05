import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { AdminOrder } from "../types";
import {
  PAYMENT_METHOD_LABELS,
  getOrderItemCount,
  getOrderTotalCents,
} from "../types";
import { OrderStatusBadge } from "./order-status-badge";

type OrdersTableProps = {
  orders: AdminOrder[];
};

export function OrdersTable({ orders }: OrdersTableProps) {
  const columns: DataTableColumn<AdminOrder>[] = [
    {
      id: "number",
      header: "Pedido",
      cell: (order) => (
        <Link
          href={`/admin/orders/${order.id}`}
          className="font-mono font-medium hover:underline"
        >
          #{order.number}
        </Link>
      ),
    },
    {
      id: "date",
      header: "Fecha",
      cell: (order) => (
        <span className="text-muted-foreground">
          {formatDateTime(order.createdAt)}
        </span>
      ),
    },
    {
      id: "customer",
      header: "Cliente",
      cell: (order) => (
        <Link
          href={`/admin/orders/${order.id}`}
          className="font-medium hover:underline"
        >
          {order.customerName}
        </Link>
      ),
    },
    {
      id: "status",
      header: "Estado",
      cell: (order) => <OrderStatusBadge status={order.status} />,
    },
    {
      id: "payment",
      header: "Pago",
      cell: (order) => PAYMENT_METHOD_LABELS[order.paymentMethod],
    },
    {
      id: "items",
      header: "Productos",
      cell: (order) => (
        <span className="text-muted-foreground">
          {getOrderItemCount(order)}
        </span>
      ),
    },
    {
      id: "total",
      header: "Total",
      cell: (order) => (
        <span className="font-medium">
          {formatMoney(getOrderTotalCents(order))}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={orders}
      getRowKey={(order) => order.id}
    />
  );
}
