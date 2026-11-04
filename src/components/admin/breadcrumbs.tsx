"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { findNavItem } from "@/lib/nav";

export function Breadcrumbs() {
  const pathname = usePathname();
  const current = findNavItem(pathname);
  const segments = pathname.split("/").filter(Boolean);
  const rootSegmentCount = current
    ? current.href.split("/").filter(Boolean).length
    : 1;
  const tail = segments.slice(rootSegmentCount);
  const tailLabel = tail[0] === "new" ? "Nuevo" : tail[0];

  return (
    <nav
      className="text-muted-foreground flex min-w-0 items-center gap-2 text-sm"
      aria-label="Ruta"
    >
      <Link
        href="/admin"
        className="hover:text-foreground shrink-0 transition-colors"
      >
        Panel
      </Link>
      {current && current.href !== "/admin" ? (
        <>
          <span aria-hidden="true">/</span>
          {tailLabel ? (
            <Link
              href={current.href}
              className="hover:text-foreground shrink-0 transition-colors"
            >
              {current.label}
            </Link>
          ) : (
            <span
              className="text-foreground truncate font-medium"
              aria-current="page"
            >
              {current.label}
            </span>
          )}
        </>
      ) : null}
      {tailLabel ? (
        <>
          <span aria-hidden="true">/</span>
          <span
            className="text-foreground truncate font-medium"
            aria-current="page"
          >
            {tailLabel}
          </span>
        </>
      ) : null}
    </nav>
  );
}
