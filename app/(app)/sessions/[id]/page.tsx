import { notFound } from "next/navigation";
import { sessionCanvasSchema } from "@/features/sessions/canvas";
import { LazySessionCanvas } from "@/features/sessions/components/session-canvas.lazy";
import { SessionView } from "@/features/sessions/components/session-view";
import { getSessionCanvas } from "@/server/services/sessions";

// Session detail — the streaming transcript + steering (Phase 1) beside the canvas (Plan
// / Run / Diff / Trace). Routing glue only: the RSC validates the canvas snapshot at the
// BFF boundary and seeds it; both surfaces then update live through reconcile(). The
// canvas ships in a code-split chunk (LazySessionCanvas).
export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const seed = getSessionCanvas(id);
  if (!seed) notFound();
  const initialCanvas = sessionCanvasSchema.parse(seed);

  return (
    <div className="grid h-full min-h-0 gap-6 lg:grid-cols-2">
      <div className="min-w-0">
        <SessionView sessionId={id} />
      </div>
      <div className="min-h-0 px-surface-x pt-surface-t pb-surface-t lg:pl-0">
        <LazySessionCanvas sessionId={id} initialCanvas={initialCanvas} />
      </div>
    </div>
  );
}
