import { describe, expect, it } from "vitest";
import {
  availableShippingMethods,
  getShippingFromCents,
  resolveShippingCents,
} from "./shipping";

const settings = {
  shippingLimaCents: 1000,
  shippingLimaOuterCents: 1500,
  shippingProvincesCents: 2000,
  freeShippingCents: 20000,
  deliveryEnabled: true,
  pickupEnabled: true,
  courierEnabled: true,
};

describe("resolveShippingCents", () => {
  it("cobra la tarifa de Lima Metropolitana para delivery", () => {
    expect(
      resolveShippingCents({
        method: "delivery",
        zone: "lima",
        subtotalCents: 5000,
        settings,
      }),
    ).toBe(1000);
  });

  it("cobra la tarifa periférica fuera de Lima Metropolitana", () => {
    expect(
      resolveShippingCents({
        method: "delivery",
        zone: "lima-outer",
        subtotalCents: 5000,
        settings,
      }),
    ).toBe(1500);
  });

  it("cobra courier a provincias", () => {
    expect(
      resolveShippingCents({
        method: "courier",
        zone: "provinces",
        subtotalCents: 5000,
        settings,
      }),
    ).toBe(2000);
  });

  it("no cobra recojo en tienda", () => {
    expect(
      resolveShippingCents({
        method: "pickup",
        zone: "lima",
        subtotalCents: 5000,
        settings,
      }),
    ).toBe(0);
  });

  it("aplica envío gratis desde el umbral", () => {
    expect(
      resolveShippingCents({
        method: "courier",
        zone: "provinces",
        subtotalCents: 20000,
        settings,
      }),
    ).toBe(0);
  });

  it("no cobra envío sin productos", () => {
    expect(
      resolveShippingCents({
        method: "delivery",
        zone: "lima",
        subtotalCents: 0,
        settings,
      }),
    ).toBe(0);
  });
});

describe("métodos y tarifa mínima", () => {
  it("expone solo los métodos habilitados", () => {
    expect(
      availableShippingMethods({
        deliveryEnabled: true,
        pickupEnabled: false,
        courierEnabled: true,
      }),
    ).toEqual(["delivery", "courier"]);
  });

  it("usa la tarifa activa más baja como envío desde", () => {
    expect(getShippingFromCents(settings)).toBe(1000);
    expect(
      getShippingFromCents({
        ...settings,
        deliveryEnabled: false,
        pickupEnabled: true,
      }),
    ).toBe(2000);
  });
});
