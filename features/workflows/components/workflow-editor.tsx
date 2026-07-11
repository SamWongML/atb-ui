"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Surface } from "@/components/surface";
import { trpc } from "@/lib/trpc/react";
import { type Workflow, type WorkflowInput, workflowToInput } from "../schema";
import { WorkflowForm } from "./workflow-form";

// Connected create/edit shell — thin glue binding the presentational WorkflowForm to the
// tRPC mutation and navigating on success, invalidating the cached list/detail. Validation
// lives in the schema, persistence in the router; this only wires them.
export function WorkflowEditor({ workflow }: { workflow?: Workflow }) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const editing = !!workflow;

  const done = (saved: Workflow) => {
    void utils.workflows.list.invalidate();
    void utils.workflows.get.invalidate({ id: saved.id });
    router.push(`/workflows/${saved.id}`);
  };

  const create = trpc.workflows.create.useMutation({ onSuccess: done });
  const update = trpc.workflows.update.useMutation({ onSuccess: done });
  const pending = create.isPending || update.isPending;

  const onSubmit = (values: WorkflowInput) => {
    if (workflow) update.mutate({ id: workflow.id, data: values });
    else create.mutate(values);
  };

  return (
    <Surface narrow className="gap-6">
      <header className="space-y-1">
        <Link
          href={workflow ? `/workflows/${workflow.id}` : "/workflows"}
          className="text-[12px] text-text-3 hover:text-text-2"
        >
          ← {workflow ? workflow.name : "Workflows"}
        </Link>
        <h1 className="font-serif text-2xl font-medium tracking-tight text-text">
          {editing ? `Edit ${workflow.name}` : "New workflow"}
        </h1>
      </header>
      <WorkflowForm
        defaultValues={workflow ? workflowToInput(workflow) : undefined}
        onSubmit={onSubmit}
        submitLabel={editing ? "Save changes" : "Create workflow"}
        pending={pending}
      />
    </Surface>
  );
}
