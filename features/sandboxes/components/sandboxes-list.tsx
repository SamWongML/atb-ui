import Link from "next/link";
import { cn } from "@/lib/utils";
import { SANDBOX_STATUS_META } from "../presentation";
import type { Sandbox } from "../schema";

// The sandboxes list (README.md §Sandboxes): a grid of compute environments, each card
// surfacing its status inline (running pulses), the base image, provisioned compute, and how
// many agents are inside. Fed by the RSC page through tRPC. Read-only — the compute plane
// owns lifecycle.

export function SandboxesList({ sandboxes }: { sandboxes: readonly Sandbox[] }) {
  const running = sandboxes.filter((s) => s.status === "running").length;
  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col gap-5">
      <header>
        <h1 className="font-serif text-2xl font-medium tracking-tight text-text">Sandboxes</h1>
        <p className="text-[13px] text-text-3">
          {sandboxes.length} environments · {running} running
        </p>
      </header>

      {sandboxes.length === 0 ? (
        <p className="rounded-xl border border-hair bg-panel px-4 py-10 text-center text-[13px] text-text-3">
          No sandboxes provisioned yet.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sandboxes.map((sandbox) => (
            <SandboxCard key={sandbox.id} sandbox={sandbox} />
          ))}
        </div>
      )}
    </div>
  );
}

function SandboxCard({ sandbox }: { sandbox: Sandbox }) {
  const meta = SANDBOX_STATUS_META[sandbox.status];
  return (
    <Link
      href={`/sandboxes/${sandbox.id}`}
      className="flex flex-col gap-3 rounded-xl border border-hair bg-panel p-4 transition-colors hover:border-border-2 hover:bg-panel-2"
    >
      <div className="flex items-center gap-2">
        <span
          role="img"
          aria-label={meta.label}
          className={cn(
            "size-2 shrink-0 rounded-full",
            meta.dotClass,
            meta.pulse && "motion-safe:animate-pulse",
          )}
        />
        <span className="min-w-0 flex-1 truncate font-mono text-[13px] font-medium text-text">
          {sandbox.name}
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em]",
            meta.badgeClass,
          )}
        >
          {meta.label}
        </span>
      </div>
      <p className="font-mono text-[12px] text-text-2">{sandbox.image}</p>
      <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.1em] text-text-4">
        <span>{sandbox.resources}</span>
        <span className="ml-auto normal-case">{sandbox.usedBy.length} inside</span>
      </div>
    </Link>
  );
}
