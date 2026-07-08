// Workspace + environment model for the sidebar switcher (design prototype:
// wsList / envMeta). Static seed for Phase 1; becomes BFF-served data later. The
// switcher component takes these as props, so it stays pure and testable.

export type Workspace = {
  readonly id: string;
  readonly name: string;
  /** Monogram shown on the workspace tile. */
  readonly mark: string;
  readonly plan: string;
};

export const ENVIRONMENT_IDS = ["production", "staging", "preview"] as const;
export type EnvironmentId = (typeof ENVIRONMENT_IDS)[number];

export type Environment = {
  readonly id: EnvironmentId;
  readonly name: string;
  /** Semantic color token for the environment dot (CONTEXT.md §Semantic colors). */
  readonly tone: "green" | "amber" | "blue";
};

export const WORKSPACES: readonly Workspace[] = [
  { id: "meridian", name: "meridian", mark: "m", plan: "Enterprise" },
  { id: "atlas-labs", name: "atlas-labs", mark: "a", plan: "Pro" },
  { id: "northwind", name: "northwind", mark: "n", plan: "Team" },
];

export const ENVIRONMENTS: readonly Environment[] = [
  { id: "production", name: "production", tone: "green" },
  { id: "staging", name: "staging", tone: "amber" },
  { id: "preview", name: "preview", tone: "blue" },
];

export const DEFAULT_WORKSPACE_ID = WORKSPACES[0]?.id ?? "meridian";
export const DEFAULT_ENVIRONMENT_ID: EnvironmentId = "production";
