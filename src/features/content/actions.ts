"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { asc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { faqs, homeContent, homeSections, pages } from "@/db/schema";
import { requireRole } from "@/features/auth/queries";
import { normalizeHomeLink } from "./normalize-home-link";
import {
  faqFormSchema,
  homeContentSchema,
  pageFormSchema,
  type FaqFormValues,
  type HomeContentFormValues,
  type PageFormValues,
} from "./schema";

type ContentActionResult =
  | { status: "success" }
  | { status: "error"; message: string };

const pageIdSchema = z
  .string()
  .trim()
  .min(3)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Identificador de página no válido.");

const faqIdSchema = z.string().trim().min(1).max(64);

function zodMessage(error: z.ZodError | undefined): string {
  return error?.issues[0]?.message ?? "Datos inválidos.";
}

function revalidateStoreContent() {
  revalidatePath("/");
  revalidatePath("/faq");
}

function revalidatePages() {
  revalidatePath("/admin/content/pages");
  revalidatePath("/pages/[slug]", "page");
  revalidateStoreContent();
}

function revalidateFaqs() {
  revalidatePath("/admin/content/faqs");
  revalidateStoreContent();
}

export async function updateHomeContentAction(
  rawValues: HomeContentFormValues,
): Promise<ContentActionResult> {
  await requireRole("admin", "editor");

  const parsed = homeContentSchema.safeParse(rawValues);

  if (!parsed.success) {
    return { status: "error", message: zodMessage(parsed.error) };
  }

  const data = parsed.data;
  const heroLink = normalizeHomeLink(data.hero.link);

  try {
    await db.transaction(async (tx) => {
      await tx
        .insert(homeContent)
        .values({
          id: 1,
          announcementEnabled: data.announcement.visible,
          announcementText: data.announcement.text,
          heroTitle: data.hero.title,
          heroSubtitle: data.hero.subtitle,
          heroCta: data.hero.cta,
          heroLink,
          heroImage: data.hero.image,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: homeContent.id,
          set: {
            announcementEnabled: data.announcement.visible,
            announcementText: data.announcement.text,
            heroTitle: data.hero.title,
            heroSubtitle: data.hero.subtitle,
            heroCta: data.hero.cta,
            heroLink,
            heroImage: data.hero.image,
            updatedAt: new Date(),
          },
        });
      await tx.delete(homeSections);
      await tx.insert(homeSections).values(
        data.sections.map((section, index) => ({
          id: section.id,
          label: section.label,
          enabled: section.visible,
          position: index,
        })),
      );
    });
  } catch {
    return { status: "error", message: "No se pudo guardar la portada." };
  }

  revalidatePath("/");
  revalidatePath("/admin/content/home");
  revalidatePath("/admin");

  return { status: "success" };
}

async function buildPageId(slug: string): Promise<string> {
  const reserved = new Set(["new"]);
  let candidate = reserved.has(slug) ? `${slug}-pagina` : slug;
  let suffix = 2;

  for (;;) {
    const [existing] = await db
      .select({ id: pages.id })
      .from(pages)
      .where(eq(pages.id, candidate))
      .limit(1);

    if (!existing) return candidate;

    candidate = `${slug}-${suffix}`;
    suffix += 1;
  }
}

export async function createPageAction(
  rawValues: PageFormValues,
): Promise<ContentActionResult> {
  await requireRole("admin", "editor");

  const parsed = pageFormSchema.safeParse(rawValues);

  if (!parsed.success) {
    return { status: "error", message: zodMessage(parsed.error) };
  }

  const data = parsed.data;
  const id = await buildPageId(data.slug);

  try {
    await db.insert(pages).values({
      id,
      title: data.title,
      body: data.body,
      seoDescription: data.seoDescription,
      status: data.status,
    });
  } catch {
    return { status: "error", message: "No se pudo crear la página." };
  }

  revalidatePages();

  return { status: "success" };
}

export async function updatePageAction(
  rawId: string,
  rawValues: PageFormValues,
): Promise<ContentActionResult> {
  await requireRole("admin", "editor");

  const parsedId = pageIdSchema.safeParse(rawId);
  const parsed = pageFormSchema.safeParse(rawValues);

  if (!parsedId.success || !parsed.success) {
    return { status: "error", message: zodMessage(parsed.error ?? parsedId.error) };
  }


  const data = parsed.data;

  try {
    const rows = await db
      .update(pages)
      .set({
        title: data.title,
        body: data.body,
        seoDescription: data.seoDescription,
        status: data.status,
        updatedAt: new Date(),
      })
      .where(eq(pages.id, parsedId.data))
      .returning({ id: pages.id });

    if (rows.length === 0) {
      return { status: "error", message: "La página no existe." };
    }
  } catch {
    return { status: "error", message: "No se pudo actualizar la página." };
  }

  revalidatePages();

  return { status: "success" };
}

