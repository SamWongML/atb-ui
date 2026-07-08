import { SessionView } from "@/features/sessions/components/session-view";

// Session detail — the streaming transcript + steering controls. Routing glue only.
export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SessionView sessionId={id} />;
}
