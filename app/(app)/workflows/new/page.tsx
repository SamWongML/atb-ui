import { WorkflowEditor } from "@/features/workflows/components/workflow-editor";

// Create a workflow. Routing glue only: renders the connected form shell in create mode.
export default function NewWorkflowPage() {
  return <WorkflowEditor />;
}
