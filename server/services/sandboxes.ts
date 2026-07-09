import type { Sandbox } from "@/features/sandboxes/schema";
import { createStore } from "./store";

// The BFF's sandboxes data source — an in-memory seed (verbatim from the design mockup)
// behind the shared read store. Sandboxes are the compute environments agents run inside;
// each carries its image, provisioned compute, region, and the agents currently in it. When
// the compute plane comes online this becomes a downstream client and the router is unchanged.
function seedSandboxes(): Sandbox[] {
  return [
    {
      id: "meridian-api-sbx",
      name: "meridian-api-sbx",
      status: "running",
      image: "node-22-bookworm",
      resources: "4 vCPU · 8 GB",
      region: "us-east-1",
      uptime: "3h 12m",
      repo: "meridian/api",
      usedBy: ["BD", "SR"],
    },
    {
      id: "ml-notebooks",
      name: "ml-notebooks",
      status: "running",
      image: "python-3.12-cuda",
      resources: "8 vCPU · 32 GB",
      region: "us-west-2",
      uptime: "1d 4h",
      repo: "meridian/ml",
      usedBy: ["RC"],
    },
    {
      id: "web-e2e-sbx",
      name: "web-e2e-sbx",
      status: "idle",
      image: "playwright-jammy",
      resources: "2 vCPU · 4 GB",
      region: "us-east-1",
      uptime: "18m",
      repo: "meridian/web",
      usedBy: ["TR"],
    },
    {
      id: "docs-preview",
      name: "docs-preview",
      status: "running",
      image: "node-22-bookworm",
      resources: "1 vCPU · 2 GB",
      region: "us-east-1",
      uptime: "42m",
      repo: "meridian/docs",
      usedBy: ["DW"],
    },
    {
      id: "infra-plan-sbx",
      name: "infra-plan-sbx",
      status: "stopped",
      image: "ubuntu-24.04",
      resources: "2 vCPU · 4 GB",
      region: "eu-west-1",
      uptime: "—",
      repo: "meridian/infra",
      usedBy: [],
    },
  ];
}

export const sandboxesStore = createStore(seedSandboxes);
