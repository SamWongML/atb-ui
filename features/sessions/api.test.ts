import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "@/test/server";
import { fetchSessions } from "./api";

describe("fetchSessions", () => {
  it("returns the sessions served by the mock BFF", async () => {
    const sessions = await fetchSessions();

    // Known-good literals from the mock harness (test/handlers.ts).
    expect(sessions).toHaveLength(3);
    const first = sessions[0];
    expect(first?.title).toBe("Refactor auth module");
    expect(first?.status).toBe("needs_you");
    expect(first?.steps).toEqual({ completed: 3, total: 5 });
  });

  it("groups by the four session statuses the UI renders", async () => {
    const sessions = await fetchSessions();
    const statuses = new Set(sessions.map((s) => s.status));
    // Needs you / Active / Ready to review — all valid, none unexpected.
    expect(statuses).toEqual(new Set(["needs_you", "active", "review"]));
  });

  it("rejects a malformed stream frame instead of returning undefined", async () => {
    // A bad status must be a caught error at the Zod boundary (ARCHITECTURE.md).
    server.use(
      http.get("*/api/sessions", () =>
        HttpResponse.json([
          {
            id: "sess_bad",
            title: "corrupt",
            status: "explod",
            steps: { completed: 0, total: 1 },
            updatedAt: "2026-07-07T10:00:00.000Z",
          },
        ]),
      ),
    );

    await expect(fetchSessions()).rejects.toThrow();
  });
});
