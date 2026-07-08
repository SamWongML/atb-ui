import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./server";

// jsdom lacks the pointer-capture + scroll APIs Radix primitives (dropdown, popover,
// command menu) call on open. Polyfill them as no-ops so those components are
// exercisable through their real ARIA surface in tests.
Element.prototype.hasPointerCapture ??= () => false;
Element.prototype.setPointerCapture ??= () => {};
Element.prototype.releasePointerCapture ??= () => {};
Element.prototype.scrollIntoView ??= () => {};

// cmdk and TanStack Virtual observe their scroll containers; jsdom has no
// ResizeObserver and never lays anything out (every rect is 0×0). Report a fixed
// viewport on observe so a virtualized list computes a non-empty range in tests —
// the layout analogue of the pointer-capture shims above.
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    #cb: ResizeObserverCallback;
    constructor(cb: ResizeObserverCallback) {
      this.#cb = cb;
    }
    observe(target: Element) {
      const box = { inlineSize: 800, blockSize: 900 } as ResizeObserverSize;
      const entry = { target, borderBoxSize: [box], contentBoxSize: [box] };
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
});

afterAll(() => {
  server.close();
});
