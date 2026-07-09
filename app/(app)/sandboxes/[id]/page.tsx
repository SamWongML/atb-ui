import { SandboxDetail } from "@/features/sandboxes/components/sandbox-detail";
import { orNotFound } from "@/lib/trpc/not-found";
import { createServerCaller } from "@/server/trpc/caller";

// Sandbox detail. Routing glue only: the RSC reads one sandbox from the BFF and renders the
// read-only detail view. A missing id is a 404.
export default async function SandboxDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const api = await createServerCaller();
  const sandbox = await orNotFound(api.sandboxes.get({ id }));
  return <SandboxDetail sandbox={sandbox} />;
}
