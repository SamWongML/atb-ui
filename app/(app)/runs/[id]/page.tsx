import { RunDetail } from "@/features/runs/components/run-detail";
import { orNotFound } from "@/lib/trpc/not-found";
import { createServerCaller } from "@/server/trpc/caller";

// Run detail. Routing glue only: the RSC reads one run from the BFF and renders the
// read-only detail view. A missing id is a 404.
export default async function RunDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const api = await createServerCaller();
  const run = await orNotFound(api.runs.get({ id }));
  return <RunDetail run={run} />;
}
