import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons/icon";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PagesTable } from "@/features/content/components/pages-table";
import { getPages } from "@/features/content/queries";

export const metadata: Metadata = {
  title: "Páginas",
};

export default async function ContentPagesPage() {
  const pages = await getPages();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Páginas"
        description="Textos informativos de la tienda."
        actions={
          <Button asChild>
            <Link href="/admin/content/pages/new">
              <Icon
                icon="lucide:plus"
                width={14}
                height={14}
                aria-hidden="true"
              />
              Nueva página
            </Link>
          </Button>
        }
      />
      <div className="border-border bg-card overflow-hidden rounded-lg border">
        <PagesTable pages={pages} />
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
