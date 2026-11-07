import Link from "next/link";

type StorePaginationProps = {
  page: number;
  pageCount: number;
  basePath: string;
  params: Record<string, string | undefined>;
};

function pageHref(
  basePath: string,
  params: Record<string, string | undefined>,
  page: number,
): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }

  if (page > 1) search.set("page", String(page));

  const query = search.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function StorePagination({
  page,
  pageCount,
  basePath,
  params,
}: StorePaginationProps) {
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1).filter(
    (value) =>
      value === 1 ||
      value === pageCount ||
      Math.abs(value - page) <= 1,
  );

  return (
    <nav aria-label="Paginación" className="mt-16 flex items-center justify-center gap-2">
      {page > 1 ? (
        <Link
          href={pageHref(basePath, params, page - 1)}
          className="border-dark hover:bg-dark hover:text-background border px-4 py-3 text-[10px] font-bold tracking-widest uppercase transition-colors"
        >
          Anterior
        </Link>
      ) : null}
      {pages.map((value, index) => {
        const previous = pages[index - 1];
        const showGap = previous !== undefined && value - previous > 1;

        return (
          <span key={value} className="flex items-center gap-2">
            {showGap ? <span className="text-grey-mid px-1">…</span> : null}
            <Link
              href={pageHref(basePath, params, value)}
              aria-current={value === page ? "page" : undefined}
              className={
                value === page
                  ? "bg-dark text-background px-4 py-3 text-[10px] font-bold tracking-widest"
                  : "border-grey-light hover:border-dark border px-4 py-3 text-[10px] font-bold tracking-widest transition-colors"
              }
            >
              {value}
            </Link>
          </span>
        );
      })}
      {page < pageCount ? (
        <Link
          href={pageHref(basePath, params, page + 1)}
          className="border-dark hover:bg-dark hover:text-background border px-4 py-3 text-[10px] font-bold tracking-widest uppercase transition-colors"
        >
          Siguiente
        </Link>
      ) : null}
    </nav>
  );
}
