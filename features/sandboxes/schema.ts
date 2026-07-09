import { z } from "zod";

// One Zod schema per shape, shared by the client and the BFF router (CONTEXT.md).
// A Sandbox is a compute environment agents run inside (CONTEXT.md §Domain).

/** Lifecycle: running (blue, pulses) · idle (amber, warm but unused) · stopped (neutral). */
export const SANDBOX_STATUSES = ["running", "idle", "stopped"] as const;
export const sandboxStatusSchema = z.enum(SANDBOX_STATUSES);
export type SandboxStatus = z.infer<typeof sandboxStatusSchema>;

export const sandboxSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: sandboxStatusSchema,
  /** Base image the environment boots from (e.g. "node-22-bookworm"). */
  image: z.string(),
  /** Provisioned compute, pre-formatted (e.g. "4 vCPU · 8 GB"). */
  resources: z.string(),
  region: z.string(),
  /** How long it has been up, pre-formatted (e.g. "3h 12m"); "—" when stopped. */
  uptime: z.string(),
  /** The repository checked out inside it. */
  repo: z.string(),
  /** Agent names currently running inside it. */
  usedBy: z.array(z.string()),
});
export type Sandbox = z.infer<typeof sandboxSchema>;

export const sandboxListSchema = z.array(sandboxSchema);
