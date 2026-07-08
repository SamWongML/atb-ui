import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { TRPCProvider } from "@/lib/trpc/provider";
import { getServerSession } from "@/server/auth/server";

// The authenticated app shell wraps every (app) surface (FOLDER_STRUCTURE.md). The
// middleware guarantees a session here; we read it to hydrate the account block and
// mount the tRPC + Query providers the surfaces render from.
export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();
  return (
    <TRPCProvider>
      <AppShell user={session?.user}>{children}</AppShell>
    </TRPCProvider>
  );
}
