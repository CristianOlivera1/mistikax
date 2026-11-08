import "server-only";

import { and, asc, desc, eq, ilike, inArray, ne, or, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  colors,
  productColors,
  productImages,
  productStock,
  products,
} from "@/db/schema";
import type { AgeGroup, ProductStatus } from "@/lib/constants";
import { LOW_STOCK_THRESHOLD, PRODUCTS_PAGE_SIZE } from "./constants";
import type {
  CatalogCategory,
  CatalogColor,
  CatalogProduct,
  CategoryWithCount,
  InventoryFilters,
  InventoryRow,
  InventoryStatusFilter,
  InventorySummary,
  ProductFilters,
  ProductPage,
  StockStatus,
} from "./types";

type ProductRow = typeof products.$inferSelect;
type StockRow = typeof productStock.$inferSelect;
type ColorRelationRow = typeof productColors.$inferSelect;
type ImageRow = typeof productImages.$inferSelect;

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function isAgeGroup(value: string): value is AgeGroup {
  return value === "kids" || value === "teens" || value === "adults";
}

function isProductStatus(value: string): value is ProductStatus {
  return (
    value === "active" || value === "draft" || value === "archived"
  );
}

function isInventoryStatus(value: string): value is InventoryStatusFilter {
  return value === "all" || value === "low" || value === "out";
}

export function parseProductFilters(
  params: Record<string, string | string[] | undefined>,
): ProductFilters {
  const pageValue = Number.parseInt(first(params.page), 10);

  return {
    query: first(params.q).trim(),
    categoryId:
      first(params.category).trim() === "__all__"
        ? ""
        : first(params.category).trim(),
    ageGroup: isAgeGroup(first(params.age)) ? (first(params.age) as AgeGroup) : "",
    status: isProductStatus(first(params.status))
      ? (first(params.status) as ProductStatus)
      : "",
    page: Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1,
  };
}

export function parseInventoryFilters(
  params: Record<string, string | string[] | undefined>,
): InventoryFilters {
  const statusValue = first(params.status);

  return {
    query: first(params.q).trim(),
    status: isInventoryStatus(statusValue) ? statusValue : "all",
  };
}

function toCatalogProduct(
  row: ProductRow,
  stockRows: StockRow[],
  colorRows: ColorRelationRow[],
  imageRows: ImageRow[],
): CatalogProduct {
  const stock = Object.fromEntries(
    stockRows
      .filter((stockRow) => stockRow.productId === row.id)
      .map((stockRow) => [stockRow.size, stockRow.quantity]),
  );
  const colorIds = colorRows
    .filter((colorRow) => colorRow.productId === row.id)
    .map((colorRow) => colorRow.colorId);
  const images = imageRows
    .filter((imageRow) => imageRow.productId === row.id)
    .sort((a, b) => a.position - b.position)
    .map((imageRow) => imageRow.path);

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    seoDescription: row.seoDescription,
    categoryId: row.categoryId,
    ageGroup: row.ageGroup,
    status: row.status,
    priceCents: row.priceCents,
    compareAtCents: row.compareAtCents,
    isNew: row.isNew,
    isBestSeller: row.isBestSeller,
    soldCount: row.soldCount,
    stock,
    colorIds,
    images,
  };
}

async function loadProducts(where?: SQL): Promise<CatalogProduct[]> {
  const rows = await db
    .select()
    .from(products)
    .where(where)
    .orderBy(desc(products.createdAt), asc(products.id));

  if (rows.length === 0) return [];

  const ids = rows.map((row) => row.id);
  const [stockRows, colorRows, imageRows] = await Promise.all([
    db
      .select()
      .from(productStock)
      .where(inArray(productStock.productId, ids)),
    db
      .select()
      .from(productColors)
      .where(inArray(productColors.productId, ids)),
    db
      .select()
      .from(productImages)
      .where(inArray(productImages.productId, ids)),
  ]);

  return rows.map((row) =>
    toCatalogProduct(row, stockRows, colorRows, imageRows),
  );
}

export function getStockTotal(product: CatalogProduct): number {
  return Object.values(product.stock).reduce(
    (total, quantity) => total + quantity,
    0,
  );
}

