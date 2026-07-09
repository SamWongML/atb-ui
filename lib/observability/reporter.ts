import { ZodError } from "zod";

// Vendor-neutral observability seam (ROADMAP Phase 5; TECH_STACK.md §L9 — Sentry
// errors · PostHog events · OpenTelemetry). Feature code depends on this Reporter
// interface, never on a vendor SDK, so the sink is swapped in one place. The default
// `reporter` writes to the console; a real Sentry/PostHog/OTel reporter replaces it.

export type Reporter = {
  /** Report a caught error with structured context (→ Sentry / OTel). */
  captureError(error: unknown, context?: Record<string, unknown>): void;
  /** Report a named product/telemetry event (→ PostHog / OTel). */
  captureEvent(name: string, props?: Record<string, unknown>): void;
};

/**
 * Capture a realtime failure, distinguishing a malformed frame (a Zod rejection at a
 * stream boundary — the backend sent something off-contract) from a transport error,
 * so dashboards can tell a bad-data problem from a connectivity one.
 */
export function reportStreamError(reporter: Reporter, error: unknown): void {
  const kind = error instanceof ZodError ? "malformed-frame" : "transport";
  reporter.captureError(error, { source: "realtime", kind });
}

/** The default console reporter — a real sink, replaced wholesale by a vendor reporter. */
export function createConsoleReporter(): Reporter {
  return {
    captureError: (error, context) => console.error("[observability] error", error, context),
    captureEvent: (name, props) => console.info("[observability] event", name, props),
  };
}

/** The process-wide reporter the app reports through. Swap the construction to adopt a vendor. */
export const reporter: Reporter = createConsoleReporter();
