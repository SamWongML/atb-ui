import { WorkflowsList } from "@/features/workflows/components/workflows-list";
import { listWorkflows } from "@/server/trpc/reads";

// Workflows. Routing glue only: the RSC reads the workflow list from the BFF (tRPC) and hands it
// to the client list component. Reads through the shared cached reader so this page and its @header
// slot collapse to one BFF call per request (ADR 0002).
export default async function WorkflowsPage() {
  return <WorkflowsList workflows={await listWorkflows()} />;
}
