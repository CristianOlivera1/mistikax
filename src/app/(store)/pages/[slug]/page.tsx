import type { Metadata } from "next";
import type { ReactNode } from "react";
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
  const blocks = page.body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  function renderInline(text: string): ReactNode[] {
    const parts: ReactNode[] = [];
    const pattern = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null = null;
    let key = 0;

    while ((match = pattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      parts.push(<strong key={key++}>{match[1]}</strong>);
      lastIndex = pattern.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  }

  function renderBlock(block: string, index: number): ReactNode {
    if (block.startsWith("### ")) {
      return (
        <h3
          key={index}
          className="font-heading text-xl font-light tracking-[0.05em] uppercase"
        >
          {block.slice(4)}
        </h3>
      );
    }

    if (block.startsWith("## ")) {
      return (
        <h2
          key={index}
          className="font-heading text-2xl font-light tracking-[0.05em] uppercase"
        >
          {block.slice(3)}
        </h2>
      );
    }

    const lines = block.split("\n");
    if (lines.every((line) => line.startsWith("- "))) {
      return (
        <ul key={index} className="list-disc space-y-1 pl-6">
          {lines.map((line, lineIndex) => (
            <li key={lineIndex}>{renderInline(line.slice(2))}</li>
          ))}
        </ul>
      );
    }

    return <p key={index}>{renderInline(block)}</p>;
  }

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <StoreBreadcrumbs
        items={[{ label: "Inicio", href: "/" }, { label: page.title }]}
      />
      <h1 className="font-heading text-5xl leading-none font-light tracking-[0.05em] uppercase">
        {page.title}
      </h1>
      <div className="text-grey-dark mt-8 space-y-4 text-base leading-relaxed">
        {blocks.map(renderBlock)}
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
