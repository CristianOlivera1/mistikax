import type { MetadataRoute } from "next";
import { getStoreSitemapProducts } from "@/features/catalog/store-queries";
import { listPublishedPages } from "@/features/content/store-queries";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mistikax.com";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, pages] = await Promise.all([
    getStoreSitemapProducts(),
    listPublishedPages(),
  ]);
  const now = new Date();

  return [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/catalog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/size-guide`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/shipping`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...products.map((product) => ({
      url: `${BASE_URL}/product/${product.id}`,
      lastModified: new Date(product.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...pages
      .filter((page) => page.id !== "shipping")
      .map((page) => ({
        url: `${BASE_URL}/pages/${page.id}`,
        lastModified: new Date(page.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.4,
      })),
  ];
}
