import { SkillEditor } from "@/features/skills/components/skill-editor";
import { orNotFound } from "@/lib/trpc/not-found";
import { createServerCaller } from "@/server/trpc/caller";

// Edit a skill. Routing glue only: the RSC loads the skill, then hands it to the connected
// form shell in edit mode. A missing id is a 404.
export default async function EditSkillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const api = await createServerCaller();
  const skill = await orNotFound(api.skills.get({ id }));
  return <SkillEditor skill={skill} />;
}
