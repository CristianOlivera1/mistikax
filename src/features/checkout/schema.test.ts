import { describe, expect, it } from "vitest";
import { checkoutSchema } from "./schema";

const checkoutInput = {
  customerName: "Ana Pérez",
  email: "ana@example.com",
  phone: "999123456",
  city: "Lima",
  address: "Calle Principal 123",
  note: "",
  paymentMethod: "transfer",
  shippingMethod: "delivery",
  shippingZone: "lima",
  couponCode: "",
  idempotencyKey: "checkout-test",
} as const;

describe("checkoutSchema", () => {
  it("requires accepting the terms and conditions", () => {
    const result = checkoutSchema.safeParse({
      ...checkoutInput,
      termsAccepted: false,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["termsAccepted"]);
    }
  });

  it("accepts checkout data when the terms are accepted", () => {
    const result = checkoutSchema.safeParse({
      ...checkoutInput,
      termsAccepted: true,
    });

    expect(result.success).toBe(true);
  });
});
