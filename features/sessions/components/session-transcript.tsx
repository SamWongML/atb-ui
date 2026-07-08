import type { SessionDetail } from "@/features/sessions/realtime";
import type { SessionStatus } from "@/features/sessions/schema";
import { cn } from "@/lib/utils";

// Presentational live transcript (README.md §Sessions). Renders the SessionDetail that
// reconcile() maintains in the cache — status, step progress, and the streaming
// transcript with a live cursor on the message still arriving. Pure over its prop.

const STATUS: Record<SessionStatus, { label: string; className: string }> = {
  needs_you: { label: "Needs you", className: "bg-amber-bg text-amber" },
  active: { label: "Active", className: "bg-clay-bg text-clay" },
  review: { label: "Review", className: "bg-violet-bg text-violet" },
  done: { label: "Done", className: "bg-green-bg text-green" },
};

export function SessionTranscript({ detail }: { detail?: SessionDetail }) {
  if (!detail) {
    return <p className="text-[13px] text-text-3">Connecting to the session stream…</p>;
  }

  const status = STATUS[detail.status];

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <h1 className="font-serif text-xl font-medium text-text">{detail.title || detail.id}</h1>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em]",
            status.className,
          )}
        >
          {status.label}
        </span>
        <span className="font-mono text-[11px] text-text-4">
          {detail.steps.completed}/{detail.steps.total} steps
        </span>
      </header>

      <ol className="space-y-4">
        {detail.transcript.map((message) => (
          <li key={message.id} className="space-y-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-4">
              {message.agent}
            </p>
            <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-text-2">
              {message.text}
              {message.pending && (
                <>
                  <span
                    aria-hidden
                    className="ml-0.5 inline-block w-1.5 animate-[pulse_1s_ease-in-out_infinite] text-primary"
                  >
                    ▍
                  </span>
                  <span className="sr-only"> streaming</span>
                </>
              )}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
