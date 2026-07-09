"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { colorAt } from "../presentation";
import type { ModelUsage } from "../schema";

// Model-mix donut (Recharts). Decorative enrichment of the legend the dashboard renders as
// text, so the container is aria-hidden. Slice fills come from the token-var chart palette
// (presentation.colorAt), never hardcoded hex.
export function ModelMixChart({ data }: { data: readonly ModelUsage[] }) {
  return (
    <div className="h-40 w-40 shrink-0" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={[...data]}
            dataKey="runs"
            nameKey="model"
            innerRadius="62%"
            outerRadius="100%"
            paddingAngle={2}
            stroke="none"
            isAnimationActive={false}
          >
            {data.map((slice, i) => (
              <Cell key={slice.model} fill={colorAt(i)} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
