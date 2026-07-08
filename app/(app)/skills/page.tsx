import { SkillsList } from "@/features/skills/components/skills-list";
import { createServerCaller } from "@/server/trpc/caller";

// Skills. Routing glue only: the RSC reads the skill list from the BFF (tRPC) and hands it
// to the client list component.
export default async function SkillsPage() {
  const api = await createServerCaller();
  return <SkillsList skills={await api.skills.list()} />;
}
