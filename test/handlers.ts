import type { RequestHandler } from "msw";

// MSW request handlers for the test harness. With no real backend, feature slices
// register their downstream fakes here (SSE token streams, etc.). Server data now
// flows through the in-process tRPC BFF, so no REST session mock is needed.
export const handlers: RequestHandler[] = [];
