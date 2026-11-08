import { z } from "zod";

export const customerEmailSchema = z.email("Ingresa un correo válido.");

export const customerSignInSchema = z.object({
  email: customerEmailSchema,
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
});

export const customerSignUpSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Ingresa tu nombre.")
    .max(80, "El nombre es demasiado largo."),
  email: customerEmailSchema,
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
});

export type CustomerSignInValues = z.infer<typeof customerSignInSchema>;
export type CustomerSignUpValues = z.infer<typeof customerSignUpSchema>;
