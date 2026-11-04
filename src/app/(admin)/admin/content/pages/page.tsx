import type { Metadata } from "next";
import { AdminPlaceholder } from "@/components/admin/admin-placeholder";

export const metadata: Metadata = {
  title: "Páginas",
};

export default function ContentPagesPage() {
  return (
    <AdminPlaceholder
      title="Páginas"
      description="Textos informativos de la tienda."
      phase="Fase 3"
      icon="lucide:file-text"
    />
  );
}
