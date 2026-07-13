import { SquadsList } from "@/features/squads/components/squads-list";
import { listSquads } from "@/server/trpc/reads";

// Squads. Routing glue only: the RSC reads the squad list from the BFF (tRPC) and hands it to the
// client list component. Reads through the shared cached reader so this page and its @header slot
// collapse to one BFF call per request (ADR 0002).
export default async function SquadsPage() {
  return <SquadsList squads={await listSquads()} />;
}
