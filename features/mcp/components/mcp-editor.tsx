"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Surface } from "@/components/surface";
import { trpc } from "@/lib/trpc/react";
import { type McpInput, type McpServer, mcpToInput } from "../schema";
import { McpForm } from "./mcp-form";

// Connected connect/edit shell — thin glue binding the presentational McpForm to the tRPC
// mutation and navigating on success, invalidating the cached list/detail. Validation lives
// in the schema, persistence in the router; this only wires them.
export function McpEditor({ server }: { server?: McpServer }) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const editing = !!server;

  const done = (saved: McpServer) => {
    void utils.mcp.list.invalidate();
    void utils.mcp.get.invalidate({ id: saved.id });
    router.push(`/mcp/${saved.id}`);
  };

  const create = trpc.mcp.create.useMutation({ onSuccess: done });
  const update = trpc.mcp.update.useMutation({ onSuccess: done });
  const pending = create.isPending || update.isPending;

  const onSubmit = (values: McpInput) => {
    if (server) update.mutate({ id: server.id, data: values });
    else create.mutate(values);
  };

  return (
    <Surface narrow className="gap-6">
      <header className="space-y-1">
        <Link
          href={server ? `/mcp/${server.id}` : "/mcp"}
          className="text-[12px] text-text-3 hover:text-text-2"
        >
          ← {server ? server.name : "MCP servers"}
        </Link>
        <h1 className="font-serif text-2xl font-medium tracking-tight text-text">
          {editing ? `Edit ${server.name}` : "Connect server"}
        </h1>
      </header>
      <McpForm
        defaultValues={server ? mcpToInput(server) : undefined}
        onSubmit={onSubmit}
        submitLabel={editing ? "Save changes" : "Connect server"}
        pending={pending}
      />
    </Surface>
  );
}
