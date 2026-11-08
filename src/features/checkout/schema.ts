import { z } from "zod";

export const CHECKOUT_PAYMENT_METHODS = {
  transfer: "Transferencia bancaria",
  cod: "Pago contra entrega",
} as const;

export type CheckoutPaymentMethod = keyof typeof CHECKOUT_PAYMENT_METHODS;

export const CHECKOUT_SHIPPING_METHODS = [
  "delivery",
  "pickup",
  "courier",
] as const;

export const CHECKOUT_SHIPPING_ZONES = [
  "lima",
  "lima-outer",
  "provinces",
] as const;

export const checkoutSchema = z
  .object({
    customerName: z
      .string()
      .trim()
      .min(2, "Escribe tu nombre completo.")
      .max(80, "El nombre es demasiado largo."),
    email: z.string().trim().email("Escribe un correo válido.").max(120),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+\s-]{6,20}$/, "Escribe un teléfono válido."),
    city: z.string().trim().max(80, "La ciudad es demasiado larga."),
    address: z.string().trim().max(200, "La dirección es demasiado larga."),
    note: z.string().trim().max(500, "La nota no debe superar 500 caracteres."),
    paymentMethod: z.enum(["transfer", "cod"]),
    shippingMethod: z.enum(CHECKOUT_SHIPPING_METHODS, {
      error: "Elige un método de entrega.",
    }),
    shippingZone: z.enum(CHECKOUT_SHIPPING_ZONES, {
      error: "Elige una zona de entrega.",
    }),
    couponCode: z.string().trim().max(50).optional(),
    idempotencyKey: z.string().trim().min(4).max(64),
  })
  .superRefine((values, context) => {
    if (values.shippingMethod === "pickup") return;

    if (values.city.length < 2) {
      context.addIssue({
        code: "custom",
        path: ["city"],
        message: "Indica tu ciudad.",
      });
    }

    if (values.address.length < 5) {
      context.addIssue({
        code: "custom",
        path: ["address"],
        message: "Indica tu dirección de entrega.",
      });
    }
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;
