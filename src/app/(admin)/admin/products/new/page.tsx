import type { Metadata } from "next";
import { ProductForm } from "@/features/catalog/components/product-form";
import {
  getCatalogImageLibrary,
  getCategories,
  getColors,
} from "@/features/catalog/queries";

export const metadata: Metadata = {
  title: "Nuevo producto",
};

export default function NewProductPage() {
  return (
    <ProductForm
      categories={getCategories()}
      colors={getColors()}
      imageLibrary={getCatalogImageLibrary()}
    />
  );
}
