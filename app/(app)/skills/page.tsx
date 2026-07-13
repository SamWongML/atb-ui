import { SkillsList } from "@/features/skills/components/skills-list";
import { listSkills } from "@/server/trpc/reads";

// Skills. Routing glue only: the RSC reads the skill list from the BFF (tRPC) and hands it to the
// client list component. Reads through the shared cached reader so this page and its @header slot
// collapse to one BFF call per request (ADR 0002).
export default async function SkillsPage() {
  return <SkillsList skills={await listSkills()} />;
}
