import type { Metadata } from "next";
import { AgeCollection } from "@/components/store/age-collection";
import { BenefitsBlock } from "@/components/store/benefits-block";
import { CategoriesGrid } from "@/components/store/categories-grid";
import { FaqAccordion } from "@/components/store/faq-accordion";
import { Hero } from "@/components/store/hero";
import { ProductGrid } from "@/components/store/product-grid";
import { SectionHeading } from "@/components/store/section-heading";
import { StepsSection } from "@/components/store/steps-section";
import {
  getStoreBestSellers,
  getStoreCategoryShowcase,
  getStoreNewArrivals,
  getStoreTopSellingByAge,
} from "@/features/catalog/store-queries";
import { getFaqs, getHomeContent } from "@/features/content/queries";
import { getSiteSettings } from "@/features/settings/queries";

export const metadata: Metadata = {
  title: "Ropa para hombre",
};

const SECTION_COPY = {
  age: {
    eyebrow: "Para todas las edades",
    title: "Compra por edad",
    description: "Cada grupo tiene sus propias tallas y modelos.",
  },
  categories: {
    eyebrow: "Categorías",
    title: "Qué encontrarás",
    description:
      "Polos, camisas, pantalones, casacas, calzado, gorras y accesorios.",
  },
  "best-sellers": {
    eyebrow: "Favoritos",
    title: "Más vendidos",
    description: "",
  },
  new: {
    eyebrow: "Recién llegado",
    title: "Novedades",
    description: "",
  },
  faq: {
    eyebrow: "Ayuda",
    title: "Preguntas frecuentes",
    description: "Respuestas sobre tallas, envíos, cambios y formas de pago.",
  },
} as const;

export default async function StoreHomePage() {
  const [
    homeContent,
    settings,
    byAge,
    categories,
    bestSellers,
    newArrivals,
    faqs,
  ] = await Promise.all([
    getHomeContent(),
    getSiteSettings(),
    getStoreTopSellingByAge(),
    getStoreCategoryShowcase(),
    getStoreBestSellers(),
    getStoreNewArrivals(),
    getFaqs(),
  ]);

  const sections = homeContent.sections.filter((section) => section.visible);

  function renderSection(id: string) {
    switch (id) {
      case "age":
        return (
          <section className="bg-offwhite border-grey-light border-b py-24">
            <div className="mx-auto max-w-[1400px] px-6">
              <SectionHeading {...SECTION_COPY.age} />
              <AgeCollection byAge={byAge} />
            </div>
          </section>
        );
      case "categories":
        return (
          <section className="bg-surface py-24">
            <div className="mx-auto max-w-[1400px] px-6">
              <SectionHeading {...SECTION_COPY.categories} />
              <CategoriesGrid categories={categories} />
            </div>
          </section>
        );
      case "best-sellers":
        if (bestSellers.length === 0) return null;
        return (
          <section className="mx-auto max-w-[1400px] px-6 py-24">
            <SectionHeading
              {...SECTION_COPY["best-sellers"]}
              linkHref="/catalogo"
            />
            <ProductGrid products={bestSellers} />
          </section>
        );
      case "benefits":
        return (
          <section className="w-full">
            <BenefitsBlock
              freeShippingCents={settings.freeShippingCents}
              leadTime={settings.leadTime}
            />
          </section>
        );
      case "new":
        if (newArrivals.length === 0) return null;
        return (
          <section className="mx-auto max-w-[1400px] px-6 py-24">
            <SectionHeading
              {...SECTION_COPY.new}
              linkHref="/catalogo?sort=new"
            />
            <ProductGrid products={newArrivals} />
          </section>
        );
      case "steps":
        return (
          <section className="border-grey-light w-full border-y py-24">
            <div className="mx-auto max-w-[1200px] px-6">
              <div className="mb-16 text-center">
                <h2 className="mb-4 text-4xl font-light tracking-tight md:text-5xl">
                  Compra en 4 pasos
                </h2>
                <p className="text-grey-dark text-lg font-light tracking-wide">
                  Del catálogo a tu puerta: comprar es así de fácil
                </p>
              </div>
              <StepsSection />
            </div>
          </section>
        );
      case "faq":
        if (faqs.length === 0) return null;
        return (
          <section className="mx-auto max-w-[1200px] px-6 py-24">
            <div className="flex flex-col gap-12 md:flex-row md:gap-24">
              <div className="md:w-1/3">
                <h2 className="mb-6 text-3xl leading-[1.1] font-light tracking-tight md:text-4xl">
                  {SECTION_COPY.faq.title}{" "}
                  <span className="text-grey-dark block font-serif text-2xl italic">
                    para comprar en Mistikax
                  </span>
                </h2>
                <p className="text-grey-dark text-sm leading-relaxed">
                  {SECTION_COPY.faq.description}
                </p>
              </div>
              <div className="md:w-2/3">
                <FaqAccordion items={faqs.slice(0, 3)} />
              </div>
            </div>
          </section>
        );
      default:
        return null;
    }
  }

  return (
    <>
      <Hero
        title={homeContent.hero.title}
        subtitle={homeContent.hero.subtitle}
        image={homeContent.hero.image}
        ctaLabel={homeContent.hero.cta}
        ctaHref={homeContent.hero.link}
      />
      {sections.map((section) => (
        <div key={section.id}>{renderSection(section.id)}</div>
      ))}
    </>
  );
}
