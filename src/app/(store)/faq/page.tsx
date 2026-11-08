import type { Metadata } from "next";
import { StoreBreadcrumbs } from "@/components/store/breadcrumbs";
import { FaqAccordion } from "@/components/store/faq-accordion";
import { StoreEmptyState } from "@/components/store/empty-state";
import { getFaqs } from "@/features/content/queries";
import { serializeJsonLd } from "@/lib/json-ld";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description:
    "Respuestas sobre tallas, envíos, cambios, pagos y atención de pedidos en Mistikax.",
};

export default async function FaqPage() {
  const faqs = await getFaqs();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <StoreBreadcrumbs
        items={[{ label: "Inicio", href: "/" }, { label: "Preguntas frecuentes" }]}
      />
      <h1 className="font-heading text-5xl leading-none font-light tracking-[0.05em] uppercase">
        Preguntas frecuentes
      </h1>
      <p className="text-grey-dark mt-4 text-sm leading-relaxed">
        Tallas, envíos, cambios y formas de pago. Si tu duda no está aquí,
        escríbenos por WhatsApp.
      </p>

      <div className="mt-10">
        {faqs.length > 0 ? (
          <FaqAccordion items={faqs} />
        ) : (
          <StoreEmptyState
            title="Aún no hay preguntas publicadas"
            description="Nuestro equipo está preparando las respuestas más frecuentes."
            ctaLabel="Ir al catálogo"
            ctaHref="/catalog"
          />
        )}
      </div>
    </div>
  );
}
