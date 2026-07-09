"use client";

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { CostPoint } from "../schema";

// Cost-over-time area chart (Recharts). Decorative enrichment of the numbers the dashboard
// already states as text, so the container is aria-hidden. Stroke/fill are token CSS vars, so
// the chart re-themes with the app; no hardcoded hex.
export function CostChart({ data }: { data: readonly CostPoint[] }) {
  return (
    <div className="h-48 w-full" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={[...data]} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
          <defs>
            <linearGradient id="atb-cost-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.32} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--text-3)", fontSize: 11 }}
          />
          <YAxis hide />
          <Area
            type="monotone"
            dataKey="cost"
            stroke="var(--accent)"
            strokeWidth={2}
            fill="url(#atb-cost-fill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
