import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoreBreadcrumbs } from "@/components/store/breadcrumbs";
import { ProductGrid } from "@/components/store/product-grid";
import { SectionHeading } from "@/components/store/section-heading";
import { ProductAccordions } from "@/features/catalog/components/product-accordions";
import { ProductGallery } from "@/features/catalog/components/product-gallery";
import { ProductPurchasePanel } from "@/features/catalog/components/product-purchase-panel";
import {
  getStoreProduct,
  getStoreRelatedProducts,
} from "@/features/catalog/store-queries";
import { getSiteSettings } from "@/features/settings/queries";
import { serializeJsonLd } from "@/lib/json-ld";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getStoreProduct(id);

  if (!product) return { title: "Producto no encontrado" };

  return {
    title: product.name,
    description:
      product.seoDescription || product.description || `${product.name} en Mistikax.`,
    alternates: { canonical: `/product/${product.id}` },
    openGraph: {
      title: product.name,
      description:
        product.seoDescription || product.description || `${product.name} en Mistikax.`,
      images: product.images[0] ? [product.images[0]] : undefined,
      type: "article",
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getStoreProduct(id);

  if (!product) notFound();

  const related = await getStoreRelatedProducts(
    product.id,
    product.categoryId,
    4,
  );
  const settings = await getSiteSettings();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.seoDescription || product.description,
    image: product.images,
    sku: product.id,
    brand: { "@type": "Brand", name: settings.storeName },
    offers: {
      "@type": "Offer",
      priceCurrency: "PEN",
      price: (product.priceCents / 100).toFixed(2),
      availability:
        product.stockTotal > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <StoreBreadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Catálogo", href: "/catalog" },
          {
            label: product.categoryName,
            href: `/catalog?category=${product.categoryId}`,
          },
          { label: product.name },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} name={product.name} />
        <div className="space-y-8">
          <ProductPurchasePanel product={product} whatsappPhone={settings.whatsapp} />
          <ProductAccordions />
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-24">
          <SectionHeading
            eyebrow="Combina con"
            title="También te puede gustar"
            linkHref={`/catalog?category=${product.categoryId}`}
          />
          <ProductGrid products={related} />
        </section>
      ) : null}
    </div>
  );
}
