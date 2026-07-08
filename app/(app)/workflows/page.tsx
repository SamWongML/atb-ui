import { WorkflowsList } from "@/features/workflows/components/workflows-list";
import { createServerCaller } from "@/server/trpc/caller";

// Workflows. Routing glue only: the RSC reads the workflow list from the BFF (tRPC) and
// hands it to the client list component.
export default async function WorkflowsPage() {
  const api = await createServerCaller();
  return <WorkflowsList workflows={await api.workflows.list()} />;
}
