import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { FaqDialog } from "@/features/content/components/faq-dialog";
import { FaqList } from "@/features/content/components/faq-list";
import { getFaqs } from "@/features/content/queries";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
};

export default function FaqsPage() {
  const faqs = getFaqs();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Preguntas frecuentes"
        description="Se muestran al final de la portada."
        actions={<FaqDialog />}
      />
      <div className="border-border bg-card overflow-hidden rounded-lg border">
        <FaqList faqs={faqs} />
      </div>
    </div>
  );
}