export function getStockStatus(product: CatalogProduct): StockStatus {
  const sizeCount = Object.keys(product.stock).length || 1;
  const total = getStockTotal(product);

  if (total === 0) return "out";
  if (total <= LOW_STOCK_THRESHOLD * sizeCount) return "low";
  return "ok";
}

function catalogWhere(filters: ProductFilters): SQL | undefined {
  const conditions = [];

  if (filters.query) {
    const pattern = `%${filters.query}%`;
    conditions.push(
      or(ilike(products.name, pattern), ilike(products.id, pattern)),
    );
  }
  if (filters.categoryId) {
    conditions.push(eq(products.categoryId, filters.categoryId));
  }
  if (filters.ageGroup) {
    conditions.push(eq(products.ageGroup, filters.ageGroup));
  }
  if (filters.status) {
    conditions.push(eq(products.status, filters.status));
  }

  return conditions.length ? and(...conditions) : undefined;
}

export async function getProductPage(
  filters: ProductFilters,
): Promise<ProductPage> {
  const filtered = await loadProducts(catalogWhere(filters));
  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / PRODUCTS_PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);
  const start = (page - 1) * PRODUCTS_PAGE_SIZE;

  return {
    items: filtered.slice(start, start + PRODUCTS_PAGE_SIZE),
    total,
    page,
    pageCount,
    pageSize: PRODUCTS_PAGE_SIZE,
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + PRODUCTS_PAGE_SIZE, total),
  };
}

export async function getProductById(
  id: string,
): Promise<CatalogProduct | undefined> {
  const [product] = await loadProducts(eq(products.id, id));
  return product;
}

export async function getCategories(): Promise<CatalogCategory[]> {
  return db
    .select({ id: categories.id, name: categories.name, sizeType: categories.sizeType })
    .from(categories)
    .orderBy(asc(categories.name));
}

export async function getCategoryById(
  id: string,
): Promise<CatalogCategory | undefined> {
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);
  return category;
}

export async function getColors(): Promise<CatalogColor[]> {
  return db
    .select({ id: colors.id, name: colors.name, hex: colors.hex })
    .from(colors)
    .orderBy(asc(colors.name));
}

export async function getCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      sizeType: categories.sizeType,
      productCount: sql<number>`count(distinct ${products.id})::int`,
      stockTotal: sql<number>`coalesce(sum(${productStock.quantity}), 0)::int`,
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .leftJoin(productStock, eq(productStock.productId, products.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.name));
}

export async function getInventoryRows(
  filters: InventoryFilters,
): Promise<InventoryRow[]> {
  const query = filters.query.toLowerCase();
  const [allProducts, categoryList] = await Promise.all([
    loadProducts(ne(products.status, "archived")),
    getCategories(),
  ]);
  const categoryById = new Map(categoryList.map((category) => [category.id, category]));

  return allProducts
    .map((product) => {
      const category = categoryById.get(product.categoryId);

      if (!category) return null;

      const sizes = Object.entries(product.stock).map(([size, quantity]) => ({
        size,
        quantity,
      }));

      return {
        product,
        category,
        sizes,
        total: getStockTotal(product),
        status: getStockStatus(product),
      };
    })
    .filter((row): row is InventoryRow => row !== null)
    .filter((row) => {
      const matchesQuery =
        !query ||
        `${row.product.name} ${row.product.id} ${row.category.name}`
          .toLowerCase()
          .includes(query);
      const matchesStatus =
        filters.status === "all" || row.status === filters.status;

      return matchesQuery && matchesStatus;
    });
}

export async function getInventorySummary(): Promise<InventorySummary> {
  const activeProducts = await loadProducts(ne(products.status, "archived"));

  return {
    products: activeProducts.length,
    lowStock: activeProducts.filter(
      (product) => getStockStatus(product) === "low",
    ).length,
    outOfStock: activeProducts.filter(
      (product) => getStockStatus(product) === "out",
    ).length,
    units: activeProducts.reduce(
      (total, product) => total + getStockTotal(product),
      0,
    ),
  };
}
