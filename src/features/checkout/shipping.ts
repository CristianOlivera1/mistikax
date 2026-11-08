import type { SiteSettings } from "@/features/settings/types";

export type ShippingMethod = "delivery" | "pickup" | "courier";
export type ShippingZone = "lima" | "lima-outer" | "provinces";

export const SHIPPING_METHOD_LABELS: Record<ShippingMethod, string> = {
  delivery: "Delivery a domicilio",
  pickup: "Recojo en tienda",
  courier: "Courier a provincias",
};

export const SHIPPING_ZONE_LABELS: Record<ShippingZone, string> = {
  lima: "Lima Metropolitana",
  "lima-outer": "Lima periférica",
  provinces: "Provincias",
};

type ShippingSettings = Pick<
  SiteSettings,
  | "shippingLimaCents"
  | "shippingLimaOuterCents"
  | "shippingProvincesCents"
  | "freeShippingCents"
  | "deliveryEnabled"
  | "pickupEnabled"
  | "courierEnabled"
>;

export function availableShippingMethods(
  settings: Pick<
    ShippingSettings,
    "deliveryEnabled" | "pickupEnabled" | "courierEnabled"
  >,
): ShippingMethod[] {
  const methods: ShippingMethod[] = [];

  if (settings.deliveryEnabled) methods.push("delivery");
  if (settings.pickupEnabled) methods.push("pickup");
  if (settings.courierEnabled) methods.push("courier");

  return methods;
}

export function getShippingFromCents(settings: ShippingSettings): number {
  const rates: number[] = [];

  if (settings.deliveryEnabled) {
    rates.push(settings.shippingLimaCents, settings.shippingLimaOuterCents);
  }

  if (settings.courierEnabled) rates.push(settings.shippingProvincesCents);

  return rates.length > 0 ? Math.min(...rates) : 0;
}

export function resolveShippingCents({
  method,
  zone,
  subtotalCents,
  settings,
}: {
  method: ShippingMethod;
  zone: ShippingZone;
  subtotalCents: number;
  settings: ShippingSettings;
}): number {
  if (subtotalCents <= 0) return 0;
  if (method === "pickup") return 0;

  if (
    settings.freeShippingCents > 0 &&
    subtotalCents >= settings.freeShippingCents
  ) {
    return 0;
  }

  if (method === "delivery") {
    return zone === "lima-outer"
      ? settings.shippingLimaOuterCents
      : settings.shippingLimaCents;
  }

  return settings.shippingProvincesCents;
}
