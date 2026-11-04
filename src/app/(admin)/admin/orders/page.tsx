import type { Metadata } from "next";
import { AdminPlaceholder } from "@/components/admin/admin-placeholder";

export const metadata: Metadata = {
  title: "Pedidos",
};

export default function OrdersPage() {
  return (
    <AdminPlaceholder
      title="Pedidos"
      description="Gestiona y actualiza el estado de cada pedido."
      phase="Fase 3"
      icon="lucide:shopping-cart"
    />
  );
}
