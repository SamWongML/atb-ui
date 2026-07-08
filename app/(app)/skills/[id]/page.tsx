import { SkillDetail } from "@/features/skills/components/skill-detail";
import { orNotFound } from "@/lib/trpc/not-found";
import { createServerCaller } from "@/server/trpc/caller";

// Skill detail. Routing glue only: the RSC reads one skill from the BFF and renders the
// read-only detail view. A missing id is a 404.
export default async function SkillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const api = await createServerCaller();
  const skill = await orNotFound(api.skills.get({ id }));
  return <SkillDetail skill={skill} />;
}
