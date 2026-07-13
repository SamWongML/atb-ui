import { SkillsRail } from "@/features/skills/components/skills-rail";
import { listSkills } from "@/server/trpc/reads";

// The Skills rail, server-rendered into the shell @header slot so a hard refresh paints the full
// rail on the first frame (ADR 0002). Routing glue only; data from the BFF, deduped via cache().
export default async function SkillsHeader() {
  return <SkillsRail skills={await listSkills()} />;
}
