import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// The single "New <entity>" header CTA used on every list surface (Agents, Workflows,
// Squads, Skills, MCP servers). Centralised so the primary create action looks and
// behaves identically everywhere; the look is the tokenised `soft` Button variant
// (soft clay on the brand tokens) rather than a hand-rolled className per screen.
export function NewButton({ href, label }: { href: string; label: string }) {
  return (
    <Button asChild variant="soft">
      <Link href={href}>
        <Plus /> {label}
      </Link>
    </Button>
  );
}
