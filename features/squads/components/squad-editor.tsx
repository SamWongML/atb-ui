"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Surface } from "@/components/surface";
import { trpc } from "@/lib/trpc/react";
import { type Squad, type SquadInput, squadToInput } from "../schema";
import { SquadForm } from "./squad-form";

// Connected create/edit shell — thin glue binding the presentational SquadForm to the tRPC
// mutation and navigating on success, invalidating the cached list/detail. Validation lives
// in the schema, persistence in the router; this only wires them.
export function SquadEditor({ squad }: { squad?: Squad }) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const editing = !!squad;

  const done = (saved: Squad) => {
    void utils.squads.list.invalidate();
    void utils.squads.get.invalidate({ id: saved.id });
    router.push(`/squads/${saved.id}`);
  };

  const create = trpc.squads.create.useMutation({ onSuccess: done });
  const update = trpc.squads.update.useMutation({ onSuccess: done });
  const pending = create.isPending || update.isPending;

  const onSubmit = (values: SquadInput) => {
    if (squad) update.mutate({ id: squad.id, data: values });
    else create.mutate(values);
  };

  return (
    <Surface narrow className="gap-6">
      <header className="space-y-1">
        <Link
          href={squad ? `/squads/${squad.id}` : "/squads"}
          className="text-[12px] text-text-3 hover:text-text-2"
        >
          ← {squad ? squad.name : "Squads"}
        </Link>
        <h1 className="font-serif text-2xl font-medium tracking-tight text-text">
          {editing ? `Edit ${squad.name}` : "New squad"}
        </h1>
      </header>
      <SquadForm
        defaultValues={squad ? squadToInput(squad) : undefined}
        onSubmit={onSubmit}
        submitLabel={editing ? "Save changes" : "Create squad"}
        pending={pending}
      />
    </Surface>
  );
}
