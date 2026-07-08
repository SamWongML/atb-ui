import { notFound } from "next/navigation";
import { SessionCanvas } from "@/features/sessions/components/session-canvas";
import { SessionView } from "@/features/sessions/components/session-view";
import { getSessionCanvas } from "@/server/services/sessions";

// Session detail — the streaming transcript + steering (Phase 1) beside the canvas (Plan
// / Run / Diff / Trace). Routing glue only: the RSC reads the canvas from the BFF and
// hands it down; the transcript streams itself through reconcile().
export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const canvas = getSessionCanvas(id);
  if (!canvas) notFound();

  return (
    <div className="grid h-full min-h-0 gap-6 lg:grid-cols-2">
      <div className="min-w-0">
        <SessionView sessionId={id} />
      </div>
      <SessionCanvas canvas={canvas} />
    </div>
  );
}
