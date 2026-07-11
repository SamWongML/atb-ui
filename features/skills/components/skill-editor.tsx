"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Surface } from "@/components/surface";
import { trpc } from "@/lib/trpc/react";
import { type Skill, type SkillInput, skillToInput } from "../schema";
import { SkillForm } from "./skill-form";

// Connected create/edit shell — thin glue binding the presentational SkillForm to the tRPC
// mutation and navigating on success, invalidating the cached list/detail. Validation lives
// in the schema, persistence in the router; this only wires them.
export function SkillEditor({ skill }: { skill?: Skill }) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const editing = !!skill;

  const done = (saved: Skill) => {
    void utils.skills.list.invalidate();
    void utils.skills.get.invalidate({ id: saved.id });
    router.push(`/skills/${saved.id}`);
  };

  const create = trpc.skills.create.useMutation({ onSuccess: done });
  const update = trpc.skills.update.useMutation({ onSuccess: done });
  const pending = create.isPending || update.isPending;

  const onSubmit = (values: SkillInput) => {
    if (skill) update.mutate({ id: skill.id, data: values });
    else create.mutate(values);
  };

  return (
    <Surface narrow className="gap-6">
      <header className="space-y-1">
        <Link
          href={skill ? `/skills/${skill.id}` : "/skills"}
          className="text-[12px] text-text-3 hover:text-text-2"
        >
          ← {skill ? skill.name : "Skills"}
        </Link>
        <h1 className="font-serif text-2xl font-medium tracking-tight text-text">
          {editing ? `Edit ${skill.name}` : "New skill"}
        </h1>
      </header>
      <SkillForm
        defaultValues={skill ? skillToInput(skill) : undefined}
        onSubmit={onSubmit}
        submitLabel={editing ? "Save changes" : "Create skill"}
        pending={pending}
      />
    </Surface>
  );
}
