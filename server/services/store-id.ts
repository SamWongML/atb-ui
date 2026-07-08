// Derives a stable, url-safe id from a human name for entities created through the BFF
// (agents, skills, …). Kept unique against the ids already in the store so a second
// "Refactor Bot" gets `refactor-bot-2`, never a silent collision.
export function slugId(name: string, existingIds: readonly string[]): string {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "item";
  if (!existingIds.includes(base)) return base;
  let n = 2;
  while (existingIds.includes(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}
