import { describe, expect, it, vi } from "vitest";
import { realtimeEventSchema } from "@/features/sessions/realtime";
import { type Reporter, reportStreamError } from "./reporter";

// Seam: the vendor-neutral Reporter interface (ROADMAP Phase 5 — observability;
// TECH_STACK.md §L9: Sentry errors + PostHog events + OTel). Tests exercise the
// classifier that decides how a realtime failure is captured — never a concrete vendor.

function spyReporter() {
  const captureError = vi.fn<(error: unknown, context?: Record<string, unknown>) => void>();
  const captureEvent = vi.fn<(name: string, props?: Record<string, unknown>) => void>();
  return { captureError, captureEvent } satisfies Reporter;
}

describe("reportStreamError", () => {
  it("tags a malformed frame (schema rejection) distinctly from a transport error", () => {
    const reporter = spyReporter();
    const zodError = realtimeEventSchema.safeParse({ type: "bogus" }).error;

    reportStreamError(reporter, zodError);

    expect(reporter.captureError).toHaveBeenCalledWith(zodError, {
      source: "realtime",
      kind: "malformed-frame",
    });
  });

  it("tags a connection failure as a transport error", () => {
    const reporter = spyReporter();
    const error = new Error("control socket error");

    reportStreamError(reporter, error);

    expect(reporter.captureError).toHaveBeenCalledWith(error, {
      source: "realtime",
      kind: "transport",
    });
  });
});
