import { Compass } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { Surface } from "@/components/surface";
import { Button } from "@/components/ui/button";

// The in-shell 404, rendered inside app/(app)/layout.tsx whenever a segment throws notFound() —
// which the detail/edit pages do via orNotFound() when an entity is gone (a live path in a
// realtime console where things get deleted mid-session). Keeps a missing item on the branded
// shell with a way back, instead of Next's bare default 404 page. (ADR 0002.)
export default function AppNotFound() {
  return (
    <Surface narrow>
      <EmptyState
        icon={Compass}
        title="We couldn't find that"
        description="The page or item you're looking for doesn't exist, or it may have been moved or deleted."
        action={
          <Button asChild variant="soft" size="sm">
            <Link href="/overview">Back to overview</Link>
          </Button>
        }
      />
    </Surface>
  );
}
