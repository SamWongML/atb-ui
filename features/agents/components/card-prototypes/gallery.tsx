"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";
import type { ComponentType } from "react";
import { PrototypeSwitcher } from "@/components/prototype-switcher";
import { Surface } from "@/components/surface";
import { useListQuery } from "@/lib/use-list-query";
import { AGENTS_LIST_QUERY } from "../../list-config";
import type { Agent } from "../../schema";
import { AgentsList } from "../agents-list";
import { MISSION_CONTROL_NAME, VariantMissionControl } from "./variant-a-mission-control";
import { SCORECARD_NAME, VariantScorecard } from "./variant-b-scorecard";
import { BENTO_NAME, VariantBento } from "./variant-c-bento";
import { DOSSIER_NAME, VariantDossier } from "./variant-d-dossier";
import { CONSOLE_NAME, VariantConsole } from "./variant-e-console";
import { REVEAL_NAME, VariantReveal } from "./variant-f-reveal";

// PROTOTYPE — throwaway. The agent-card design gallery: six card treatments for the Agents
// roster, rendered ON the real /agents route (real shell, real rail, real data) and switched
// via `?variant=` — plan: "six structurally different agent cards on the existing route,
// floating switcher, shipping card kept as the baseline stop." The rail's search / filter /
// sort stay live for every variant (same useListQuery the shipping list uses) so density and
// truncation are judged under real interaction, not in a vacuum. The winning treatment gets
// folded into agents-list.tsx properly; this folder, the switcher and the page hook-in are
// then deleted (the full set survives on the prototype branch as the primary source).
//
// Research trail (2026-07): agent-dashboard patterns — a fleet card answers "what is it doing
// now" first (proactive status) with outcome metrics, not vanity ones · KPI-card anatomy —
// label → value → delta → word-sized sparkline (Tufte: a number without history is noise) ·
// bento cells — labeled sub-cells make many facts scannable · model/persona-card lineage —
// spelled-out capabilities and permissions build operator trust · terminal aesthetic — mono
// key-value density reads "technical without chrome" · progressive disclosure — glanceable
// at rest, rich on hover, with a discoverable hint. Variant headers cite their own basis.

const VARIANT_KEYS = ["current", "a", "b", "c", "d", "e", "f"] as const;
type VariantKey = (typeof VARIANT_KEYS)[number];

type Variant = {
  key: VariantKey;
  name: string;
  /** null → render the shipping <AgentsList> untouched (the baseline stop). */
  Body: ComponentType<{ agents: readonly Agent[] }> | null;
};

const CURRENT: Variant = { key: "current", name: "Current shipping card", Body: null };

const VARIANTS: readonly Variant[] = [
  CURRENT,
  { key: "a", name: MISSION_CONTROL_NAME, Body: VariantMissionControl },
  { key: "b", name: SCORECARD_NAME, Body: VariantScorecard },
  { key: "c", name: BENTO_NAME, Body: VariantBento },
  { key: "d", name: DOSSIER_NAME, Body: VariantDossier },
  { key: "e", name: CONSOLE_NAME, Body: VariantConsole },
  { key: "f", name: REVEAL_NAME, Body: VariantReveal },
];

export function AgentCardPrototypeGallery({ agents }: { agents: readonly Agent[] }) {
  const [variant, setVariant] = useQueryState(
    "variant",
    parseAsStringLiteral(VARIANT_KEYS).withDefault("current"),
  );
  const query = useListQuery({ items: agents, ...AGENTS_LIST_QUERY });

  // A stray merge can't ship the gallery: production renders the shipping roster, period.
  if (process.env.NODE_ENV === "production") return <AgentsList agents={agents} />;

  const active = VARIANTS.find((entry) => entry.key === variant) ?? CURRENT;
  const Body = active.Body;
  return (
    <>
      {Body === null ? (
        <AgentsList agents={agents} />
      ) : (
        <Surface className="gap-3.5">
          <p className="flex items-center gap-1.5 px-0.5 font-mono text-[11px] text-text-4">
            <span className="text-text-3">{query.visible.length}</span> of {agents.length} agents
            <span aria-hidden>·</span> prototype
            <span className="text-text-3">{active.name.toLowerCase()}</span>
          </p>
          {query.visible.length === 0 ? (
            <p className="rounded-xl border border-hair bg-panel px-4 py-10 text-center text-[13px] text-text-3">
              No agents match this view — clear the rail&apos;s search or status filter.
            </p>
          ) : (
            <Body agents={query.visible} />
          )}
        </Surface>
      )}
      <PrototypeSwitcher
        variants={VARIANTS}
        current={active.key}
        onSelect={(key) => void setVariant(key)}
      />
    </>
  );
}
