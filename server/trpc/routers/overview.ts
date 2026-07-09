import { overviewSummarySchema } from "@/features/overview/schema";
import { overviewSummary } from "@/server/services/overview";
import { protectedProcedure, router } from "../trpc";

// Overview router. Read-only: the composed home summary validates its shape at the BFF
// boundary. It reads across the other stores (server/services/overview.ts); the router's
// contract is unchanged when those become downstream clients.
export const overviewRouter = router({
  summary: protectedProcedure.query(() => overviewSummarySchema.parse(overviewSummary())),
});
