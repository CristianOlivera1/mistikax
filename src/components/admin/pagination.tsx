import Link from "next/link";
import { Button } from "@/components/ui/button";

type PaginationProps = {
  page: number;
  pageCount: number;
  from: number;
  to: number;
  total: number;
  hrefForPage: (page: number) => string;
};

export function Pagination({
  page,
  pageCount,
  from,
  to,
  total,
  hrefForPage,
}: PaginationProps) {
  if (total === 0) return null;

  return (
    <div className="border-border flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
      <p className="text-muted-foreground text-xs">
        Mostrando {from}–{to} de {total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          asChild
          variant="outline"
          size="sm"
          className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
        >
          <Link
            href={hrefForPage(Math.max(1, page - 1))}
            aria-disabled={page <= 1}
          >
            Anterior
          </Link>
        </Button>
        <span className="text-muted-foreground px-1 text-xs">
          Página {page} de {pageCount}
        </span>
        <Button
          asChild
          variant="outline"
          size="sm"
          className={
            page >= pageCount ? "pointer-events-none opacity-50" : undefined
          }
        >
          <Link
            href={hrefForPage(Math.min(pageCount, page + 1))}
            aria-disabled={page >= pageCount}
          >
            Siguiente
          </Link>
        </Button>
      </div>
    </div>
  );
}
