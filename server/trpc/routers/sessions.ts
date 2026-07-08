import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { sessionCanvasSchema } from "@/features/sessions/canvas";
import { sessionListSchema } from "@/features/sessions/schema";
import { getSessionCanvas, listSessions } from "@/server/services/sessions";
import { protectedProcedure, router } from "../trpc";

// Sessions router. Validates the downstream shape at the BFF boundary (schema.parse)
// so a malformed payload is a caught error, never a silent leak to the client.
export const sessionsRouter = router({
  list: protectedProcedure.query(() => sessionListSchema.parse(listSessions())),

  canvas: protectedProcedure.input(z.object({ sessionId: z.string() })).query(({ input }) => {
    const canvas = getSessionCanvas(input.sessionId);
    if (!canvas) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Session not found" });
    }
    return sessionCanvasSchema.parse(canvas);
  }),
});
