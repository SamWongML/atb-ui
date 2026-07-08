import { sessionListSchema } from "@/features/sessions/schema";
import { listSessions } from "@/server/services/sessions";
import { protectedProcedure, router } from "../trpc";

// Sessions router. Validates the downstream shape at the BFF boundary (schema.parse)
// so a malformed payload is a caught error, never a silent leak to the client. The
// canvas snapshot is read + validated by the RSC detail page and then kept live through
// reconcile(), so it needs no procedure here.
export const sessionsRouter = router({
  list: protectedProcedure.query(() => sessionListSchema.parse(listSessions())),
});
