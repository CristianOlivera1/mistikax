import type { Metadata } from "next";
import { AdminPlaceholder } from "@/components/admin/admin-placeholder";

export const metadata: Metadata = {
  title: "Medios",
};

export default function MediaPage() {
  return (
    <AdminPlaceholder
      title="Medios"
      description="Imágenes disponibles para productos y contenido."
      phase="Fase 3"
      icon="lucide:image"
    />
  );
}
