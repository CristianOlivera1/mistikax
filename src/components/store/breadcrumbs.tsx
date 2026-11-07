import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function StoreBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Migas de pan" className="mb-8">
      <ol className="text-grey-dark flex flex-wrap items-center gap-2 text-[10px] tracking-widest uppercase">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {item.href ? (
              <Link href={item.href} className="hover:text-dark transition-colors">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-dark">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
