"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "@/lib/format";
import type { SalesPoint } from "../types";

type SalesChartProps = {
  points: SalesPoint[];
  range: number;
};

export function SalesChart({ points, range }: SalesChartProps) {
  return (
    <div
      className="h-[220px] w-full"
      role="img"
      aria-label={`Ventas diarias de los últimos ${range} días`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={points}
          margin={{ top: 8, right: 8, bottom: 0, left: 8 }}
          accessibilityLayer
        >
          <defs>
            <linearGradient id="sales-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.18} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            minTickGap={28}
            interval="preserveStartEnd"
          />
          <YAxis hide />
          <Tooltip
            cursor={{ stroke: "var(--border)" }}
            formatter={(value) => formatMoney(Number(value))}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--card)",
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--muted-foreground)" }}
          />
          <Area
            type="monotone"
            dataKey="totalCents"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fill="url(#sales-fill)"
            dot={
              points.length <= 14
                ? {
                    r: 3,
                    fill: "var(--card)",
                    stroke: "var(--chart-1)",
                    strokeWidth: 1.5,
                  }
                : false
            }
            activeDot={{
              r: 4,
              fill: "var(--card)",
              stroke: "var(--chart-1)",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
