// Shared share-of-total math. Framework- and domain-agnostic — the weight is a caller-supplied
// selector — so it lives in lib/ and both the analytics dashboard and the BFF overview compute
// model-mix shares identically, without a cross-feature import (FOLDER_STRUCTURE.md).

/**
 * Attach each item's share of the summed weight, as a rounded percentage. Never divides by
 * zero — a zero total yields a 0 share for every item (the empty/idle fallback).
 */
export function withShare<T extends object>(
  items: readonly T[],
  weightOf: (item: T) => number,
): (T & { share: number })[] {
  const total = items.reduce((sum, item) => sum + weightOf(item), 0);
  return items.map((item) => ({
    ...item,
    share: total === 0 ? 0 : Math.round((weightOf(item) / total) * 100),
  }));
}
