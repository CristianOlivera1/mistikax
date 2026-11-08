import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { StoreBreadcrumbs } from "@/components/store/breadcrumbs";
import { getCartView } from "@/features/cart/queries";
import { CheckoutForm } from "@/features/checkout/components/checkout-form";
import type { CheckoutPaymentMethod } from "@/features/checkout/schema";
import { getCustomerSession } from "@/features/customer-auth/queries";
import { getSiteSettings } from "@/features/settings/queries";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const cart = await getCartView();

  if (cart.totals.itemCount === 0) redirect("/cart");

  const settings = await getSiteSettings();
  const customer = await getCustomerSession();
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

      <CheckoutForm
        paymentMethods={paymentMethods}
        customerName={customer?.fullName}
        customerEmail={customer?.email}
        lines={cart.lines}
        subtotalCents={cart.totals.subtotalCents}
        freeShippingCents={settings.freeShippingCents}
        shipping={{
          deliveryEnabled: settings.deliveryEnabled,
          pickupEnabled: settings.pickupEnabled,
          courierEnabled: settings.courierEnabled,
          limaCents: settings.shippingLimaCents,
          limaOuterCents: settings.shippingLimaOuterCents,
          provincesCents: settings.shippingProvincesCents,
          storeAddress: settings.address,
          leadTime: settings.leadTime,
        }}
      />
    </div>
  );
}
