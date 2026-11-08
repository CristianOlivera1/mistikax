import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderConfirmation } from "@/features/checkout/queries";
import { SHIPPING_METHOD_LABELS } from "@/features/checkout/shipping";
import { getSiteSettings } from "@/features/settings/queries";
import { formatMoney } from "@/lib/format";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Pedido confirmado",
  robots: { index: false, follow: false },
};

type SuccessPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const params = await searchParams;
  const orderId = first(params.order);
  const number = Number.parseInt(first(params.number), 10);
  const token = first(params.token);

  if (!orderId || !Number.isFinite(number) || !token) notFound();

  const order = await getOrderConfirmation(orderId, number, token);

  if (!order) notFound();

  const settings = await getSiteSettings();
  const whatsappUrl = buildWhatsAppLink(
    settings.whatsapp,
    `Hola, soy ${order.customerName}. Acabo de hacer el pedido #${order.number}. ¿Cómo coordino el pago?`,
  );

  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <p className="text-premium font-space-mono mb-4 text-xs font-bold tracking-[0.2em] uppercase">
        Pedido #{order.number}
      </p>
      <h1 className="font-heading text-5xl leading-none font-light tracking-[0.05em] uppercase">
        ¡Gracias, {order.customerName}!
      </h1>
      <p className="text-grey-dark mt-4 text-sm leading-relaxed">
        Registramos tu pedido y lo preparamos para {order.city}. Coordina el
        pago y la entrega por WhatsApp con nuestro equipo.
      </p>
      <p className="text-grey-dark mt-2 text-[11px] tracking-widest uppercase">
        {SHIPPING_METHOD_LABELS[order.shippingMethod]}
        {order.shippingMethod === "pickup"
          ? ""
          : ` · ${order.address}, ${order.city}`}
      </p>

      <div className="border-grey-light mt-10 border">
        <ul className="divide-grey-light divide-y">
          {order.items.map((item, index) => (
            <li
              key={`${item.productName}-${index}`}
              className="flex items-start justify-between gap-3 px-5 py-4 text-sm"
            >
              <span>
                {item.quantity} × {item.productName}
                <span className="text-grey-dark block text-[11px] uppercase">
                  Talla {item.size}
                </span>
              </span>
              <span className="font-semibold">
                {formatMoney(item.priceCents * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="border-grey-light flex items-center justify-between border-t px-5 py-3 text-sm">
          <span className="text-grey-dark">Envío</span>
          <span>
            {order.shippingCents === 0
              ? "Gratis"
              : formatMoney(order.shippingCents)}
          </span>
        </div>
        <div className="border-grey-light flex items-center justify-between border-t px-5 py-4 text-base font-semibold">
          <span>Total</span>
          <span>{formatMoney(order.totalCents)}</span>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener"
          className="bg-premium text-dark hover:bg-premium-hover hover:text-offwhite flex-1 px-6 py-4 text-center text-xs font-bold tracking-widest uppercase transition-colors"
        >
          Coordinar por WhatsApp
        </a>
        <Link
          href="/catalog"
          className="border-dark hover:bg-dark hover:text-background flex-1 border px-6 py-4 text-center text-xs font-bold tracking-widest uppercase transition-colors"
        >
          Volver al catálogo
        </Link>
      </div>
    </div>
  );
}
