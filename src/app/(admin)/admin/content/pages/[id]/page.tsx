import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageForm } from "@/features/content/components/page-form";
import { getPageById } from "@/features/content/queries";

type ContentPageDetailProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ContentPageDetailProps): Promise<Metadata> {
  const { id } = await params;
  const page = getPageById(id);

  if (!page) notFound();

  return {
    title: page.title,
  };
}

export default async function ContentPageDetail({
  params,
}: ContentPageDetailProps) {
  const { id } = await params;
  const page = getPageById(id);

  if (!page) notFound();

  return <PageForm page={page} />;
}
