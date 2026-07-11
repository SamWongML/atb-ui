"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";
import { cn } from "@/lib/utils";
import type {
  PlanStep,
  RunLogLine,
  SessionCanvas as SessionCanvasData,
  TraceSpan,
} from "../canvas";
import { useSessionCanvas } from "../hooks/use-session-canvas";
import { DiffView } from "./diff-view";

// The session canvas (README.md §Sessions): the four working views beside the streaming
// transcript. The canvas is read from the Query cache — seeded by the RSC snapshot and
// updated by reconcile() as stream frames arrive — so the views grow live without the
// component touching a socket (ARCHITECTURE.md §Real-time). The active tab lives in the
// URL (nuqs, TECH_STACK.md L4) so a canvas view is shareable and survives reload.

const TABS = [
  { value: "plan", label: "Plan" },
  { value: "run", label: "Run" },
  { value: "diff", label: "Diff" },
  { value: "trace", label: "Trace" },
] as const;
const TAB_VALUES = ["plan", "run", "diff", "trace"] as const;

export function SessionCanvas({
  sessionId,
  initialCanvas,
}: {
  sessionId: string;
  initialCanvas: SessionCanvasData;
}) {
  const canvas = useSessionCanvas(sessionId, initialCanvas);
  const [tab, setTab] = useQueryState("tab", parseAsStringLiteral(TAB_VALUES).withDefault("plan"));

  return (
    <section className="flex min-h-0 flex-col rounded-xl border border-border bg-panel">
      <div
        role="tablist"
        aria-label="Session canvas"
        className="flex gap-1 border-b border-hair p-1.5"
      >
        {TABS.map(({ value, label }) => {
          const selected = value === tab;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => void setTab(value)}
              className={cn(
                "rounded-md px-3 py-1 text-[12.5px] font-medium transition-colors",
                selected
                  ? "bg-primary-soft text-primary"
                  : "text-text-3 hover:bg-[var(--nav-hover)] hover:text-text-2",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className="scroll-surface min-h-0 flex-1 overflow-auto p-4">
        {tab === "plan" && <PlanView plan={canvas.plan} />}
        {tab === "run" && <RunView run={canvas.run} />}
        {tab === "diff" && <DiffView diff={canvas.diff} />}
        {tab === "trace" && <TraceView trace={canvas.trace} />}
      </div>
    </section>
  );
}

const STEP_DOT: Record<PlanStep["state"], string> = {
  done: "bg-green",
  active: "bg-clay animate-[pulse_1.2s_ease-in-out_infinite]",
  pending: "bg-text-4",
};

function PlanView({ plan }: { plan: PlanStep[] }) {
  if (plan.length === 0) return <Empty>No plan yet.</Empty>;
  return (
    <ol className="space-y-2.5">
      {plan.map((step) => (
        <li
          key={step.id}
          aria-current={step.state === "active" ? "step" : undefined}
          className="flex items-center gap-3"
        >
          <span
            className={cn("size-2 flex-shrink-0 rounded-full", STEP_DOT[step.state])}
            aria-hidden
          />
          <span className="sr-only">{step.state}</span>
          <span
            className={cn(
              "text-[13.5px]",
              step.state === "done" ? "text-text-3 line-through" : "text-text",
            )}
          >
            {step.text}
          </span>
        </li>
      ))}
    </ol>
  );
}

const LEVEL_COLOR: Record<RunLogLine["level"], string> = {
  info: "text-text-2",
  warn: "text-amber",
  error: "text-red",
};

function RunView({ run }: { run: RunLogLine[] }) {
  if (run.length === 0) return <Empty>No output yet.</Empty>;
  return (
    <div className="space-y-0.5 rounded-lg bg-inset p-3 font-mono text-[12px] leading-relaxed">
      {run.map((line) => (
        <p key={line.id} className={LEVEL_COLOR[line.level]}>
          {line.text}
        </p>
      ))}
    </div>
  );
}

function formatDuration(ms: number): string {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

function TraceView({ trace }: { trace: TraceSpan[] }) {
  if (trace.length === 0) return <Empty>No trace yet.</Empty>;
  return (
    <ul className="space-y-1.5">
      {trace.map((span) => (
        <li
          key={span.id}
          className="flex items-center gap-3 rounded-lg border border-hair bg-panel-2 px-3 py-2"
        >
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em]",
              span.status === "ok" ? "bg-green-bg text-green" : "bg-red-bg text-red",
            )}
          >
            {span.status === "ok" ? "ok" : "failed"}
          </span>
          <span className="min-w-0 flex-1 truncate font-mono text-[12.5px] text-text-2">
            {span.name}
          </span>
          <span className="font-mono text-[11px] text-text-4">
            {formatDuration(span.durationMs)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] text-text-3">{children}</p>;
}
