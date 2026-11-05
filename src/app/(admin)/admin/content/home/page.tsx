import type { Metadata } from "next";
import { HomeContentForm } from "@/features/content/components/home-content-form";
import { getHomeContent } from "@/features/content/queries";
import { getMediaPaths } from "@/features/media/queries";

export const metadata: Metadata = {
  title: "Portada y banners",
};

export default function HomeContentPage() {
  return (
    <HomeContentForm content={getHomeContent()} images={getMediaPaths()} />
  );
}
