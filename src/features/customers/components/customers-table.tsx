import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { formatDate, formatMoney } from "@/lib/format";
import type { AdminCustomer } from "../types";

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type CustomersTableProps = {
  customers: AdminCustomer[];
};

export function CustomersTable({ customers }: CustomersTableProps) {
  const columns: DataTableColumn<AdminCustomer>[] = [
    {
      id: "customer",
      header: "Cliente",
      cell: (customer) => (
        <div className="flex items-center gap-3">
          <span className="bg-muted text-muted-foreground grid size-8 place-items-center rounded-full text-xs font-semibold">
            {getInitials(customer.name)}
          </span>
          <span className="font-medium">{customer.name}</span>
        </div>
      ),
    },
    {
      id: "contact",
      header: "Contacto",
      cell: (customer) => (
        <div className="text-muted-foreground leading-5">
          <p>{customer.email}</p>
          <p>{customer.phone}</p>
        </div>
      ),
    },
    {
      id: "city",
      header: "Ciudad",
      cell: (customer) => customer.city,
    },
    {
      id: "orders",
      header: "Pedidos",
      cell: (customer) => (
        <span className="font-mono">{customer.orderCount}</span>
      ),
    },
    {
      id: "spent",
      header: "Total gastado",
      cell: (customer) => (
        <span className="font-medium">{formatMoney(customer.spentCents)}</span>
      ),
    },
    {
      id: "last",
      header: "Última compra",
      cell: (customer) => (
        <span className="text-muted-foreground">
          {formatDate(customer.lastPurchaseAt)}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={customers}
      getRowKey={(customer) => customer.id}
    />
  );
}
