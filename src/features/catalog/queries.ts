import "server-only";

import {
  AGE_GROUPS,
  PRODUCT_STATUSES,
  type AgeGroup,
  type ProductStatus,
} from "@/lib/constants";
import { LOW_STOCK_THRESHOLD, PRODUCTS_PAGE_SIZE, getSizes } from "./constants";
import { CATEGORIES, COLORS, IMAGE_LIBRARY, PRODUCTS } from "./fixtures";
import type {
  CatalogCategory,
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

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function isAgeGroup(value: string): value is AgeGroup {
  return value in AGE_GROUPS;
}

function isProductStatus(value: string): value is ProductStatus {
  return value in PRODUCT_STATUSES;
}

function isInventoryStatus(value: string): value is InventoryStatusFilter {
  return value === "all" || value === "low" || value === "out";
}

export function parseProductFilters(
  params: Record<string, string | string[] | undefined>,
): ProductFilters {
  const categoryValue = first(params.category);
  const ageValue = first(params.age);
  const statusValue = first(params.status);
  const pageValue = Number.parseInt(first(params.page), 10);

  return {
    query: first(params.q).trim(),
    categoryId: CATEGORIES.some((category) => category.id === categoryValue)
      ? categoryValue
      : "",
    ageGroup: isAgeGroup(ageValue) ? ageValue : "",
    status: isProductStatus(statusValue) ? statusValue : "",
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

export function getProductById(id: string): CatalogProduct | undefined {
  return PRODUCTS.find((product) => product.id === id);
}

export function getCategoryById(id: string): CatalogCategory | undefined {
  return CATEGORIES.find((category) => category.id === id);
}

export function getCategories(): CatalogCategory[] {
  return CATEGORIES;
}

export function getColors() {
  return COLORS;
}

export function getCatalogImageLibrary(): string[] {
  return [...IMAGE_LIBRARY];
}

export function getStockTotal(product: CatalogProduct): number {
  return Object.values(product.stock).reduce(
    (total, quantity) => total + quantity,
    0,
  );
}

export function getStockStatus(product: CatalogProduct): StockStatus {
  const category = getCategoryById(product.categoryId);
  const sizeCount = category
    ? getSizes(category.sizeType, product.ageGroup).length
    : Object.keys(product.stock).length;
  const total = getStockTotal(product);

  if (total === 0) return "out";
  if (total <= LOW_STOCK_THRESHOLD * sizeCount) return "low";
  return "ok";
}

export function getProductPage(filters: ProductFilters): ProductPage {
  const query = filters.query.toLowerCase();

  const filtered = PRODUCTS.filter((product) => {
    const matchesQuery =
      !query || `${product.name} ${product.id}`.toLowerCase().includes(query);
    const matchesCategory =
      !filters.categoryId || product.categoryId === filters.categoryId;
    const matchesAge =
      !filters.ageGroup || product.ageGroup === filters.ageGroup;
    const matchesStatus = !filters.status || product.status === filters.status;

    return matchesQuery && matchesCategory && matchesAge && matchesStatus;
  });

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / PRODUCTS_PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);
  const start = (page - 1) * PRODUCTS_PAGE_SIZE;
  const items = filtered.slice(start, start + PRODUCTS_PAGE_SIZE);

  return {
    items,
    total,
    page,
    pageCount,
    pageSize: PRODUCTS_PAGE_SIZE,
    from: total === 0 ? 0 : start + 1,
    to: Math.min(start + PRODUCTS_PAGE_SIZE, total),
  };
}

export function getCategoriesWithCounts(): CategoryWithCount[] {
  return CATEGORIES.map((category) => {
    const products = PRODUCTS.filter(
      (product) => product.categoryId === category.id,
    );

    return {
      ...category,
      productCount: products.length,
      stockTotal: products.reduce(
        (total, product) => total + getStockTotal(product),
        0,
      ),
    };
  });
}

export function getInventoryRows(filters: InventoryFilters): InventoryRow[] {
  const query = filters.query.toLowerCase();

  return PRODUCTS.filter((product) => product.status !== "archived")
    .map((product) => {
      const category = getCategoryById(product.categoryId);
      const sizes = category
        ? getSizes(category.sizeType, product.ageGroup).map((size) => ({
            size,
            quantity: product.stock[size] ?? 0,
          }))
        : [];

      return {
        product,
        category: category ?? {
          id: product.categoryId,
          name: product.categoryId,
          sizeType: "one_size",
        },
        sizes,
        total: getStockTotal(product),
        status: getStockStatus(product),
      };
    })
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

export function getInventorySummary(): InventorySummary {
  const activeProducts = PRODUCTS.filter(
    (product) => product.status !== "archived",
  );

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
