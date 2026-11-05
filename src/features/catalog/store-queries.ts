import "server-only";

import { asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  colors,
  productColors,
  productImages,
  products,
  productStock,
} from "@/db/schema";
import type { AgeGroup } from "@/lib/constants";

export const STORE_AGE_ORDER: AgeGroup[] = ["kids", "teens", "adults"];

export type StoreProductColor = {
  id: string;
  name: string;
  hex: string;
};

export type StoreProduct = {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  ageGroup: AgeGroup;
  priceCents: number;
  compareAtCents: number | null;
  isNew: boolean;
  isBestSeller: boolean;
  soldCount: number;
  colors: StoreProductColor[];
  images: string[];
  stockTotal: number;
};

export type StoreCategoryCard = {
  id: string;
  name: string;
  productCount: number;
  showcaseImage: string | null;
};

function isPublishable(product: StoreProduct): boolean {
  return product.images.length > 0 && product.stockTotal > 0;
}

async function loadStoreProducts(
  orderBy: "featured" | "created",
): Promise<StoreProduct[]> {
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      categoryId: products.categoryId,
      categoryName: categories.name,
      ageGroup: products.ageGroup,
      priceCents: products.priceCents,
      compareAtCents: products.compareAtCents,
      isNew: products.isNew,
      isBestSeller: products.isBestSeller,
      soldCount: products.soldCount,
    })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .where(eq(products.status, "active"))
    .orderBy(
      orderBy === "featured"
        ? desc(products.soldCount)
        : desc(products.createdAt),
      asc(products.id),
    );

  if (rows.length === 0) return [];

  const ids = rows.map((row) => row.id);

  const [stockRows, colorRows, colorList, imageRows] = await Promise.all([
    db.select().from(productStock).where(inArray(productStock.productId, ids)),
    db
      .select()
      .from(productColors)
      .where(inArray(productColors.productId, ids)),
    db.select().from(colors),
    db
      .select()
      .from(productImages)
      .where(inArray(productImages.productId, ids)),
  ]);

  const stockByProduct = new Map<string, number>();
  for (const row of stockRows) {
    stockByProduct.set(
      row.productId,
      (stockByProduct.get(row.productId) ?? 0) + row.quantity,
    );
  }

  const colorsById = new Map(
    colorList.map((color) => [
      color.id,
      { id: color.id, name: color.name, hex: color.hex },
    ]),
  );
  const imagesByProduct = new Map<string, string[]>();
  for (const row of [...imageRows].sort((a, b) => a.position - b.position)) {
    const list = imagesByProduct.get(row.productId) ?? [];
    list.push(row.path);
    imagesByProduct.set(row.productId, list);
  }

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    ageGroup: row.ageGroup,
    priceCents: row.priceCents,
    compareAtCents: row.compareAtCents,
    isNew: row.isNew,
    isBestSeller: row.isBestSeller,
    soldCount: row.soldCount,
    colors: colorRows
      .filter((relation) => relation.productId === row.id)
      .flatMap((relation) => {
        const color = colorsById.get(relation.colorId);
        return color ? [color] : [];
      }),
    images: imagesByProduct.get(row.id) ?? [],
    stockTotal: stockByProduct.get(row.id) ?? 0,
  }));
}

async function loadPublishableProducts(
  orderBy: "featured" | "created",
): Promise<StoreProduct[]> {
  const productsList = await loadStoreProducts(orderBy);
  return productsList.filter(isPublishable);
}

export async function getStoreBestSellers(limit = 4): Promise<StoreProduct[]> {
  const all = await loadPublishableProducts("featured");
  const flags = all.filter((product) => product.isBestSeller);
  const rest = all.filter((product) => !product.isBestSeller);
  return [...flags, ...rest.slice(0, Math.max(0, limit - flags.length))].slice(
    0,
    limit,
  );
}

export async function getStoreNewArrivals(limit = 4): Promise<StoreProduct[]> {
  const all = await loadPublishableProducts("created");
  return all.filter((product) => product.isNew).slice(0, limit);
}

export async function getStoreTopSellingByAge(): Promise<
  Partial<Record<AgeGroup, StoreProduct>>
> {
  const all = await loadPublishableProducts("featured");

  return Object.fromEntries(
    STORE_AGE_ORDER.map((age) => [
      age,
      all.find((product) => product.ageGroup === age),
    ]),
  );
}

export async function getStoreCategoryShowcase(
  limit = 7,
): Promise<StoreCategoryCard[]> {
  const all = await loadPublishableProducts("featured");
  const categoryRows = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .orderBy(asc(categories.createdAt), asc(categories.id));

  return categoryRows
    .map((category) => {
      const inCategory = all.filter(
        (product) => product.categoryId === category.id,
      );
      const showcase = inCategory[0];

      return {
        id: category.id,
        name: category.name,
        productCount: inCategory.length,
        showcaseImage: showcase?.images[0] ?? null,
      };
    })
    .filter((category) => category.productCount > 0)
    .slice(0, limit);
}

export async function getStoreActiveCategoryNames(): Promise<
  Array<{ id: string; name: string }>
> {
  const rows = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .orderBy(asc(categories.createdAt), asc(categories.id));

  return rows;
}
