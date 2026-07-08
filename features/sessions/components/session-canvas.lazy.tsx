"use client";

import dynamic from "next/dynamic";

// Code-split the canvas into its own chunk (ARCHITECTURE.md budget: "code-split the
// canvas & Shiki"). The detail route ships without the four canvas views or their Shiki
// dependency in its initial JS; they load when the session detail mounts.
export const LazySessionCanvas = dynamic(() =>
  import("./session-canvas").then((m) => m.SessionCanvas),
);
