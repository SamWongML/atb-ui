import type { ReactNode } from "react";
import { formatUsd } from "@/lib/format";
import { withShare } from "@/lib/share";
import { avgCostPerRun, colorAt } from "../presentation";
import type { Analytics } from "../schema";
import { CostChart } from "./cost-chart";
import { ModelMixChart } from "./model-mix-chart";

// The analytics dashboard: rolled-up spend and the model mix behind it.
// KPI tiles and the model legend carry the numbers as text (the accessible surface); the
// Recharts area + donut are decorative enrichment beside them. Props from the RSC page.

export function AnalyticsDashboard({ data }: { data: Analytics }) {
  const models = withShare(data.modelMix, (model) => model.runs);
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <header>
        <h1 className="font-serif text-2xl font-medium tracking-tight text-text">Analytics</h1>
        <p className="text-[13px] text-text-3">Spend and model mix · last 7 days</p>
      </header>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Kpi label="Total cost">{formatUsd(data.totalCost)}</Kpi>
        <Kpi label="Runs">{data.totalRuns.toLocaleString("en-US")}</Kpi>
        <Kpi label="Avg / run">{formatUsd(avgCostPerRun(data))}</Kpi>
      </dl>

      <section className="space-y-3 rounded-xl border border-hair bg-panel p-4">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-4">
          Cost over time
        </h2>
        <CostChart data={data.costSeries} />
      </section>

      <section className="space-y-3 rounded-xl border border-hair bg-panel p-4">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-4">Model mix</h2>
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
          <ModelMixChart data={data.modelMix} />
          <ul className="w-full flex-1 space-y-2">
            {models.map((model, i) => (
              <li key={model.model} className="flex items-center gap-2.5">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: colorAt(i) }}
                />
                <span className="min-w-0 flex-1 truncate font-mono text-[12.5px] text-text">
                  {model.model}
                </span>
                <span className="text-[12px] tabular-nums text-text-3">{model.share}%</span>
                <span className="w-16 text-right font-mono text-[12px] tabular-nums text-text-2">
                  {formatUsd(model.cost)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-hair bg-panel px-4 py-3">
      <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-4">{label}</dt>
      <dd className="mt-1 font-serif text-xl font-medium text-text">{children}</dd>
    </div>
  );
}
