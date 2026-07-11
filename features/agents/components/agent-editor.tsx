"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Surface } from "@/components/surface";
import { trpc } from "@/lib/trpc/react";
import { type Agent, type AgentInput, agentToInput } from "../schema";
import { AgentForm } from "./agent-form";

// Connected create/edit shell — thin glue that binds the presentational AgentForm to the
// tRPC mutation (the write half of the BFF contract) and navigates on success, invalidating
// the cached list/detail so the roster reflects the change. Business rules live in the
// schema (validation) and the router (persistence); this only wires them together.
export function AgentEditor({ agent }: { agent?: Agent }) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const editing = !!agent;

  const done = (saved: Agent) => {
    void utils.agents.list.invalidate();
    void utils.agents.get.invalidate({ id: saved.id });
    router.push(`/agents/${saved.id}`);
  };

  const create = trpc.agents.create.useMutation({ onSuccess: done });
  const update = trpc.agents.update.useMutation({ onSuccess: done });
  const pending = create.isPending || update.isPending;

  const onSubmit = (values: AgentInput) => {
    if (agent) update.mutate({ id: agent.id, data: values });
    else create.mutate(values);
  };

  return (
    <Surface narrow className="gap-6">
      <header className="space-y-1">
        <Link
          href={agent ? `/agents/${agent.id}` : "/agents"}
          className="text-[12px] text-text-3 hover:text-text-2"
        >
          ← {agent ? agent.name : "Agents"}
        </Link>
        <h1 className="font-serif text-2xl font-medium tracking-tight text-text">
          {editing ? `Edit ${agent.name}` : "New agent"}
        </h1>
      </header>
      <AgentForm
        defaultValues={agent ? agentToInput(agent) : undefined}
        onSubmit={onSubmit}
        submitLabel={editing ? "Save changes" : "Create agent"}
        pending={pending}
      />
    </Surface>
  );
}
