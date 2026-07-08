import type { Agent } from "@/features/agents/schema";
import { createStore } from "./store";

// The BFF's agents data source. No real downstream exists yet, so this is an in-memory
// seed (verbatim from the design mockup) behind the shared CRUD store; when the agent
// engine comes online this becomes a downstream client and the router above is unchanged.
function seedAgents(): Agent[] {
  return [
    {
      id: "orchestrator",
      avatar: "OR",
      name: "Orchestrator",
      role: "Orchestrator",
      model: "Opus 4.8",
      status: "working",
      description:
        "Reads your request, plans the phases, delegates to the right agents, and checks their work converges before you see it.",
      systemPrompt:
        "You are the Orchestrator. Decompose the request into the fewest phases that will converge, pick the smallest agent set for each, and delegate with an explicit handoff contract. Never edit files yourself — verify sub-agent outputs agree before returning to the user.",
      permissions: { edit: "ask", bash: "ask", network: "ask" },
      skills: ["workflow-planning"],
      mcps: ["github"],
      usage: {
        tasks: "128 tasks",
        merged: "96% merged",
        tokens: "8.2M",
        cost: "$41.00",
        avgTime: "24s",
      },
    },
    {
      id: "recon",
      avatar: "RC",
      name: "Recon",
      role: "Explorer",
      model: "Haiku 4.5",
      status: "working",
      description:
        "Read-only mapper. Surveys a package and hands a dependency map to the builders before any edits land.",
      systemPrompt:
        "You are Recon, a read-only explorer. Produce a structural map of the target package — entrypoints, data models, and cross-module SDK usages — and hand it off. Do not propose edits; surface risk, not opinion.",
      permissions: { edit: "deny", bash: "ask", network: "deny" },
      skills: ["repo-map"],
      mcps: ["filesystem"],
      usage: {
        tasks: "342 tasks",
        merged: "99% merged",
        tokens: "6.0M",
        cost: "$18.40",
        avgTime: "19s",
      },
    },
    {
      id: "builder",
      avatar: "BD",
      name: "Builder",
      role: "Builder",
      model: "Sonnet 4.5",
      status: "working",
      description:
        "Ports and writes code inside an isolated worktree so parallel builders never collide on shared files.",
      systemPrompt:
        "You are a Builder. Work only inside your assigned worktree. Follow the repo conventions, keep diffs minimal and reversible, write a migration when the schema changes, and never touch files outside your scope.",
      permissions: { edit: "allow", bash: "ask", network: "deny" },
      skills: ["sdk-migration", "api-conventions"],
      mcps: ["filesystem", "postgres"],
      usage: {
        tasks: "210 tasks",
        merged: "92% merged",
        tokens: "18.4M",
        cost: "$184.00",
        avgTime: "1m 44s",
      },
    },
    {
      id: "security",
      avatar: "SR",
      name: "Security Reviewer",
      role: "Reviewer",
      model: "Sonnet 4.5",
      status: "idle",
      description:
        "Adversarially reviews each change — tries to break it before it merges. Reports only real findings.",
      systemPrompt:
        "You are an adversarial Security Reviewer. Assume the diff is wrong. Probe auth, input handling, and secret exposure. Report only findings you can reproduce, each with a concrete exploit path and a suggested fix.",
      permissions: { edit: "deny", bash: "ask", network: "deny" },
      skills: ["security-checklist"],
      mcps: ["filesystem"],
      usage: {
        tasks: "88 tasks",
        merged: "94% merged",
        tokens: "9.6M",
        cost: "$96.00",
        avgTime: "1m 02s",
      },
    },
    {
      id: "test",
      avatar: "TR",
      name: "Test Runner",
      role: "Reviewer",
      model: "Sonnet 4.5",
      status: "idle",
      description:
        "Runs the suite against every branch and returns only the failures, each with a likely root cause.",
      systemPrompt:
        "You are the Test Runner. Detect the repo test command, run the tests touching changed files first, and on failure return the shortest reproducing command plus a one-line root-cause hypothesis.",
      permissions: { edit: "deny", bash: "allow", network: "deny" },
      skills: ["test-runner"],
      mcps: ["filesystem"],
      usage: {
        tasks: "156 tasks",
        merged: "90% merged",
        tokens: "7.1M",
        cost: "$54.00",
        avgTime: "2m 10s",
      },
    },
    {
      id: "synth",
      avatar: "SY",
      name: "Synthesizer",
      role: "Synthesizer",
      model: "Opus 4.8",
      status: "idle",
      description:
        "Merges verified findings into one report and drafts the PRs and summaries you approve.",
      systemPrompt:
        "You are the Synthesizer. Merge verified findings into a single report with no duplication, then draft the PR body and human summary. Attribute every claim to the run that produced it.",
      permissions: { edit: "ask", bash: "deny", network: "ask" },
      skills: ["pr-writer"],
      mcps: ["github"],
      usage: {
        tasks: "64 tasks",
        merged: "97% merged",
        tokens: "5.2M",
        cost: "$62.00",
        avgTime: "38s",
      },
    },
    {
      id: "docs",
      avatar: "DW",
      name: "Docs Writer",
      role: "Builder",
      model: "Haiku 4.5",
      status: "idle",
      description:
        "Keeps READMEs, changelogs and inline docs in sync with the code the builders ship.",
      systemPrompt:
        "You are the Docs Writer. Keep READMEs, changelogs and inline docs consistent with shipped code. Match the existing voice; never invent behavior that is not in the diff.",
      permissions: { edit: "ask", bash: "deny", network: "deny" },
      skills: ["api-conventions"],
      mcps: ["filesystem"],
      usage: {
        tasks: "47 tasks",
        merged: "98% merged",
        tokens: "2.4M",
        cost: "$9.10",
        avgTime: "31s",
      },
    },
  ];
}

export const agentsStore = createStore(seedAgents);
