import type { ReactNode } from "react";
import { Surface } from "@/components/surface";
import { cn } from "@/lib/utils";
import { SANDBOX_STATUS_META } from "../presentation";
import type { Sandbox } from "../schema";

// The sandbox detail view: a compute environment's status, image,
// provisioned resources, region, uptime, bound repo, and the agents running inside it.
// Read-only; the compute plane owns lifecycle. Props from the RSC page.

export function SandboxDetail({ sandbox }: { sandbox: Sandbox }) {
  const meta = SANDBOX_STATUS_META[sandbox.status];
  return (
    <Surface className="gap-6">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <span
            role="img"
            aria-label={meta.label}
            className={cn(
              "size-2.5 shrink-0 rounded-full",
              meta.dotClass,
              meta.pulse && "motion-safe:animate-pulse",
            )}
          />
          <h1 className="font-mono text-2xl font-medium tracking-tight text-text">
            {sandbox.name}
          </h1>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em]",
              meta.badgeClass,
            )}
          >
            {meta.label}
          </span>
        </div>
        <p className="text-[13px] text-text-3">
          {sandbox.repo} · {sandbox.region}
        </p>
      </header>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Image">
          <span className="break-all font-mono text-[12px]">{sandbox.image}</span>
        </Stat>
        <Stat label="Resources">{sandbox.resources}</Stat>
        <Stat label="Region">{sandbox.region}</Stat>
        <Stat label="Uptime">{sandbox.uptime}</Stat>
      </dl>

      <section className="space-y-2.5">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-4">
          Agents inside
        </h2>
        {sandbox.usedBy.length === 0 ? (
          <p className="text-[12.5px] text-text-3">No agents running inside this sandbox.</p>
        ) : (
          <div className="flex flex-wrap items-center gap-1.5">
            {sandbox.usedBy.map((agent) => (
              <span
                key={agent}
                className="grid size-8 place-items-center rounded-lg bg-chip font-mono text-[11px] font-semibold text-text-2"
              >
                {agent}
              </span>
            ))}
          </div>
        )}
      </section>
    </Surface>
  );
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-hair bg-panel px-3 py-2.5">
      <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-4">{label}</dt>
      <dd className="mt-0.5 text-[13px] font-medium text-text">{children}</dd>
    </div>
  );
}
