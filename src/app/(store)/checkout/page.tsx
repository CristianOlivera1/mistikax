import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { StoreBreadcrumbs } from "@/components/store/breadcrumbs";
import { CartSummary } from "@/features/cart/components/cart-summary";
import { getCartView } from "@/features/cart/queries";
import { CheckoutForm } from "@/features/checkout/components/checkout-form";
import type { CheckoutPaymentMethod } from "@/features/checkout/schema";
import { getSiteSettings } from "@/features/settings/queries";
import { formatMoney } from "@/lib/format";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const cart = await getCartView();

  if (cart.totals.itemCount === 0) redirect("/cart");

  const settings = await getSiteSettings();
  const paymentMethods: CheckoutPaymentMethod[] = [];

  if (settings.paymentTransfer) paymentMethods.push("transfer");
  if (settings.paymentCod) paymentMethods.push("cod");

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      <StoreBreadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Carrito", href: "/cart" },
          { label: "Checkout" },
        ]}
      />

      <h1 className="font-heading mb-10 text-5xl font-light tracking-[0.05em] uppercase">
        Finalizar compra
      </h1>

      <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
        <CheckoutForm paymentMethods={paymentMethods} />

        <aside className="border-grey-light h-fit border p-6">
          <h2 className="font-heading mb-4 text-xl tracking-widest uppercase">
            Tu pedido
          </h2>
          <ul className="divide-grey-light mb-4 divide-y">
            {cart.lines.map((line) => (
              <li key={line.key} className="flex items-start justify-between gap-3 py-3 text-sm">
                <span>
                  {line.qty} × {line.name}
                  <span className="text-grey-dark block text-[11px] uppercase">
                    Talla {line.size}
                    {line.colorName ? ` · ${line.colorName}` : ""}
                  </span>
                </span>
                <span className="font-semibold">
                  {formatMoney(line.priceCents * line.qty)}
                </span>
              </li>
            ))}
          </ul>
          <CartSummary totals={cart.totals} />
          {paymentMethods.length === 0 ? (
            <p role="alert" className="text-error mt-4 text-xs">
              No hay métodos de pago activos. Escríbenos por WhatsApp para
              coordinar tu pedido.
            </p>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
