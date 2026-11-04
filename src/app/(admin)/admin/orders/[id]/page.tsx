import type { Metadata } from "next";
import { AdminPlaceholder } from "@/components/admin/admin-placeholder";

export const metadata: Metadata = {
  title: "Detalle del pedido",
};

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;

  return (
    <AdminPlaceholder
      title={`Pedido #${id}`}
      description="Detalle, items, cliente, historial y notas."
      phase="Fase 3"
      icon="lucide:shopping-cart"
    />
  );
}
