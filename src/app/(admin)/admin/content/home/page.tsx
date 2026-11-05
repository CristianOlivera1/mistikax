import type { Metadata } from "next";
import { HomeContentForm } from "@/features/content/components/home-content-form";
import { getHomeContent } from "@/features/content/queries";
import { getMediaPaths } from "@/features/media/queries";

export const metadata: Metadata = {
  title: "Portada y banners",
};

export default async function HomeContentPage() {
  const [content, images] = await Promise.all([
    Promise.resolve(getHomeContent()),
    getMediaPaths(),
  ]);

  return <HomeContentForm content={content} images={images} />;
}
