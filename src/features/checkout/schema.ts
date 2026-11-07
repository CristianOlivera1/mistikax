import { z } from "zod";

export const CHECKOUT_PAYMENT_METHODS = {
  transfer: "Transferencia bancaria",
  cod: "Pago contra entrega",
} as const;

export type CheckoutPaymentMethod = keyof typeof CHECKOUT_PAYMENT_METHODS;

export const checkoutSchema = z.object({
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
  city: z.string().trim().min(2, "Indica tu ciudad.").max(80),
  address: z.string().trim().min(5, "Indica tu dirección.").max(200),
  note: z.string().trim().max(500, "La nota no debe superar 500 caracteres."),
  paymentMethod: z.enum(["transfer", "cod"]),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
