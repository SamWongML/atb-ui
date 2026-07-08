import { router } from "../trpc";
import { sessionsRouter } from "./sessions";

// The BFF's root router — the single typed surface the client is generated against.
export const appRouter = router({
  sessions: sessionsRouter,
});

export type AppRouter = typeof appRouter;
