import type { Metadata } from "next";
import { PageForm } from "@/features/content/components/page-form";

export const metadata: Metadata = {
  title: "Nueva página",
};

export default function NewContentPage() {
  return <PageForm />;
}
