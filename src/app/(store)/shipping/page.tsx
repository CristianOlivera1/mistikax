import type { Metadata } from "next";
import Link from "next/link";
import { Package, Store, Truck } from "lucide-react";
import { StoreBreadcrumbs } from "@/components/store/breadcrumbs";
import { getSiteSettings } from "@/features/settings/queries";
import { formatMoney } from "@/lib/format";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Envíos y tarifas",
  description:
    "Formas de envío, mecanismos de entrega y tarifario por zona de Mistikax.",
  alternates: { canonical: "/shipping" },
};

export default async function ShippingPage() {
  const settings = await getSiteSettings();
  const rates: Array<{
    zone: string;
    method: string;
    time: string;
    priceCents: number;
  }> = [];

  if (settings.deliveryEnabled) {
    rates.push(
      {
        zone: "Lima Metropolitana",
        method: "Delivery a domicilio",
        time: `Despacho en ${settings.leadTime}`,
        priceCents: settings.shippingLimaCents,
      },
      {
        zone: "Lima periférica",
        method: "Delivery a domicilio",
        time: `Despacho en ${settings.leadTime}`,
        priceCents: settings.shippingLimaOuterCents,
      },
    );
  }

  if (settings.courierEnabled) {
    rates.push({
      zone: "Provincias",
      method: "Courier por agencia",
      time: "3 a 5 días hábiles después del despacho",
      priceCents: settings.shippingProvincesCents,
    });
  }

  if (settings.pickupEnabled) {
    rates.push({
      zone: "Recojo en tienda",
      method: "Retiro coordinado",
      time: "Listo en 24 a 48 horas hábiles",
      priceCents: 0,
    });
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      <StoreBreadcrumbs
        items={[{ label: "Inicio", href: "/" }, { label: "Envíos y tarifas" }]}
      />

      <p className="text-premium font-space-mono text-[11px] font-bold tracking-[0.22em] uppercase">
        Envíos
      </p>
      <h1 className="font-heading mt-3 text-5xl leading-none font-light tracking-[0.05em] uppercase">
        Formas de envío y tarifario
      </h1>
      <p className="text-grey-dark mt-5 max-w-2xl text-sm leading-relaxed">
        Preparamos cada pedido en {settings.leadTime}. Elige delivery a
        domicilio, recojo en tienda o courier a provincias. El envío es gratis
        desde {formatMoney(settings.freeShippingCents)}.
      </p>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {settings.deliveryEnabled ? (
          <div className="border-grey-light border p-6">
            <Truck className="text-premium size-6" aria-hidden="true" />
            <h2 className="font-heading mt-4 text-xl tracking-widest uppercase">
              Delivery
            </h2>
            <p className="text-grey-dark mt-2 text-sm leading-relaxed">
              Entregamos en Lima Metropolitana y Lima periférica con
              coordinación previa por WhatsApp.
            </p>
            <p className="mt-4 text-xs font-medium tracking-widest uppercase">
              Desde {formatMoney(settings.shippingLimaCents)}
            </p>
          </div>
        ) : null}

        {settings.pickupEnabled ? (
          <div className="border-grey-light border p-6">
            <Store className="text-premium size-6" aria-hidden="true" />
            <h2 className="font-heading mt-4 text-xl tracking-widest uppercase">
              Recojo en tienda
            </h2>
            <p className="text-grey-dark mt-2 text-sm leading-relaxed">
              Retira tu pedido sin costo en {settings.address}. Te avisamos
              cuando esté listo.
            </p>
            <p className="mt-4 text-xs font-medium tracking-widest uppercase">
              Gratis
            </p>
          </div>
        ) : null}

        {settings.courierEnabled ? (
          <div className="border-grey-light border p-6">
            <Package className="text-premium size-6" aria-hidden="true" />
            <h2 className="font-heading mt-4 text-xl tracking-widest uppercase">
              Courier
            </h2>
            <p className="text-grey-dark mt-2 text-sm leading-relaxed">
              Enviamos a todo el país por agencia. Te compartimos el número de
              guía para el seguimiento.
            </p>
            <p className="mt-4 text-xs font-medium tracking-widest uppercase">
              {formatMoney(settings.shippingProvincesCents)} a provincias
            </p>
          </div>
        ) : null}
      </div>

      <section className="mt-16">
        <h2 className="font-heading text-3xl font-light tracking-[0.05em] uppercase">
          Tarifario
        </h2>
        <div className="border-grey-light mt-6 overflow-x-auto border">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-grey-light bg-offwhite border-b">
                <th className="px-5 py-4 text-xs font-bold tracking-widest uppercase">
                  Zona
                </th>
                <th className="px-5 py-4 text-xs font-bold tracking-widest uppercase">
                  Método
                </th>
                <th className="px-5 py-4 text-xs font-bold tracking-widest uppercase">
                  Tiempo
                </th>
                <th className="px-5 py-4 text-right text-xs font-bold tracking-widest uppercase">
                  Tarifa
                </th>
              </tr>
            </thead>
            <tbody className="divide-grey-light divide-y">
              {rates.map((rate) => (
                <tr key={`${rate.zone}-${rate.method}`}>
                  <td className="px-5 py-4 font-medium">{rate.zone}</td>
                  <td className="text-grey-dark px-5 py-4">{rate.method}</td>
                  <td className="text-grey-dark px-5 py-4">{rate.time}</td>
                  <td className="px-5 py-4 text-right font-semibold">
                    {rate.priceCents === 0
                      ? "Gratis"
                      : formatMoney(rate.priceCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-grey-dark mt-4 text-xs leading-relaxed">
          El envío gratis aplica desde {formatMoney(settings.freeShippingCents)}{" "}
          de subtotal y no incluye el recojo en tienda, que ya es gratuito. Los
          plazos se cuentan desde la confirmación del pago y el despacho.
        </p>
      </section>

      <section className="mt-16">
        <h2 className="font-heading text-3xl font-light tracking-[0.05em] uppercase">
          Cómo funciona
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Confirmas tu pedido",
              copy: "Eliges método y zona en el checkout. El total se calcula al instante.",
            },
            {
              step: "02",
              title: "Preparamos y despachamos",
              copy: `Empacamos en ${settings.leadTime} y coordinamos el pago por WhatsApp.`,
            },
            {
              step: "03",
              title: "Recibes o recoges",
              copy: "Te enviamos la guía del courier o te avisamos cuando puedas recoger.",
            },
          ].map((item) => (
            <div key={item.step} className="border-grey-light border-t pt-5">
              <span className="text-premium font-space-mono text-xs font-bold">
                {item.step}
              </span>
              <h3 className="font-heading mt-2 text-lg tracking-widest uppercase">
                {item.title}
              </h3>
              <p className="text-grey-dark mt-2 text-sm leading-relaxed">
                {item.copy}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="border-grey-light mt-16 flex flex-col gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm">
          ¿Tu zona no aparece o tienes una consulta?{" "}
          <Link
            href="/pages/terms-and-conditions"
            className="underline underline-offset-4"
          >
            Revisa los términos y condiciones
          </Link>
          .
        </p>
        <a
          href={buildWhatsAppLink(
            settings.whatsapp,
            "Hola, tengo una consulta sobre envíos y tarifas.",
          )}
          target="_blank"
          rel="noopener"
          className="bg-premium text-dark hover:bg-premium-hover hover:text-offwhite inline-block px-6 py-3 text-center text-xs font-bold tracking-widest uppercase transition-colors"
        >
          Escríbenos por WhatsApp
        </a>
      </div>
    </div>
  );
}
