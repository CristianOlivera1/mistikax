import Link from "next/link";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/format";
import { PAGE_STATUSES, type ContentPage } from "../types";
import { PageActions } from "./page-actions";

type PagesTableProps = {
  pages: ContentPage[];
};

export function PagesTable({ pages }: PagesTableProps) {
  const columns: DataTableColumn<ContentPage>[] = [
    {
      id: "title",
      header: "Título",
      cell: (page) => (
        <Link
          href={`/admin/content/pages/${page.id}`}
          className="font-medium hover:underline"
        >
          {page.title}
        </Link>
      ),
    },
    {
      id: "url",
      header: "URL",
      cell: (page) => (
        <span className="text-muted-foreground font-mono text-xs">
          /pages/{page.id}
        </span>
      ),
    },
    {
      id: "status",
      header: "Estado",
      cell: (page) => (
        <StatusBadge tone={page.status === "published" ? "success" : "neutral"}>
          {PAGE_STATUSES[page.status]}
        </StatusBadge>
      ),
    },
    {
      id: "updatedAt",
      header: "Última edición",
      cell: (page) => (
        <span className="text-muted-foreground">
          {formatDate(page.updatedAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      className: "text-right",
      cell: (page) => (
        <div className="flex justify-end">
          <PageActions page={page} />
        </div>
      ),
    },
  ];

  return (
    <DataTable columns={columns} rows={pages} getRowKey={(page) => page.id} />
  );
}
