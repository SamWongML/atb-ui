import { WorkflowEditor } from "@/features/workflows/components/workflow-editor";
import { orNotFound } from "@/lib/trpc/not-found";
import { createServerCaller } from "@/server/trpc/caller";

// Edit a workflow. Routing glue only: the RSC loads the workflow, then hands it to the
// connected form shell in edit mode. A missing id is a 404.
export default async function EditWorkflowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const api = await createServerCaller();
  const workflow = await orNotFound(api.workflows.get({ id }));
  return <WorkflowEditor workflow={workflow} />;
}
