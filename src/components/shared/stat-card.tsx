import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
};

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <Card className="gap-0 rounded-lg">
      <div className="px-5">
        <p className="text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
        <p className="text-muted-foreground mt-1 min-h-4 text-xs">
          {hint ?? "\u00a0"}
        </p>
      </div>
    </Card>
  );
}
