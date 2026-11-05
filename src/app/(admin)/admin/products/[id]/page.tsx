import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductForm } from "@/features/catalog/components/product-form";
import {
  getCatalogImageLibrary,
  getCategories,
  getColors,
  getProductById,
} from "@/features/catalog/queries";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) notFound();

  return {
    title: product.name,
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) notFound();

  return (
    <ProductForm
      product={product}
      categories={getCategories()}
      colors={getColors()}
      imageLibrary={getCatalogImageLibrary()}
    />
  );
}
