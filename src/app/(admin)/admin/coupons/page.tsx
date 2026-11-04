import type { Metadata } from "next";
import { AdminPlaceholder } from "@/components/admin/admin-placeholder";

export const metadata: Metadata = {
  title: "Descuentos",
};

export default function CouponsPage() {
  return (
    <AdminPlaceholder
      title="Descuentos"
      description="Códigos que tus clientes aplican al comprar."
      phase="Fase 3"
      icon="lucide:percent"
    />
  );
}
