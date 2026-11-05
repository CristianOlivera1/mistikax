import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const pageFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "El título debe tener al menos 3 caracteres.")
      .max(120, "El título no debe superar los 120 caracteres."),
    slug: z
      .string()
      .trim()
      .min(3, "El identificador debe tener al menos 3 caracteres.")
      .regex(slugPattern, "Usa minúsculas, números y guiones."),
    body: z
      .string()
      .trim()
      .max(20000, "El contenido no debe superar los 20000 caracteres."),
    seoDescription: z
      .string()
      .trim()
      .max(160, "La descripción SEO no debe superar los 160 caracteres."),
    status: z.enum(["published", "draft"], {
      error: "Selecciona un estado.",
    }),
  })
  .superRefine((values, context) => {
    if (values.status === "published" && values.body.length < 10) {
      context.addIssue({
        code: "custom",
        path: ["body"],
        message: "Una página publicada necesita contenido.",
      });
    }
  });

export type PageFormValues = z.infer<typeof pageFormSchema>;

export const homeContentSchema = z
  .object({
    announcement: z.object({
      visible: z.boolean(),
      text: z
        .string()
        .trim()
        .max(160, "El anuncio no debe superar los 160 caracteres."),
    }),
    hero: z.object({
      title: z
        .string()
        .trim()
        .min(2, "El título debe tener al menos 2 caracteres.")
        .max(80, "El título no debe superar los 80 caracteres."),
      subtitle: z
        .string()
        .trim()
        .min(2, "El subtítulo debe tener al menos 2 caracteres.")
        .max(300, "El subtítulo no debe superar los 300 caracteres."),
      cta: z
        .string()
        .trim()
        .min(2, "El texto del botón debe tener al menos 2 caracteres.")
        .max(40, "El texto del botón no debe superar los 40 caracteres."),
      link: z
        .string()
        .trim()
        .min(1, "El enlace es obligatorio.")
        .max(200, "El enlace no debe superar los 200 caracteres."),
      image: z.string().min(1, "Selecciona una imagen."),
    }),
    sections: z
      .array(
        z.object({
          id: z.string().min(1),
          label: z.string().min(1).max(60),
          visible: z.boolean(),
        }),
      )
      .min(1, "La portada debe tener al menos una sección."),
  })
  .superRefine((values, context) => {
    if (values.announcement.visible && values.announcement.text.length < 3) {
      context.addIssue({
        code: "custom",
        path: ["announcement", "text"],
        message: "Escribe el texto que verá el cliente.",
      });
    }
  });

export type HomeContentFormValues = z.infer<typeof homeContentSchema>;

export const faqFormSchema = z.object({
  question: z
    .string()
    .trim()
    .min(5, "La pregunta debe tener al menos 5 caracteres.")
    .max(200, "La pregunta no debe superar los 200 caracteres."),
  answer: z
    .string()
    .trim()
    .min(5, "La respuesta debe tener al menos 5 caracteres.")
    .max(2000, "La respuesta no debe superar los 2000 caracteres."),
});

export type FaqFormValues = z.infer<typeof faqFormSchema>;
