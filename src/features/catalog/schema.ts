import { z } from "zod";

export const productFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres.")
    .max(120, "El nombre no debe superar los 120 caracteres."),
  slug: z
    .string()
    .trim()
    .min(3, "El identificador debe tener al menos 3 caracteres.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usa minúsculas, números y guiones."),
  description: z
    .string()
    .trim()
    .max(2000, "La descripción no debe superar los 2000 caracteres."),
  seoDescription: z
    .string()
    .trim()
    .max(160, "La descripción SEO no debe superar los 160 caracteres."),
  categoryId: z.string().min(1, "Selecciona una categoría."),
  ageGroup: z.enum(["kids", "teens", "adults"], {
    error: "Selecciona una edad.",
  }),
  status: z.enum(["active", "draft", "archived"], {
    error: "Selecciona un estado.",
  }),
  price: z
    .number()
    .min(0.01, "El precio debe ser mayor que cero.")
    .max(100000, "El precio es demasiado alto."),
  compareAt: z
    .number()
    .min(0, "El precio anterior no puede ser negativo.")
    .optional(),
  isNew: z.boolean(),
  isBestSeller: z.boolean(),
  colorIds: z.array(z.string()).min(1, "Selecciona al menos un color."),
  stock: z
    .array(
      z.object({
        size: z.string().min(1),
        quantity: z
          .number()
          .int("Usa una cantidad entera.")
          .min(0, "El stock no puede ser negativo."),
        originalQuantity: z.number().int().min(0),
      }),
    )
    .min(1, "La categoría debe tener al menos una talla."),
  images: z.array(z.string().min(1)).min(1, "Añade al menos una imagen."),
})
  .superRefine((values, context) => {
    if (new Set(values.stock.map((item) => item.size)).size !== values.stock.length) {
      context.addIssue({
        code: "custom",
        path: ["stock"],
        message: "Hay tallas duplicadas en el inventario.",
      });
    }

    if (new Set(values.colorIds).size !== values.colorIds.length) {
      context.addIssue({
        code: "custom",
        path: ["colorIds"],
        message: "Hay colores duplicados.",
      });
    }

    if (new Set(values.images).size !== values.images.length) {
      context.addIssue({
        code: "custom",
        path: ["images"],
        message: "Hay imágenes duplicadas.",
      });
    }
  });

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(60, "El nombre no debe superar los 60 caracteres."),
  sizeType: z.enum(["clothing", "footwear", "one_size"], {
    error: "Selecciona un tipo de talla.",
  }),
});

export type CategoryValues = z.infer<typeof categorySchema>;
