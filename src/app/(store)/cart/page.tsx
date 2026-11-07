import type { Metadata } from "next";
import Link from "next/link";
import { StoreBreadcrumbs } from "@/components/store/breadcrumbs";
import { ShippingProgress } from "@/components/store/shipping-progress";
import { CartLines } from "@/features/cart/components/cart-lines";
import { CartSummary } from "@/features/cart/components/cart-summary";
import { getCartView } from "@/features/cart/queries";
import { getSiteSettings } from "@/features/settings/queries";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Carrito",
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  const cart = await getCartView();
  const settings = await getSiteSettings();
  const hasItems = cart.lines.length > 0 && cart.totals.itemCount > 0;

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      <StoreBreadcrumbs
        items={[{ label: "Inicio", href: "/" }, { label: "Carrito" }]}
      />

      <h1 className="font-heading mb-10 text-5xl font-light tracking-[0.05em] uppercase">
        Tu carrito
      </h1>

      {cart.lines.length === 0 ? (
        <div className="border-grey-light border px-6 py-20 text-center">
          <p className="font-heading text-3xl font-light uppercase">
            Tu carrito está vacío
          </p>
          <p className="text-grey-dark mt-3 text-sm">
            Explora el catálogo y encuentra tu siguiente prenda.
          </p>
          <Link
            href="/catalog"
            className="bg-premium text-dark hover:bg-premium-hover hover:text-offwhite mt-8 inline-block px-8 py-4 text-xs font-bold tracking-widest uppercase transition-colors"
          >
            Ver catálogo
          </Link>
        </div>
      ) : (
        <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
          <div>
            <CartLines lines={cart.lines} />
            <Link
              href="/catalog"
              className="text-grey-dark mt-6 inline-block text-xs tracking-widest uppercase underline underline-offset-4"
            >
              Seguir comprando
            </Link>
          </div>

          <aside className="border-grey-light h-fit border p-6">
            <h2 className="font-heading mb-4 text-xl tracking-widest uppercase">
              Resumen
            </h2>
            <ShippingProgress
              subtotalCents={cart.totals.subtotalCents}
              freeShippingCents={cart.freeShippingCents}
            />
            <div className="pt-4">
              <CartSummary totals={cart.totals}>
                <Link
                  href={hasItems ? "/checkout" : "/catalog"}
                  className="bg-dark text-background hover:bg-premium hover:text-dark mt-4 block w-full px-6 py-4 text-center text-xs font-bold tracking-widest uppercase transition-colors"
                >
                  {hasItems ? "Ir a pagar" : "Ver catálogo"}
                </Link>
                <a
                  href={buildWhatsAppLink(
                    settings.whatsapp,
                    "Hola, tengo una consulta sobre mi carrito.",
                  )}
                  target="_blank"
                  rel="noopener"
                  className="border-dark hover:bg-dark hover:text-background mt-3 block w-full border px-6 py-3 text-center text-xs font-bold tracking-widest uppercase transition-colors"
                >
                  Consultar por WhatsApp
                </a>
              </CartSummary>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
