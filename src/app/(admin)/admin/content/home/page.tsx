import type { Metadata } from "next";
import { AdminPlaceholder } from "@/components/admin/admin-placeholder";

export const metadata: Metadata = {
  title: "Portada y banners",
};

export default function HomeContentPage() {
  return (
    <AdminPlaceholder
      title="Portada y banners"
      description="Barra de anuncio, hero y orden de las secciones de la portada."
      phase="Fase 3"
      icon="lucide:layout-template"
    />
  );
}
