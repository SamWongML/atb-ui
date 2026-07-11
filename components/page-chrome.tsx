"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";

// Page chrome slot (ADR 0001). The app shell owns the header REGION; each page fills
// it. A page renders <PageHeader>…</PageHeader> and its content is portaled into the
// shell's header slot; when no page fills it, the shell shows the route-derived
// breadcrumb instead. This keeps the shell as a persistent frame while letting each
// screen own its top bar (the list-screen <ListRail>), without prop-drilling chrome
// through every layout.
//
// Rendered OUTSIDE a provider (e.g. a feature component under unit test), <PageHeader>
// renders its children inline, so screens that use it stay testable in isolation.

type PageChrome = {
  /** The header DOM node to portal into, or null before it mounts. */
  slot: HTMLElement | null;
  /** Register an active page header; returns an unregister. Stable identity. */
  register: () => () => void;
};

const PageChromeContext = createContext<PageChrome | null>(null);

// layoutEffect on the client (runs before paint, so the breadcrumb↔rail swap doesn't
// flash on client navigations); a no-op on the server to avoid the SSR warning.
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Provides the header slot. Renders `fallback` when no page header is active. */
export function PageChromeProvider({
  fallback,
  children,
  className,
}: {
  fallback: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const [activeCount, setActiveCount] = useState(0);

  const register = useCallback(() => {
    setActiveCount((count) => count + 1);
    return () => setActiveCount((count) => Math.max(0, count - 1));
  }, []);

  const chrome = useMemo<PageChrome>(() => ({ slot, register }), [slot, register]);

  return (
    <PageChromeContext.Provider value={chrome}>
      <header className={className}>
        {/* portal target — display:contents so portaled rows lay out as header's own */}
        <div ref={setSlot} className="contents" />
        {activeCount === 0 && fallback}
      </header>
      {children}
    </PageChromeContext.Provider>
  );
}

/** Fill the shell's header slot with page-specific chrome (the list-screen rail). */
export function PageHeader({ children }: { children: ReactNode }) {
  const chrome = useContext(PageChromeContext);

  useIsoLayoutEffect(() => {
    if (!chrome) return;
    return chrome.register();
  }, [chrome]);

  // No provider (unit test / standalone): render inline so the screen stays testable.
  if (!chrome) return <>{children}</>;
  // Provider present but slot not yet attached: render nothing this commit; the ref
  // callback re-renders us with the slot before paint.
  if (!chrome.slot) return null;
  return createPortal(children, chrome.slot);
}
