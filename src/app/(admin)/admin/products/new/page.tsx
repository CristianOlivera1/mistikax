import type { Metadata } from "next";
import { ProductForm } from "@/features/catalog/components/product-form";
import {
  getCategories,
  getColors,
} from "@/features/catalog/queries";
import { getMediaPaths } from "@/features/media/queries";

export const metadata: Metadata = {
  title: "Nuevo producto",
};

export default async function NewProductPage() {
  const [categories, colors, imageLibrary] = await Promise.all([
    getCategories(),
    getColors(),
    getMediaPaths(),
  ]);

  return (
    <ProductForm
      categories={categories}
      colors={colors}
      imageLibrary={imageLibrary}
    />
  );
}
