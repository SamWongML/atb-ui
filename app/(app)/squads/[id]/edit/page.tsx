import { SquadEditor } from "@/features/squads/components/squad-editor";
import { orNotFound } from "@/lib/trpc/not-found";
import { createServerCaller } from "@/server/trpc/caller";

// Edit a squad. Routing glue only: the RSC loads the squad, then hands it to the connected
// form shell in edit mode. A missing id is a 404.
export default async function EditSquadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const api = await createServerCaller();
  const squad = await orNotFound(api.squads.get({ id }));
  return <SquadEditor squad={squad} />;
}
