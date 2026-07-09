import { AnalyticsDashboard } from "@/features/analytics/components/analytics-dashboard";
import { createServerCaller } from "@/server/trpc/caller";

// Analytics. Routing glue only: the RSC reads the rolled-up snapshot from the BFF (tRPC) and
// hands it to the dashboard.
export default async function AnalyticsPage() {
  const api = await createServerCaller();
  return <AnalyticsDashboard data={await api.analytics.summary()} />;
}
