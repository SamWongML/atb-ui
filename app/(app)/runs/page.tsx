import { RunsList } from "@/features/runs/components/runs-list";
import { createServerCaller } from "@/server/trpc/caller";

// Runs. Routing glue only: the RSC reads the run history from the BFF (tRPC) and hands it
// to the client list component.
export default async function RunsPage() {
  const api = await createServerCaller();
  return <RunsList runs={await api.runs.list()} />;
}
