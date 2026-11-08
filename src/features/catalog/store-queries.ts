import "server-only";

import { asc, desc, eq, inArray } from "drizzle-orm";
import { cache } from "react";
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

export const STORE_PAGE_SIZE = 24;

export type StoreSort = "featured" | "new" | "price-asc" | "price-desc";

export const STORE_SORTS: Array<{ value: StoreSort; label: string }> = [
  { value: "featured", label: "Destacados" },
  { value: "new", label: "Novedades" },
  { value: "price-asc", label: "Menor precio" },
  { value: "price-desc", label: "Mayor precio" },
];

export type StoreFilters = {
  category: string;
  age: AgeGroup | "";
  size: string;
  maxCents: number | null;
  sale: boolean;
  query: string;
  sort: StoreSort;
  page: number;
};

export type StoreProductColor = {
  id: string;
  name: string;
  hex: string;
};

export type StoreProduct = {
  id: string;
  name: string;
  description: string;
  seoDescription: string;
  categoryId: string;
  categoryName: string;
  ageGroup: AgeGroup;
  priceCents: number;
  compareAtCents: number | null;
  isNew: boolean;
  isBestSeller: boolean;
  soldCount: number;
  createdAt: string;
  colors: StoreProductColor[];
  images: string[];
  stock: Record<string, number>;
  stockTotal: number;
};

export type StoreCategoryCard = {
  id: string;
  name: string;
  productCount: number;
  showcaseImage: string | null;
};

export type StoreCatalogResult = {
  products: StoreProduct[];
  total: number;
  page: number;
  pageCount: number;
  sizeOptions: string[];
};

function isPublishable(product: StoreProduct): boolean {
  return product.images.length > 0 && product.stockTotal > 0;
}

function isAgeGroup(value: string): value is AgeGroup {
  return value === "kids" || value === "teens" || value === "adults";
}

function isSort(value: string): value is StoreSort {
  return STORE_SORTS.some((sort) => sort.value === value);
}

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export function parseStoreFilters(
  params: Record<string, string | string[] | undefined>,
): StoreFilters {
  const pageValue = Number.parseInt(first(params.page), 10);
  const maxValue = Number.parseInt(first(params.max), 10);

  return {
    category: first(params.category).trim().slice(0, 64),
    age: isAgeGroup(first(params.age)) ? (first(params.age) as AgeGroup) : "",
    size: first(params.size).trim().slice(0, 16),
    maxCents:
      Number.isFinite(maxValue) && maxValue > 0
        ? Math.min(maxValue, 1_000_000) * 100
        : null,
    sale: first(params.sale) === "1",
    query: first(params.q).trim().slice(0, 80),
    sort: isSort(first(params.sort)) ? (first(params.sort) as StoreSort) : "featured",
    page:
      Number.isFinite(pageValue) && pageValue > 0
        ? Math.min(pageValue, 500)
        : 1,
  };
}

function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const numberA = Number.parseInt(a, 10);
    const numberB = Number.parseInt(b, 10);

    if (Number.isFinite(numberA) && Number.isFinite(numberB)) {
      return numberA - numberB;
    }

    return a.localeCompare(b, "es");
  });
}

function matchesFilters(product: StoreProduct, filters: StoreFilters): boolean {
  if (filters.category && product.categoryId !== filters.category) return false;
  if (filters.age && product.ageGroup !== filters.age) return false;
  if (filters.size && !((product.stock[filters.size] ?? 0) > 0)) return false;
  if (filters.maxCents !== null && product.priceCents > filters.maxCents) {
    return false;
  }
  if (
    filters.sale &&
    !(
      product.compareAtCents !== null &&
      product.compareAtCents > product.priceCents
    )
  ) {
    return false;
  }
  if (
    filters.query &&
    !`${product.name} ${product.categoryName}`
      .toLowerCase()
      .includes(filters.query.toLowerCase())
  ) {
    return false;
  }

  return true;
}

function sortProducts(
  list: StoreProduct[],
  sort: StoreSort,
): StoreProduct[] {
  const sorted = [...list];

  switch (sort) {
    case "new":
      return sorted.sort(
        (a, b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id),
      );
    case "price-asc":
      return sorted.sort(
        (a, b) => a.priceCents - b.priceCents || a.id.localeCompare(b.id),
      );
    case "price-desc":
      return sorted.sort(
        (a, b) => b.priceCents - a.priceCents || a.id.localeCompare(b.id),
      );
    default:
      return sorted.sort(
        (a, b) =>
          Number(b.isBestSeller) - Number(a.isBestSeller) ||
          b.soldCount - a.soldCount ||
          a.id.localeCompare(b.id),
      );
  }
}

