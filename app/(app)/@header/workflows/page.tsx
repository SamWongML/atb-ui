import { WorkflowsRail } from "@/features/workflows/components/workflows-rail";
import { listWorkflows } from "@/server/trpc/reads";

// The Workflows rail, server-rendered into the shell @header slot so a hard refresh paints the full
// rail on the first frame (ADR 0002). Routing glue only; data from the BFF, deduped via cache().
export default async function WorkflowsHeader() {
  return <WorkflowsRail workflows={await listWorkflows()} />;
}
