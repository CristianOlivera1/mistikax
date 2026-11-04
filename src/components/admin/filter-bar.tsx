import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FilterBarProps = {
  children: ReactNode;
  className?: string;
};

export function FilterBar({ children, className }: FilterBarProps) {
  return (
    <div
      className={cn(
        "border-border flex flex-wrap items-center gap-2 border-b p-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
