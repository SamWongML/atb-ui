import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import { LIST_PREFS_COOKIE } from "@/lib/list-prefs";
import { server } from "./server";

// jsdom lacks the pointer-capture + scroll APIs Radix primitives (dropdown, popover,
// command menu) call on open. Polyfill them as no-ops so those components are
// exercisable through their real ARIA surface in tests.
Element.prototype.hasPointerCapture ??= () => false;
Element.prototype.setPointerCapture ??= () => {};
Element.prototype.releasePointerCapture ??= () => {};
Element.prototype.scrollIntoView ??= () => {};

// cmdk, TanStack Virtual, and Recharts observe their scroll/chart containers; jsdom has no
// ResizeObserver and never lays anything out (every rect is 0×0). Report a fixed viewport on
// observe so a virtualized list computes a non-empty range and a responsive chart gets a
// size in tests — the layout analogue of the pointer-capture shims above. The entry carries
// both the *BoxSize forms (TanStack Virtual) and contentRect (Recharts).
if (!globalThis.ResizeObserver) {
  const WIDTH = 800;
  const HEIGHT = 900;
  globalThis.ResizeObserver = class {
    #cb: ResizeObserverCallback;
    constructor(cb: ResizeObserverCallback) {
      this.#cb = cb;
    }
    observe(target: Element) {
      const box = { inlineSize: WIDTH, blockSize: HEIGHT } as ResizeObserverSize;
      const contentRect = {
        width: WIDTH,
        height: HEIGHT,
        top: 0,
        left: 0,
        right: WIDTH,
        bottom: HEIGHT,
        x: 0,
        y: 0,
      };
      const entry = { target, contentRect, borderBoxSize: [box], contentBoxSize: [box] };
      this.#cb([entry as unknown as ResizeObserverEntry], this);
    }
    unobserve() {}
    disconnect() {}
  };
}

// Every test runs against MSW. Unhandled requests fail loudly so a missing
// mock is a test error, not a silent hang.
beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  server.resetHandlers();
  cleanup();
  // Expire the list-prefs cookie so a persisted view from one test can't leak into the next.
  // biome-ignore lint/suspicious/noDocumentCookie: sync cookie clear for test isolation; the Cookie Store API is async and unavailable in jsdom.
  document.cookie = `${LIST_PREFS_COOKIE}=; path=/; max-age=0`;
});

afterAll(() => {
  server.close();
});
