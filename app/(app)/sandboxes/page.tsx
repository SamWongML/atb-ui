import { SandboxesList } from "@/features/sandboxes/components/sandboxes-list";
import { createServerCaller } from "@/server/trpc/caller";

// Sandboxes. Routing glue only: the RSC reads the environments from the BFF (tRPC) and hands
// them to the client list component.
export default async function SandboxesPage() {
  const api = await createServerCaller();
  return <SandboxesList sandboxes={await api.sandboxes.list()} />;
}
