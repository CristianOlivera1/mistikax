import type { AgeGroup, ProductStatus } from "@/lib/constants";
import type { SizeType } from "./constants";

export type CatalogCategory = {
  id: string;
  name: string;
  sizeType: SizeType;
};

export type CatalogColor = {
  id: string;
  name: string;
  hex: string;
};

export type CatalogProduct = {
  id: string;
  name: string;
  description: string;
  seoDescription: string;
  categoryId: string;
  ageGroup: AgeGroup;
  status: ProductStatus;
  priceCents: number;
  compareAtCents: number | null;
  isNew: boolean;
  isBestSeller: boolean;
  soldCount: number;
  stock: Record<string, number>;
  colorIds: string[];
  images: string[];
};

export type StockStatus = "ok" | "low" | "out";

export type ProductFilters = {
  query: string;
  categoryId: string;
  ageGroup: AgeGroup | "";
  status: ProductStatus | "";
  page: number;
};

export type ProductPage = {
  items: CatalogProduct[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
  from: number;
  to: number;
};

export type CategoryWithCount = CatalogCategory & {
  productCount: number;
  stockTotal: number;
};

export type InventoryStatusFilter = "all" | "low" | "out";

export type InventoryFilters = {
  query: string;
  status: InventoryStatusFilter;
};

export type InventoryRow = {
  product: CatalogProduct;
  category: CatalogCategory;
  sizes: Array<{ size: string; quantity: number }>;
  total: number;
  status: StockStatus;
};

export type InventorySummary = {
  products: number;
  lowStock: number;
  outOfStock: number;
  units: number;
};
