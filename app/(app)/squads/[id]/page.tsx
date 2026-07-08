import { SquadDetail } from "@/features/squads/components/squad-detail";
import { orNotFound } from "@/lib/trpc/not-found";
import { createServerCaller } from "@/server/trpc/caller";

// Squad detail. Routing glue only: the RSC reads one squad from the BFF and renders the
// read-only detail view. A missing id is a 404.
export default async function SquadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const api = await createServerCaller();
  const squad = await orNotFound(api.squads.get({ id }));
  return <SquadDetail squad={squad} />;
}
