import { WorkflowDetail } from "@/features/workflows/components/workflow-detail";
import { orNotFound } from "@/lib/trpc/not-found";
import { createServerCaller } from "@/server/trpc/caller";

// Workflow detail. Routing glue only: the RSC reads one workflow from the BFF and renders
// the read-only detail view. A missing id is a 404.
export default async function WorkflowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const api = await createServerCaller();
  const workflow = await orNotFound(api.workflows.get({ id }));
  return <WorkflowDetail workflow={workflow} />;
}
