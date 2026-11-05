import type { Metadata } from "next";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { CustomerFilters } from "@/features/customers/components/customer-filters";
import { CustomersTable } from "@/features/customers/components/customers-table";
import {
  getCustomers,
  parseCustomerFilters,
} from "@/features/customers/queries";

export const metadata: Metadata = {
  title: "Clientes",
};

type CustomersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CustomersPage({
  searchParams,
}: CustomersPageProps) {
  const filters = parseCustomerFilters(await searchParams);
  const customers = getCustomers(filters);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Clientes"
        description={`${customers.length} clientes registrados por sus pedidos`}
      />
      <div className="border-border bg-card overflow-hidden rounded-lg border">
        <CustomerFilters filters={filters} />
        {customers.length > 0 ? (
          <CustomersTable customers={customers} />
        ) : (
          <EmptyState
            icon="lucide:users"
            title="Sin clientes"
            description="Aún no hay clientes con ese nombre o correo."
          />
        )}
      </div>
    </div>
  );
}