async function loadStoreProductsData(): Promise<StoreProduct[]> {
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      seoDescription: products.seoDescription,
      categoryId: products.categoryId,
      categoryName: categories.name,
      ageGroup: products.ageGroup,
      priceCents: products.priceCents,
      compareAtCents: products.compareAtCents,
      isNew: products.isNew,
      isBestSeller: products.isBestSeller,
      soldCount: products.soldCount,
      createdAt: products.createdAt,
    })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .where(eq(products.status, "active"))
    .orderBy(desc(products.soldCount), asc(products.id));

  if (rows.length === 0) return [];

  const ids = rows.map((row) => row.id);

  const [stockRows, colorRows, colorList, imageRows] = await Promise.all([
    db
      .select()
      .from(productStock)
      .where(inArray(productStock.productId, ids)),
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

  const stockByProduct = new Map<string, Record<string, number>>();
  for (const row of stockRows) {
    const stock = stockByProduct.get(row.productId) ?? {};
    stock[row.size] = row.quantity;
    stockByProduct.set(row.productId, stock);
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

  return rows.map((row) => {
    const stock = stockByProduct.get(row.id) ?? {};
    const stockTotal = Object.values(stock).reduce(
      (total, quantity) => total + quantity,
      0,
    );

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      seoDescription: row.seoDescription,
      categoryId: row.categoryId,
      categoryName: row.categoryName,
      ageGroup: row.ageGroup,
      priceCents: row.priceCents,
      compareAtCents: row.compareAtCents,
      isNew: row.isNew,
      isBestSeller: row.isBestSeller,
      soldCount: row.soldCount,
      createdAt: row.createdAt.toISOString(),
      colors: colorRows
        .filter((relation) => relation.productId === row.id)
        .flatMap((relation) => {
          const color = colorsById.get(relation.colorId);
          return color ? [color] : [];
        }),
      images: imagesByProduct.get(row.id) ?? [],
      stock,
      stockTotal,
    };
  });
}

const loadStoreProducts = cache(loadStoreProductsData);

async function loadPublishableProducts(): Promise<StoreProduct[]> {
  const list = await loadStoreProducts();
  return list.filter(isPublishable);
}

export async function listStoreProducts(
  filters: StoreFilters,
): Promise<StoreCatalogResult> {
  const all = await loadPublishableProducts();
  const filtered = sortProducts(
    all.filter((product) => matchesFilters(product, filters)),
    filters.sort,
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / STORE_PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);
  const start = (page - 1) * STORE_PAGE_SIZE;

  return {
    products: filtered.slice(start, start + STORE_PAGE_SIZE),
    total: filtered.length,
    page,
    pageCount,
    sizeOptions: sortSizes([
      ...new Set(all.flatMap((product) => Object.keys(product.stock))),
    ]),
  };
}

export async function getStoreProduct(
  id: string,
): Promise<StoreProduct | undefined> {
  const all = await loadPublishableProducts();
  return all.find((product) => product.id === id);
}

export async function getStoreProductsByIds(
  ids: string[],
): Promise<StoreProduct[]> {
  if (ids.length === 0) return [];

  const all = await loadPublishableProducts();
  return all.filter((product) => ids.includes(product.id));
}

export async function getStoreRelatedProducts(
  productId: string,
  categoryId: string,
  limit = 4,
): Promise<StoreProduct[]> {
  const all = await loadPublishableProducts();

  return pickBestSellers(
    all.filter(
      (product) =>
        product.categoryId === categoryId && product.id !== productId,
    ),
    limit,
  );
}

export async function getStoreBestSellers(limit = 4): Promise<StoreProduct[]> {
  return pickBestSellers(await loadPublishableProducts(), limit);
}

export async function getStoreNewArrivals(limit = 4): Promise<StoreProduct[]> {
  const all = await loadPublishableProducts();
  return all.filter((product) => product.isNew).slice(0, limit);
}

export async function getStoreTopSellingByAge(): Promise<
  Partial<Record<AgeGroup, StoreProduct>>
> {
  const all = await loadPublishableProducts();

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
  const [all, categoryRows] = await Promise.all([
    loadPublishableProducts(),
    db
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .orderBy(asc(categories.createdAt), asc(categories.id)),
  ]);

  return categoryRows
    .map((category) => {
      const inCategory = all.filter(
        (product) => product.categoryId === category.id,
      );

      return {
        id: category.id,
        name: category.name,
        productCount: inCategory.length,
        showcaseImage: inCategory[0]?.images[0] ?? null,
      };
    })
    .filter((category) => category.productCount > 0)
    .slice(0, limit);
}

export type StoreHomeData = {
  byAge: Partial<Record<AgeGroup, StoreProduct>>;
  categories: StoreCategoryCard[];
  bestSellers: StoreProduct[];
  newArrivals: StoreProduct[];
};

const getStoreCategoryNames = cache(async () =>
  db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .orderBy(asc(categories.createdAt), asc(categories.id)),
);

function pickBestSellers(all: StoreProduct[], limit: number): StoreProduct[] {
  const flagged = all.filter((product) => product.isBestSeller);
  const rest = all.filter((product) => !product.isBestSeller);

  return [...flagged, ...rest.slice(0, Math.max(0, limit - flagged.length))].slice(
    0,
    limit,
  );
}

export async function getStoreHomeData(): Promise<StoreHomeData> {
  const [all, categoryRows] = await Promise.all([
    loadPublishableProducts(),
    getStoreCategoryNames(),
  ]);
  const byAge: Partial<Record<AgeGroup, StoreProduct>> = {};

  for (const age of STORE_AGE_ORDER) {
    byAge[age] = all.find((product) => product.ageGroup === age);
  }

  const categoriesList = categoryRows
    .map((category) => {
      const inCategory = all.filter(
        (product) => product.categoryId === category.id,
      );

      return {
        id: category.id,
        name: category.name,
        productCount: inCategory.length,
        showcaseImage: inCategory[0]?.images[0] ?? null,
      };
    })
    .filter((category) => category.productCount > 0)
    .slice(0, 7);

  return {
    byAge,
    categories: categoriesList,
    bestSellers: pickBestSellers(all, 4),
    newArrivals: all.filter((product) => product.isNew).slice(0, 4),
  };
}

export async function getStoreSitemapProducts(): Promise<
  Array<{ id: string; createdAt: string }>
> {
  const all = await loadPublishableProducts();

  return all.map((product) => ({
    id: product.id,
    createdAt: product.createdAt,
  }));
}

export async function getStoreActiveCategoryNames(): Promise<
  Array<{ id: string; name: string }>
> {
  return getStoreCategoryNames();
}
