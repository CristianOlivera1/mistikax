"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  categories,
  colors,
  productColors,
  productImages,
  productStock,
  products,
} from "@/db/schema";
import { requireRole } from "@/features/auth/queries";
import { slugify } from "@/lib/slug";
import { getSizes } from "./constants";
import {
  categorySchema,
  productFormSchema,
  type CategoryValues,
  type ProductFormValues,
} from "./schema";

type ProductActionResult =
  | { status: "success"; id: string }
  | { status: "error"; message: string };

type CategoryActionResult =
  | { status: "success" }
  | { status: "error"; message: string };

function revalidateCatalog() {
  revalidatePath("/admin/products");
  revalidatePath("/admin/products/new");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
}

function validateSizes(
  data: ProductFormValues,
  sizeType: "clothing" | "footwear" | "one_size",
): string | null {
  const allowed = getSizes(sizeType, data.ageGroup);
  const submitted = data.stock.map((item) => item.size);

  if (
    submitted.length !== allowed.length ||
    new Set(submitted).size !== submitted.length ||
    allowed.some((size) => !submitted.includes(size))
  ) {
    return "Las tallas deben coincidir con la categoría y la edad del producto.";
  }

  return null;
}

async function validateColors(data: ProductFormValues): Promise<boolean> {
  const ids = [...new Set(data.colorIds)];
  const rows = await db
    .select({ id: colors.id })
    .from(colors)
    .where(inArray(colors.id, ids));

  return rows.length === ids.length;
}

function productValuesFrom(data: ProductFormValues) {
  return {
    name: data.name,
    description: data.description,
    seoDescription: data.seoDescription,
    categoryId: data.categoryId,
    ageGroup: data.ageGroup,
    status: data.status,
    priceCents: Math.round(data.price * 100),
    compareAtCents: data.compareAt ? Math.round(data.compareAt * 100) : null,
    isNew: data.isNew,
    isBestSeller: data.isBestSeller,
  };
}

function stockRowsFrom(productId: string, data: ProductFormValues) {
  return data.stock.map((item) => ({
    productId,
    size: item.size,
    quantity: item.quantity,
  }));
}

function colorRowsFrom(productId: string, data: ProductFormValues) {
  return data.colorIds.map((colorId) => ({ productId, colorId }));
}

function imageRowsFrom(productId: string, data: ProductFormValues) {
  return data.images.map((path, position) => ({ productId, path, position }));
}

function actionError(error: z.ZodError): ProductActionResult {
  const message = error.issues[0]?.message ?? "Datos inválidos.";
  return { status: "error", message };
}

async function buildProductId(base: string): Promise<string> {
  const slug = slugify(base) || "product";
  let candidate = slug;
  let suffix = 2;

  for (;;) {
    const existing = await db.query.products.findFirst({
      where: eq(products.id, candidate),
    });

    if (!existing) return candidate;

    candidate = `${slug}-${suffix}`;
    suffix += 1;
  }
}

export async function createProductAction(
  rawValues: ProductFormValues,
): Promise<ProductActionResult> {
  await requireRole("admin", "editor");

  const parsed = productFormSchema.safeParse(rawValues);

  if (!parsed.success) return actionError(parsed.error);

  const data = parsed.data;
  const id = await buildProductId(data.slug || data.name);
  const [category] = await db
    .select({ id: categories.id, sizeType: categories.sizeType })
    .from(categories)
    .where(eq(categories.id, data.categoryId))
    .limit(1);

  if (!category) {
    return { status: "error", message: "La categoría seleccionada no existe." };
  }

  const sizeError = validateSizes(data, category.sizeType);

  if (sizeError) return { status: "error", message: sizeError };

  if (!(await validateColors(data))) {
    return { status: "error", message: "Selecciona colores existentes." };
  }

  try {
    await db.transaction(async (tx) => {
      await tx.insert(products).values({
        id,
        ...productValuesFrom(data),
      });
      await tx.insert(productStock).values(stockRowsFrom(id, data));
      await tx.insert(productColors).values(colorRowsFrom(id, data));
      await tx.insert(productImages).values(imageRowsFrom(id, data));
    });
  } catch {
    return { status: "error", message: "No se pudo crear el producto." };
  }

  revalidateCatalog();

  return { status: "success", id };
}

