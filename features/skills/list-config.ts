import type { Route } from "next";
import { leadingNumber, type SortField } from "@/lib/list-query";
import { SKILL_STATUS_META } from "./presentation";
import { SKILL_STATUSES, type Skill } from "./schema";

// The skills list configuration — shared by the rail (server-rendered into the shell
// @header slot) and the list body (the page), so their sort/filter view can't drift.

const SKILLS_SCOPE = "skills";

export const SKILLS_SORT_FIELDS: SortField<Skill>[] = [
  { key: "name", label: "Name", value: (skill) => skill.name.toLowerCase() },
  { key: "status", label: "Status", value: (skill) => SKILL_STATUSES.indexOf(skill.status) },
  { key: "category", label: "Category", value: (skill) => skill.category },
  { key: "invocations", label: "Runs", value: (skill) => leadingNumber(skill.invocations) },
];

export const SKILLS_STATUS_FILTERS = [
  { value: "all", label: "All" },
  ...SKILL_STATUSES.map((status) => ({ value: status, label: SKILL_STATUS_META[status].label })),
];

function skillMatches(skill: Skill, query: string): boolean {
  return (
    skill.name.toLowerCase().includes(query) ||
    skill.description.toLowerCase().includes(query) ||
    skill.summary.toLowerCase().includes(query)
  );
}

/** The useListQuery config minus `items` — both the rail and the body spread this in. */
export const SKILLS_LIST_QUERY = {
  scope: SKILLS_SCOPE,
  sortFields: SKILLS_SORT_FIELDS,
  statuses: SKILL_STATUSES,
  statusOf: (skill: Skill) => skill.status,
  matches: skillMatches,
};

export const SKILLS_NEW_BUTTON: { href: Route; label: string } = {
  href: "/skills/new",
  label: "New skill",
};

export const SKILLS_SEARCH_PLACEHOLDER = "Search skills…";
