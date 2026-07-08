import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  type Skill,
  type SkillInput,
  skillInputSchema,
  skillListSchema,
  skillSchema,
} from "@/features/skills/schema";
import { skillsStore } from "@/server/services/skills";
import { slugId } from "@/server/services/store-id";
import { protectedProcedure, router } from "../trpc";

// Skills router. Reads validate the seed shape at the BFF boundary; writes validate their
// input with the form's schema and stamp the caller as author. A new skill starts as a
// draft with an empty tool/step roster and a single-entry version history.

function requireSkill(id: string): Skill {
  const skill = skillsStore.get(id);
  if (!skill) throw new TRPCError({ code: "NOT_FOUND", message: `Skill ${id} not found` });
  return skill;
}

// A version bump publishes a new history entry so the headline version and its history never
// disagree; editing other fields at the same version leaves the history untouched.
function editPatch(current: Skill, data: SkillInput): Partial<Skill> {
  if (data.version === current.version) return data;
  return {
    ...data,
    versionHistory: [
      { version: data.version, when: "just now", note: "Updated" },
      ...current.versionHistory,
    ],
  };
}

function newSkill(input: SkillInput, author: string): Skill {
  const id = slugId(
    input.name,
    skillsStore.list().map((s) => s.id),
  );
  return skillSchema.parse({
    ...input,
    id,
    slug: id,
    status: "draft",
    author,
    tools: [],
    steps: [],
    usedBy: 0,
    invocations: "—",
    updated: "just now",
    versionHistory: [{ version: input.version, when: "just now", note: "Draft created" }],
  });
}

export const skillsRouter = router({
  list: protectedProcedure.query(() => skillListSchema.parse(skillsStore.list())),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => skillSchema.parse(requireSkill(input.id))),

  create: protectedProcedure
    .input(skillInputSchema)
    .mutation(({ input, ctx }) => skillsStore.create(newSkill(input, ctx.session.user.name))),

  update: protectedProcedure
    .input(z.object({ id: z.string(), data: skillInputSchema }))
    .mutation(({ input }) => {
      const current = requireSkill(input.id);
      return skillSchema.parse(skillsStore.update(input.id, editPatch(current, input.data)));
    }),
});
