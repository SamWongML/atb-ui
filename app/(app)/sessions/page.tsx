import { SessionsList } from "@/features/sessions/components/sessions-list";
import { listSessions } from "@/server/services/sessions";

// Sessions — the hero surface's grouped, virtualized list. Routing glue only: the RSC
// reads the BFF's session list and hands it to the client list component as a prop.
export default function SessionsPage() {
  return <SessionsList sessions={listSessions()} />;
}
