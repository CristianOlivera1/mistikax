import type { Metadata } from "next";
import { AdminPlaceholder } from "@/components/admin/admin-placeholder";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
};

export default function FaqsPage() {
  return (
    <AdminPlaceholder
      title="Preguntas frecuentes"
      description="Preguntas que se muestran al final de la portada."
      phase="Fase 3"
      icon="lucide:info"
    />
  );
}
