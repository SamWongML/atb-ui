import Link from "next/link";
import { cn } from "@/lib/utils";
import { OVERVIEW_ACTIVITY_META } from "../presentation";
import type {
  OverviewActivity,
  OverviewFailure,
  OverviewModelSlice,
  OverviewSummary,
} from "../schema";

// The overview home: the surface that ties everything together —
// headline stats, the activity feed, recent failures with their root cause, and the model
// mix. Read-only; props from the RSC page, which composes them through the BFF.

export function OverviewHome({ summary }: { summary: OverviewSummary }) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <header>
        <h1 className="font-serif text-2xl font-medium tracking-tight text-text">Overview</h1>
        <p className="text-[13px] text-text-3">Everything happening across your workspace.</p>
      </header>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {summary.stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-hair bg-panel px-4 py-3">
            <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-4">
              {stat.label}
            </dt>
            <dd className="mt-1 font-serif text-xl font-medium text-text">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <section className="space-y-2.5">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-4">
            Recent activity
          </h2>
          {summary.activity.length === 0 ? (
            <EmptyNote>No activity yet.</EmptyNote>
          ) : (
            <div className="flex flex-col gap-2">
              {summary.activity.map((item) => (
                <ActivityRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        <div className="flex flex-col gap-5">
          <section className="space-y-2.5">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-4">
              Failures
            </h2>
            {summary.failures.length === 0 ? (
              <p className="rounded-lg border border-green-bg bg-green-bg px-3.5 py-2.5 text-[12.5px] text-green">
                No recent failures.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {summary.failures.map((failure) => (
                  <FailureRow key={failure.id} failure={failure} />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-2.5">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-4">
              Model mix
            </h2>
            <div className="space-y-2.5">
              {summary.modelMix.map((slice) => (
                <ModelBar key={slice.model} slice={slice} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ActivityRow({ item }: { item: OverviewActivity }) {
  const meta = OVERVIEW_ACTIVITY_META[item.status];
  return (
    <Link
      href={item.href}
      className="flex items-center gap-3 rounded-lg border border-hair bg-panel px-3.5 py-2.5 transition-colors hover:border-border-2 hover:bg-panel-2"
    >
      <span
        role="img"
        aria-label={meta.label}
        className={cn(
          "size-2 shrink-0 rounded-full",
          meta.dotClass,
          meta.pulse && "motion-safe:animate-pulse",
        )}
      />
      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-text">
        {item.title}
      </span>
      <span className="hidden shrink-0 font-mono text-[11px] text-text-4 sm:inline">
        {item.meta}
      </span>
    </Link>
  );
}

function FailureRow({ failure }: { failure: OverviewFailure }) {
  return (
    <Link
      href={failure.href}
      className="block space-y-1 rounded-lg border border-red-bg bg-red-bg px-3.5 py-2.5 transition-colors hover:border-red"
    >
      <span className="block text-[13px] font-medium text-text">{failure.title}</span>
      <span className="line-clamp-2 block text-[12px] leading-relaxed text-text-2">
        {failure.rootCause}
      </span>
    </Link>
  );
}

function ModelBar({ slice }: { slice: OverviewModelSlice }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[12px]">
        <span className="min-w-0 truncate font-mono text-text-2">{slice.model}</span>
        <span className="shrink-0 tabular-nums text-text-3">{slice.share}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-chip">
        <div className="h-full rounded-full bg-primary" style={{ width: `${slice.share}%` }} />
      </div>
    </div>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-hair bg-panel px-3.5 py-6 text-center text-[13px] text-text-3">
      {children}
    </p>
  );
}
