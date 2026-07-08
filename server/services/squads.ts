import type { Squad } from "@/features/squads/schema";
import { createStore } from "./store";

// The BFF's squads data source — an in-memory seed (verbatim from the design mockup) behind
// the shared CRUD store. When the orchestration engine comes online this becomes a
// downstream client and the router above is unchanged.
function seedSquads(): Squad[] {
  return [
    {
      id: "auth-migration",
      name: "Auth Migration Squad",
      status: "active",
      lead: "OR",
      members: ["RC", "BD", "SR", "TR", "SY"],
      mission: "Migrate auth module",
      repo: "meridian/api",
      phase: "Verify",
      stepsDone: 3,
      stepsTotal: 5,
      description:
        "Ports the legacy auth stack onto the v2 SDK. Recon maps the surface, builders fan out across isolated worktrees, and every diff is gated by security review and the test runner before the synthesizer opens a PR.",
      runs: "34 runs",
      merged: "92% merged",
      tokens: "48.6M",
      cost: "$486.00",
      avgTime: "18m 20s",
      schedule: "On demand",
      lastRun: "running now",
      recentRuns: [
        {
          id: "run-4821",
          title: "Migrate auth module · verify phase",
          when: "now",
          status: "running",
        },
        { id: "run-4802", title: "Port session store to v2 SDK", when: "2h ago", status: "merged" },
        { id: "run-4791", title: "Rotate token signing keys", when: "yesterday", status: "merged" },
      ],
    },
    {
      id: "platform-maintenance",
      name: "Platform Maintenance",
      status: "idle",
      lead: "OR",
      members: ["RC", "BD", "TR", "DW"],
      mission: "Nightly maintenance sweep",
      repo: "meridian/core",
      phase: "Idle",
      stepsDone: 0,
      stepsTotal: 4,
      description:
        "Keeps the platform green without anyone babysitting it — dependency upgrades, lint sweeps and coverage backfills run on a schedule, and only real regressions are surfaced for review.",
      runs: "128 runs",
      merged: "88% merged",
      tokens: "22.1M",
      cost: "$221.00",
      avgTime: "9m 05s",
      schedule: "Nightly · 02:00 UTC",
      lastRun: "8h ago",
      recentRuns: [
        { id: "run-4820", title: "Nightly dependency triage", when: "03:46", status: "failed" },
        {
          id: "run-4808",
          title: "Lint sweep · meridian/core",
          when: "yesterday",
          status: "merged",
        },
        {
          id: "run-4795",
          title: "Coverage backfill · api handlers",
          when: "2d ago",
          status: "merged",
        },
      ],
    },
  ];
}

export const squadsStore = createStore(seedSquads);