export async function deletePageAction(
  rawId: string,
): Promise<ContentActionResult> {
  await requireRole("admin", "editor");

  const parsed = pageIdSchema.safeParse(rawId);

  if (!parsed.success) {
    return { status: "error", message: "Página no válida." };
  }

  try {
    await db.delete(pages).where(eq(pages.id, parsed.data));
  } catch {
    return { status: "error", message: "No se pudo eliminar la página." };
  }

  revalidatePages();

  return { status: "success" };
}

async function nextFaqPosition(): Promise<number> {
  const [row] = await db
    .select({ value: sql<number | null>`max(${faqs.position})` })
    .from(faqs);

  return (row?.value ?? -1) + 1;
}

export async function createFaqAction(
  rawValues: FaqFormValues,
): Promise<ContentActionResult> {
  await requireRole("admin", "editor");

  const parsed = faqFormSchema.safeParse(rawValues);

  if (!parsed.success) {
    return { status: "error", message: zodMessage(parsed.error) };
  }

  const data = parsed.data;
  const position = await nextFaqPosition();

  try {
    await db.insert(faqs).values({
      id: `faq-${randomUUID().slice(0, 8)}`,
      question: data.question,
      answer: data.answer,
      position,
    });
  } catch {
    return { status: "error", message: "No se pudo crear la pregunta." };
  }

  revalidateFaqs();

  return { status: "success" };
}

export async function updateFaqAction(
  rawId: string,
  rawValues: FaqFormValues,
): Promise<ContentActionResult> {
  await requireRole("admin", "editor");

  const parsedId = faqIdSchema.safeParse(rawId);
  const parsed = faqFormSchema.safeParse(rawValues);

  if (!parsedId.success || !parsed.success) {
    return { status: "error", message: zodMessage(parsed.error ?? parsedId.error) };
  }


  const data = parsed.data;

  try {
    const rows = await db
      .update(faqs)
      .set({ question: data.question, answer: data.answer })
      .where(eq(faqs.id, parsedId.data))
      .returning({ id: faqs.id });

    if (rows.length === 0) {
      return { status: "error", message: "La pregunta no existe." };
    }
  } catch {
    return { status: "error", message: "No se pudo actualizar la pregunta." };
  }

  revalidateFaqs();

  return { status: "success" };
}

export async function deleteFaqAction(
  rawId: string,
): Promise<ContentActionResult> {
  await requireRole("admin", "editor");

  const parsed = faqIdSchema.safeParse(rawId);

  if (!parsed.success) {
    return { status: "error", message: "Pregunta no válida." };
  }

  try {
    await db.delete(faqs).where(eq(faqs.id, parsed.data));
  } catch {
    return { status: "error", message: "No se pudo eliminar la pregunta." };
  }

  revalidateFaqs();

  return { status: "success" };
}

export async function moveFaqAction(
  rawId: string,
  direction: "up" | "down",
): Promise<ContentActionResult> {
  await requireRole("admin", "editor");

  const parsed = faqIdSchema.safeParse(rawId);

  if (!parsed.success) {
    return { status: "error", message: "Pregunta no válida." };
  }

  try {
    await db.transaction(async (tx) => {
      const rows = await tx
        .select({ id: faqs.id })
        .from(faqs)
        .orderBy(asc(faqs.position));
      const index = rows.findIndex((row) => row.id === parsed.data);
      const neighborIndex = direction === "up" ? index - 1 : index + 1;

      if (index === -1 || neighborIndex < 0 || neighborIndex >= rows.length) {
        throw new Error("La pregunta no se puede mover.");
      }

      const current = rows[index];
      const neighbor = rows[neighborIndex];

      await tx
        .update(faqs)
        .set({ position: neighborIndex })
        .where(eq(faqs.id, current.id));
      await tx
        .update(faqs)
        .set({ position: index })
        .where(eq(faqs.id, neighbor.id));
    });
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo reordenar la pregunta.",
    };
  }

  revalidateFaqs();

  return { status: "success" };
}
