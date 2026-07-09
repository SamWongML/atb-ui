import { OverviewHome } from "@/features/overview/components/overview-home";
import { createServerCaller } from "@/server/trpc/caller";

// Overview. Routing glue only: the RSC reads the composed home summary from the BFF (tRPC)
// and hands it to the home component.
export default async function OverviewPage() {
  const api = await createServerCaller();
  return <OverviewHome summary={await api.overview.summary()} />;
}
