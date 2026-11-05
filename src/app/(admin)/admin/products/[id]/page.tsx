import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductForm } from "@/features/catalog/components/product-form";
import {
  getCategories,
  getColors,
  getProductById,
} from "@/features/catalog/queries";
import { getMediaPaths } from "@/features/media/queries";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) notFound();

  return {
    title: product.name,
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const [product, categories, colors, imageLibrary] = await Promise.all([
    getProductById(id),
    getCategories(),
    getColors(),
    getMediaPaths(),
  ]);

  if (!product) notFound();

  return (
    <ProductForm
      product={product}
      categories={categories}
      colors={colors}
      imageLibrary={imageLibrary}
    />
  );
}
