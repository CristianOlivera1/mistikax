import { z } from "zod";

export const couponFormSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(4, "El código debe tener al menos 4 caracteres.")
      .max(24, "El código no debe superar los 24 caracteres.")
      .regex(
        /^[A-Z0-9]+(?:[-_][A-Z0-9]+)*$/,
        "Usa mayúsculas, números y guiones.",
      ),
    kind: z.enum(["percent", "fixed"], {
      error: "Selecciona un tipo de descuento.",
    }),
    value: z
      .number()
      .positive("El descuento debe ser mayor que cero.")
      .max(1000, "El descuento es demasiado alto."),
    expiresAt: z
      .string()
      .min(1, "Selecciona una fecha de vencimiento.")
      .refine(
        (value) => !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)),
        "Selecciona una fecha válida.",
      ),
    active: z.boolean(),
  })
  .superRefine((values, context) => {
    if (
      values.kind === "percent" &&
      (!Number.isInteger(values.value) || values.value > 90)
    ) {
      context.addIssue({
        code: "custom",
        path: ["value"],
        message: "El porcentaje debe ser un entero entre 1 y 90.",
      });
    }
  });

export type CouponFormValues = z.infer<typeof couponFormSchema>;
