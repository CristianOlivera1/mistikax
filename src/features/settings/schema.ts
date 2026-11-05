import { z } from "zod";

export const generalSettingsSchema = z.object({
  storeName: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(80, "El nombre no debe superar los 80 caracteres."),
  description: z
    .string()
    .trim()
    .max(240, "La descripción no debe superar los 240 caracteres."),
  contactEmail: z.email("Escribe un correo válido."),
  whatsapp: z
    .string()
    .trim()
    .min(6, "Escribe el número con código de país.")
    .max(20, "El número es demasiado largo.")
    .regex(/^[0-9+\s-]+$/, "Usa solo números, espacios, + o guiones."),
  address: z
    .string()
    .trim()
    .min(3, "La dirección debe tener al menos 3 caracteres.")
    .max(160, "La dirección no debe superar los 160 caracteres."),
  stockThreshold: z
    .number()
    .int("Usa una cantidad entera.")
    .min(1, "El umbral debe ser al menos 1.")
    .max(100, "El umbral no debe superar 100."),
});

export type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;

export const shippingSettingsSchema = z.object({
  shippingCost: z
    .number()
    .min(0, "El costo no puede ser negativo.")
    .max(1000, "El costo es demasiado alto."),
  freeShippingFrom: z
    .number()
    .min(0, "El monto no puede ser negativo.")
    .max(100000, "El monto es demasiado alto."),
  leadTime: z
    .string()
    .trim()
    .min(2, "Indica un tiempo de preparación.")
    .max(80, "El tiempo no debe superar los 80 caracteres."),
});

export type ShippingSettingsValues = z.infer<typeof shippingSettingsSchema>;

export const paymentSettingsSchema = z
  .object({
    paymentCard: z.boolean(),
    paymentTransfer: z.boolean(),
    paymentCod: z.boolean(),
    paymentWallet: z.boolean(),
    transferInstructions: z
      .string()
      .trim()
      .max(500, "Las instrucciones no deben superar los 500 caracteres."),
  })
  .superRefine((values, context) => {
    if (
      values.paymentTransfer &&
      values.transferInstructions.trim().length < 10
    ) {
      context.addIssue({
        code: "custom",
        path: ["transferInstructions"],
        message: "Escribe las instrucciones para la transferencia.",
      });
    }
  });

export type PaymentSettingsValues = z.infer<typeof paymentSettingsSchema>;

const hexColor = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "Usa un color hexadecimal de 6 dígitos.");

export const appearanceSettingsSchema = z.object({
  primaryColor: hexColor,
  accentColor: hexColor,
});

export type AppearanceSettingsValues = z.infer<typeof appearanceSettingsSchema>;
