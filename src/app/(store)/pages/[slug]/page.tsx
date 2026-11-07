import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoreBreadcrumbs } from "@/components/store/breadcrumbs";
import { getPublishedPage } from "@/features/content/store-queries";
import { getSiteSettings } from "@/features/settings/queries";
import { buildWhatsAppLink } from "@/lib/whatsapp";

type ContentPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ContentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedPage(slug);

  if (!page) return { title: "Página no encontrada" };

  return {
    title: page.title,
    description: page.seoDescription || undefined,
    alternates: { canonical: `/pages/${page.id}` },
  };
}

export default async function StoreContentPage({ params }: ContentPageProps) {
  const { slug } = await params;
  const page = await getPublishedPage(slug);

  if (!page) notFound();

  const settings = await getSiteSettings();
  const paragraphs = page.body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <StoreBreadcrumbs
        items={[{ label: "Inicio", href: "/" }, { label: page.title }]}
      />
      <h1 className="font-heading text-5xl leading-none font-light tracking-[0.05em] uppercase">
        {page.title}
      </h1>
      <div className="text-grey-dark mt-8 space-y-4 text-base leading-relaxed">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      <div className="border-grey-light mt-12 border-t pt-8">
        <p className="text-sm">¿Tienes otra pregunta?</p>
        <a
          href={buildWhatsAppLink(
            settings.whatsapp,
            `Hola, tengo una consulta sobre ${page.title}.`,
          )}
          target="_blank"
          rel="noopener"
          className="bg-premium text-dark hover:bg-premium-hover hover:text-offwhite mt-4 inline-block px-6 py-3 text-xs font-bold tracking-widest uppercase transition-colors"
        >
          Escríbenos por WhatsApp
        </a>
      </div>
    </article>
  );
}
