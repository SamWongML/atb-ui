import { SkillEditor } from "@/features/skills/components/skill-editor";

// Create a skill. Routing glue only: renders the connected form shell in create mode.
export default function NewSkillPage() {
  return <SkillEditor />;
}
