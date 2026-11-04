import type { Metadata } from "next";
import { AdminPlaceholder } from "@/components/admin/admin-placeholder";

export const metadata: Metadata = {
  title: "Clientes",
};

export default function CustomersPage() {
  return (
    <AdminPlaceholder
      title="Clientes"
      description="Personas que compraron en la tienda, derivadas de sus pedidos."
      phase="Fase 3"
      icon="lucide:users"
    />
  );
}
