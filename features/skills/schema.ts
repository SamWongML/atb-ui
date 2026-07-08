import { z } from "zod";

// One Zod schema per shape, shared by the client and the BFF router (CONTEXT.md).

/** Capability category (the design groups skills into folders). */
export const SKILL_CATEGORIES = ["testing", "git", "analysis", "data"] as const;
export const skillCategorySchema = z.enum(SKILL_CATEGORIES);
export type SkillCategory = z.infer<typeof skillCategorySchema>;

/** Lifecycle: active (in use), used (available), draft (unreleased). */
export const SKILL_STATUSES = ["active", "used", "draft"] as const;
export const skillStatusSchema = z.enum(SKILL_STATUSES);
export type SkillStatus = z.infer<typeof skillStatusSchema>;

/** One published version in a skill's history. */
export const skillVersionSchema = z.object({
  version: z.string(),
  when: z.string(),
  note: z.string(),
});
export type SkillVersion = z.infer<typeof skillVersionSchema>;

export const skillSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  category: skillCategorySchema,
  description: z.string(),
  summary: z.string(),
  version: z.string(),
  status: skillStatusSchema,
  author: z.string(),
  /** Tools the skill is allowed to use. */
  tools: z.array(z.string()),
  /** The skill's instruction steps. */
  steps: z.array(z.string()),
  /** How many agents attach this skill. */
  usedBy: z.number().int().nonnegative(),
  invocations: z.string(),
  updated: z.string(),
  versionHistory: z.array(skillVersionSchema),
});
export type Skill = z.infer<typeof skillSchema>;

export const skillListSchema = z.array(skillSchema);

/** The user-editable subset — the create/edit form contract. */
export const skillInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: skillCategorySchema,
  version: z.string().min(1, "Version is required"),
  description: z.string().min(1, "Description is required"),
  summary: z.string().min(1, "A summary is required"),
});
export type SkillInput = z.infer<typeof skillInputSchema>;

/** Project a full skill onto the editable form contract (edit-mode default values). */
export function skillToInput(skill: Skill): SkillInput {
  return {
    name: skill.name,
    category: skill.category,
    version: skill.version,
    description: skill.description,
    summary: skill.summary,
  };
}
