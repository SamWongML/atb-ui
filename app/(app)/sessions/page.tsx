import Link from "next/link";
import { RoutePlaceholder } from "@/components/route-placeholder";

export default function SessionsPage() {
  return (
    <div className="space-y-6">
      <RoutePlaceholder
        title="Sessions"
        description="The grouped, virtualized sessions list and streaming detail. (Phase 2)"
      />
      <div className="mx-auto max-w-3xl">
        <Link
          href="/sessions/sess_01"
          className="inline-flex items-center gap-2 rounded-lg border border-primary-soft-bd bg-primary-soft px-3.5 py-2 text-[13px] font-medium text-primary transition-colors hover:bg-primary-bg"
        >
          Open a live demo session →
        </Link>
      </div>
    </div>
  );
}
