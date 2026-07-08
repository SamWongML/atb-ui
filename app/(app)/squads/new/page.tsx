import { SquadEditor } from "@/features/squads/components/squad-editor";

// Create a squad. Routing glue only: renders the connected form shell in create mode.
export default function NewSquadPage() {
  return <SquadEditor />;
}
