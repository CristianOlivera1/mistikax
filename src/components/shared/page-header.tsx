import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icons/icon";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
};

export function PageHeader({
  title,
  description,
  actions,
  backHref,
  backLabel = "Volver",
}: PageHeaderProps) {
  return (
    <div>
      {backHref ? (
        <Link
          href={backHref}
          className="text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-1 text-sm transition-colors"
        >
          <Icon
            icon="lucide:arrow-left"
            width={14}
            height={14}
            aria-hidden="true"
          />
          {backLabel}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description ? (
            <p className="text-muted-foreground mt-1">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}
