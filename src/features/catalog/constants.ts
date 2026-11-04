import type { AgeGroup } from "@/lib/constants";

export const SIZE_TYPES = {
  clothing: {
    label: "Ropa (S, M, L...)",
    description: "Tallas alfabéticas o infantiles.",
  },
  footwear: {
    label: "Calzado (numeración)",
    description: "Tallas numéricas por edad.",
  },
  one_size: {
    label: "Talla única",
    description: "Accesorios y gorras.",
  },
} as const;

export type SizeType = keyof typeof SIZE_TYPES;

const CLOTHING_SIZES: Record<AgeGroup, string[]> = {
  kids: ["4", "6", "8", "10", "12", "14"],
  teens: ["XS", "S", "M", "L"],
  adults: ["S", "M", "L", "XL", "XXL"],
};

const FOOTWEAR_SIZES: Record<AgeGroup, string[]> = {
  kids: ["28", "30", "32", "34"],
  teens: ["36", "37", "38", "39", "40"],
  adults: ["39", "40", "41", "42", "43", "44"],
};

export function getSizes(sizeType: SizeType, ageGroup: AgeGroup): string[] {
  if (sizeType === "one_size") return ["Única"];
  if (sizeType === "footwear") return [...FOOTWEAR_SIZES[ageGroup]];
  return [...CLOTHING_SIZES[ageGroup]];
}

export const LOW_STOCK_THRESHOLD = 5;
export const PRODUCTS_PAGE_SIZE = 8;
export const PLACEHOLDER_IMAGE = "/images/products/placeholder.svg";
