import type { ReactNode } from "react";

/**
 * Phase 0 minimal themed shell: a themed header (banner) with the ATB mark and a
 * main content region. The full sidebar nav / breadcrumb / ⌘K shell arrives in
 * Phase 1 (ROADMAP.md) — this proves the token + theming wiring end to end.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <header className="flex h-[53px] flex-shrink-0 items-center gap-2.5 border-b border-border px-5">
        <div
          className="grid size-7 place-items-center rounded-lg font-serif text-sm text-white"
          style={{ background: "linear-gradient(160deg,var(--accent-2),var(--accent))" }}
          aria-hidden
        >
          a
        </div>
        <span className="font-serif text-[15px] font-semibold tracking-tight">ATB</span>
      </header>
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
