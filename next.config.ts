import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained Node server for the small ECS Fargate image (ARCHITECTURE.md).
  output: "standalone",
  reactStrictMode: true,
  // Real backend does not exist yet; the BFF/route handlers are added in Phase 1.
  // Keep the build lean and type-safe.
  typedRoutes: true,
};

export default nextConfig;
