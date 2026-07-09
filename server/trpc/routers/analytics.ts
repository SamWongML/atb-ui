import { analyticsSchema } from "@/features/analytics/schema";
import { analyticsSnapshot } from "@/server/services/analytics";
import { protectedProcedure, router } from "../trpc";

// Analytics router. Read-only: the rolled-up snapshot validates its shape at the BFF boundary.
// When the metering pipeline comes online this router's contract is unchanged.
export const analyticsRouter = router({
  summary: protectedProcedure.query(() => analyticsSchema.parse(analyticsSnapshot())),
});
