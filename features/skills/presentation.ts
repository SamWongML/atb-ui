import type { SkillCategory, SkillStatus } from "./schema";

// One source of truth for how skill enums present — labels + semantic-token classes.
// Colors are token utilities, never hardcoded.
export const SKILL_STATUS_META: Record<SkillStatus, { label: string; badgeClass: string }> = {
  active: { label: "Active", badgeClass: "bg-green-bg text-green" },
  used: { label: "Used", badgeClass: "bg-chip text-text-2" },
  draft: { label: "Draft", badgeClass: "bg-amber-bg text-amber" },
};

// Category tint (design groups skills by folder, each a color). Token utilities only.
export const SKILL_CATEGORY_META: Record<SkillCategory, { badgeClass: string }> = {
  testing: { badgeClass: "bg-green-bg text-green" },
  git: { badgeClass: "bg-violet-bg text-violet" },
  analysis: { badgeClass: "bg-blue-bg text-blue" },
  data: { badgeClass: "bg-amber-bg text-amber" },
};
