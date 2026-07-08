import type { WorkflowConnection, WorkflowNode, WorkflowStatus, WorkflowTrigger } from "./schema";

// One source of truth for how workflow enums present — labels + semantic-token classes.
// Colors are token utilities, never hardcoded.
export const WORKFLOW_STATUS_META: Record<WorkflowStatus, { label: string; badgeClass: string }> = {
  active: { label: "Active", badgeClass: "bg-green-bg text-green" },
  paused: { label: "Paused", badgeClass: "bg-amber-bg text-amber" },
  draft: { label: "Draft", badgeClass: "bg-chip text-text-2" },
};

export const WORKFLOW_TRIGGER_META: Record<WorkflowTrigger, { label: string; badgeClass: string }> =
  {
    manual: { label: "Manual", badgeClass: "bg-chip text-text-2" },
    schedule: { label: "Schedule", badgeClass: "bg-blue-bg text-blue" },
    pr: { label: "On PR", badgeClass: "bg-violet-bg text-violet" },
  };

/**
 * Linearize a pipeline for display: start at the node with no incoming connection and follow
 * the connections from there. Any node the walk doesn't reach is appended in declaration order,
 * so no node is ever dropped.
 */
export function pipelineOrder(
  nodes: WorkflowNode[],
  connections: WorkflowConnection[],
): WorkflowNode[] {
  if (nodes.length === 0) return [];
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const nextOf = new Map(connections.map((c) => [c.from, c.to]));
  const hasIncoming = new Set(connections.map((c) => c.to));

  const ordered: WorkflowNode[] = [];
  const seen = new Set<string>();
  let cursor: WorkflowNode | undefined =
    nodes.find((node) => !hasIncoming.has(node.id)) ?? nodes[0];
  while (cursor && !seen.has(cursor.id)) {
    ordered.push(cursor);
    seen.add(cursor.id);
    const nextId = nextOf.get(cursor.id);
    cursor = nextId ? byId.get(nextId) : undefined;
  }
  for (const node of nodes) if (!seen.has(node.id)) ordered.push(node);
  return ordered;
}