export async function updateProductAction(
  id: string,
  rawValues: ProductFormValues,
): Promise<ProductActionResult> {
  await requireRole("admin", "editor");

  const parsed = productFormSchema.safeParse(rawValues);

  if (!parsed.success) return actionError(parsed.error);

  const data = parsed.data;

  if (!(await validateColors(data))) {
    return { status: "error", message: "Selecciona colores existentes." };
  }

  try {
    await db.transaction(async (tx) => {
      const [category] = await tx
        .select({ id: categories.id, sizeType: categories.sizeType })
        .from(categories)
        .where(eq(categories.id, data.categoryId))
        .limit(1);

      if (!category) {
        throw new Error("La categoría seleccionada no existe.");
      }

      const sizeError = validateSizes(data, category.sizeType);

      if (sizeError) throw new Error(sizeError);

      const [lockedProduct] = await tx
        .select({ id: products.id })
        .from(products)
        .where(eq(products.id, id))
        .limit(1)
        .for("update");

      if (!lockedProduct) throw new Error("El producto no existe.");

      await tx
        .update(products)
        .set(productValuesFrom(data))
        .where(eq(products.id, id));
      await tx.delete(productColors).where(eq(productColors.productId, id));
      await tx.delete(productImages).where(eq(productImages.productId, id));
      await tx.insert(productColors).values(colorRowsFrom(id, data));
      await tx.insert(productImages).values(imageRowsFrom(id, data));

      const currentStock = await tx
        .select()
        .from(productStock)
        .where(eq(productStock.productId, id));
      const currentBySize = new Map(
        currentStock.map((row) => [row.size, row.quantity]),
      );
      const submittedSizes = new Set(data.stock.map((item) => item.size));

      for (const item of data.stock) {
        const delta = item.quantity - item.originalQuantity;
        const nextQuantity = Math.max(
          0,
          (currentBySize.get(item.size) ?? 0) + delta,
        );

        if (currentBySize.has(item.size)) {
          await tx
            .update(productStock)
            .set({ quantity: nextQuantity })
            .where(
              and(
                eq(productStock.productId, id),
                eq(productStock.size, item.size),
              ),
            );
        } else {
          await tx.insert(productStock).values({
            productId: id,
            size: item.size,
            quantity: nextQuantity,
          });
        }
      }

      for (const row of currentStock) {
        if (!submittedSizes.has(row.size)) {
          await tx
            .delete(productStock)
            .where(
              and(
                eq(productStock.productId, id),
                eq(productStock.size, row.size),
              ),
            );
        }
      }
    });
  } catch {
    return { status: "error", message: "No se pudo guardar el producto." };
  }

  revalidateCatalog();

  return { status: "success", id };
}

export async function archiveProductAction(
  id: string,
): Promise<ProductActionResult> {
  await requireRole("admin", "editor");

  await db
    .update(products)
    .set({ status: "archived" })
    .where(eq(products.id, id));

  revalidateCatalog();

  return { status: "success", id };
}

export async function duplicateProductAction(
  id: string,
): Promise<ProductActionResult> {
  await requireRole("admin", "editor");

  const [source] = await db.select().from(products).where(eq(products.id, id)).limit(1);

  if (!source) {
    return { status: "error", message: "Producto inexistente." };
  }

  const sourceStock = await db
    .select()
    .from(productStock)
    .where(eq(productStock.productId, id));
  const sourceColors = await db
    .select()
    .from(productColors)
    .where(eq(productColors.productId, id));
  const sourceImages = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, id));
  const newId = await buildProductId(`${source.id}-copy`);

  await db.transaction(async (tx) => {
    await tx.insert(products).values({
      id: newId,
      name: source.name,
      description: source.description,
      seoDescription: source.seoDescription,
      categoryId: source.categoryId,
      ageGroup: source.ageGroup,
      status: "draft",
      priceCents: source.priceCents,
      compareAtCents: source.compareAtCents,
      isNew: source.isNew,
      isBestSeller: source.isBestSeller,
      soldCount: 0,
    });
    await tx.insert(productStock).values(
      sourceStock.map((row) => ({
        productId: newId,
        size: row.size,
        quantity: 0,
      })),
    );
    await tx.insert(productColors).values(
      sourceColors.map((row) => ({ productId: newId, colorId: row.colorId })),
    );
    await tx.insert(productImages).values(
      sourceImages.map((row) => ({
        productId: newId,
        path: row.path,
        position: row.position,
      })),
    );
  });

  revalidateCatalog();

  return { status: "success", id: newId };
}

export async function createCategoryAction(
  rawValues: CategoryValues,
): Promise<CategoryActionResult> {
  await requireRole("admin", "editor");

  const parsed = categorySchema.safeParse(rawValues);

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const data = parsed.data;
  const slug = slugify(data.name) || "category";
  let id = slug;
  let suffix = 2;

  for (;;) {
    const existing = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (existing.length === 0) break;

    id = `${slug}-${suffix}`;
    suffix += 1;
  }

  try {
    await db.insert(categories).values({
      id,
      name: data.name,
      sizeType: data.sizeType,
    });
  } catch {
    return { status: "error", message: "No se pudo crear la categoría." };
  }

  revalidateCatalog();

  return { status: "success" };
}

export async function updateCategoryAction(
  id: string,
  rawValues: CategoryValues,
): Promise<CategoryActionResult> {
  await requireRole("admin", "editor");

  const parsed = categorySchema.safeParse(rawValues);

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const data = parsed.data;
  const [current] = await db
    .select({ sizeType: categories.sizeType })
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  if (!current) {
    return { status: "error", message: "La categoría no existe." };
  }

  if (current.sizeType !== data.sizeType) {
    const [used] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.categoryId, id))
      .limit(1);

    if (used) {
      return {
        status: "error",
        message:
          "No puedes cambiar el tipo de talla de una categoría con productos. Crea otra categoría.",
      };
    }
  }

  await db
    .update(categories)
    .set({ name: data.name, sizeType: data.sizeType })
    .where(eq(categories.id, id));

  revalidateCatalog();

  return { status: "success" };
}

export async function deleteCategoryAction(
  id: string,
): Promise<CategoryActionResult> {
  await requireRole("admin", "editor");

  try {
    await db.transaction(async (tx) => {
      const productsInCategory = await tx
        .select({ id: products.id })
        .from(products)
        .where(eq(products.categoryId, id))
        .limit(1);

      if (productsInCategory.length > 0) {
        throw new Error("No se puede eliminar una categoría con productos.");
      }

      await tx.delete(categories).where(eq(categories.id, id));
    });
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la categoría.",
    };
  }

  revalidateCatalog();

  return { status: "success" };
}
