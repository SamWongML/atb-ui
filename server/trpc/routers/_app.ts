import { router } from "../trpc";
import { agentsRouter } from "./agents";
import { analyticsRouter } from "./analytics";
import { mcpRouter } from "./mcp";
import { overviewRouter } from "./overview";
import { runsRouter } from "./runs";
import { sandboxesRouter } from "./sandboxes";
import { sessionsRouter } from "./sessions";
import { skillsRouter } from "./skills";
import { squadsRouter } from "./squads";
import { workflowsRouter } from "./workflows";

// The BFF's root router — the single typed surface the client is generated against.
export const appRouter = router({
  sessions: sessionsRouter,
  agents: agentsRouter,
  mcp: mcpRouter,
  skills: skillsRouter,
  workflows: workflowsRouter,
  squads: squadsRouter,
  runs: runsRouter,
  sandboxes: sandboxesRouter,
  analytics: analyticsRouter,
  overview: overviewRouter,
});

export type AppRouter = typeof appRouter;
