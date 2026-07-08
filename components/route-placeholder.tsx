// Thin placeholder for surfaces that land in later phases (ROADMAP.md). Keeps the
// shell navigable end to end during Phase 1 without pre-building feature content.
export function RoutePlaceholder({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mx-auto max-w-3xl space-y-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-4">ATB Console</p>
      <h1 className="font-serif text-2xl font-medium tracking-tight text-text">{title}</h1>
      <p className="text-text-2">{description ?? "This surface arrives in a later phase."}</p>
    </div>
  );
}
