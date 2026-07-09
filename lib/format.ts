// Shared, framework-free formatters. They live in lib/ so a feature's presentation and the
// BFF can format identically without a cross-feature import (FOLDER_STRUCTURE.md: share via
// components/, lib/, or the BFF — never feature-to-feature).

/** Format a dollar amount with two decimals and thousands separators (e.g. "$1,234.50"). */
export function formatUsd(amount: number): string {
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
