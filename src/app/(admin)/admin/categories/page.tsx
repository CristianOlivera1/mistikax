import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { CategoriesTable } from "@/features/catalog/components/categories-table";
import { CategoryDialog } from "@/features/catalog/components/category-dialog";
import { getCategoriesWithCounts } from "@/features/catalog/queries";

export const metadata: Metadata = {
  title: "Categorías",
};

export default function CategoriesPage() {
  const categories = getCategoriesWithCounts();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Categorías"
        description="Organiza el catálogo y define el tipo de tallas."
        actions={<CategoryDialog />}
      />
      <div className="border-border bg-card overflow-hidden rounded-lg border">
        <CategoriesTable categories={categories} />
      </div>
    </div>
  );
}
