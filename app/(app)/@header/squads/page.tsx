import { SquadsRail } from "@/features/squads/components/squads-rail";
import { listSquads } from "@/server/trpc/reads";

// The Squads rail, server-rendered into the shell @header slot so a hard refresh paints the full
// rail on the first frame (ADR 0002). Routing glue only; data from the BFF, deduped via cache().
export default async function SquadsHeader() {
  return <SquadsRail squads={await listSquads()} />;
}
