import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusTone =
  "neutral" | "info" | "success" | "warning" | "danger" | "violet";

const toneClass: Record<StatusTone, string> = {
  neutral: "bg-muted-foreground",
  info: "bg-chart-1",
  success: "bg-chart-3",
  warning: "bg-chart-4",
  danger: "bg-destructive",
  violet: "bg-chart-2",
};

type StatusBadgeProps = {
  children: ReactNode;
  tone?: StatusTone;
  className?: string;
};

export function StatusBadge({
  children,
  tone = "neutral",
  className,
}: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-border bg-card gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        className,
      )}
    >
      <span
        className={cn("size-1.5 rounded-full", toneClass[tone])}
        aria-hidden="true"
      />
      {children}
    </Badge>
  );
}
