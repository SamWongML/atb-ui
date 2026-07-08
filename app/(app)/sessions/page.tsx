import { SessionsList } from "@/features/sessions/components/sessions-list";
import { createServerCaller } from "@/server/trpc/caller";

// Sessions — the hero surface's grouped, virtualized list. Routing glue only: the RSC
// reads the session list from the BFF (tRPC) and hands it to the client list component.
export default async function SessionsPage() {
  const api = await createServerCaller();
  return <SessionsList sessions={await api.sessions.list()} />;
}
