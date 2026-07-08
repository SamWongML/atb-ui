import { SquadsList } from "@/features/squads/components/squads-list";
import { createServerCaller } from "@/server/trpc/caller";

// Squads. Routing glue only: the RSC reads the squad list from the BFF (tRPC) and hands it
// to the client list component.
export default async function SquadsPage() {
  const api = await createServerCaller();
  return <SquadsList squads={await api.squads.list()} />;
}
