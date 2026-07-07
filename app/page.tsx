import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";

const STATUS_DOTS = [
  { label: "Needs you", className: "bg-amber" },
  { label: "Active", className: "bg-clay" },
  { label: "Review", className: "bg-violet" },
  { label: "Done", className: "bg-green" },
] as const;

/**
 * Phase 0 landing surface: a themed shell that demonstrates the token system and
 * primitives are wired (fonts, colors, radii, Button, semantic status colors).
 * Real feature surfaces (Sessions, etc.) begin in Phase 2.
 */
export default function HomePage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-4">
          Phase 0 · Foundation
        </p>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-text">ATB Console</h1>
        <p className="text-text-2">
          The themed shell is live. Tokens, Tailwind v4, fonts, and shadcn primitives are wired
          against the ATB design system.
        </p>

        <div className="rounded-xl border border-border bg-panel p-5 shadow-[var(--shadow)]">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-text-4">
            Session status colors
          </p>
          <ul className="space-y-2">
            {STATUS_DOTS.map((s) => (
              <li key={s.label} className="flex items-center gap-2.5 text-sm text-text-2">
                <span className={`size-2 rounded-full ${s.className}`} aria-hidden />
                {s.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Button>New session</Button>
          <Button variant="soft">Soft</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </div>
    </AppShell>
  );
}
