import type { ReactNode } from "react";
import { Icon } from "@/components/icons/icon";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon = "lucide:layers",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center px-6 py-16 text-center",
        className,
      )}
    >
      <span className="border-border bg-muted text-muted-foreground grid size-11 place-items-center rounded-full border">
        <Icon icon={icon} width={20} height={20} aria-hidden="true" />
      </span>
      <p className="mt-4 font-medium">{title}</p>
      {description ? (
        <p className="text-muted-foreground mt-1 max-w-sm text-sm">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
