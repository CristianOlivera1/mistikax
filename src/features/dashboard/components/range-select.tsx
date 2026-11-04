"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DashboardRange } from "../types";

const RANGE_OPTIONS: DashboardRange[] = [7, 14, 30];

const RANGE_LABELS: Record<DashboardRange, string> = {
  7: "Últimos 7 días",
  14: "Últimos 14 días",
  30: "Últimos 30 días",
};

export function RangeSelect({ value }: { value: DashboardRange }) {
  const router = useRouter();

  return (
    <Select
      value={String(value)}
      onValueChange={(next) => router.replace(`/admin?range=${next}`)}
    >
      <SelectTrigger className="h-8 w-[152px]" aria-label="Rango de fechas">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {RANGE_OPTIONS.map((range) => (
          <SelectItem key={range} value={String(range)}>
            {RANGE_LABELS[range]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
