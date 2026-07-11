// Small shared helpers for the BUILD-screen list toolbars (search · filter · sort).
// Each list slice declares its own sort fields with value accessors; `sortItems` orders by
// the active one. Kept framework-free so it's unit-testable and reusable across features.

/** Pull the leading number out of a pre-formatted usage string ("210 tasks" → 210). */
export function leadingNumber(value: string): number {
  const match = value.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

export interface SortField<T> {
  key: string;
  label: string;
  /** The comparable value for this field (lowercased strings sort case-insensitively). */
  value: (item: T) => string | number;
}

export type SortDir = "asc" | "desc";

/** Stable sort of `items` by the field matching `key` (falling back to the first field). */
export function sortItems<T>(
  items: readonly T[],
  fields: readonly SortField<T>[],
  key: string,
  dir: SortDir,
): T[] {
  const field = fields.find((candidate) => candidate.key === key) ?? fields[0];
  const sorted = [...items];
  if (!field) return sorted;
  sorted.sort((a, b) => {
    const av = field.value(a);
    const bv = field.value(b);
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return dir === "asc" ? cmp : -cmp;
  });
  return sorted;
}
