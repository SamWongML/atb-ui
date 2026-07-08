import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { TRPCProvider } from "@/lib/trpc/provider";
import { getServerSession } from "@/server/auth/server";
import { listSessions } from "@/server/services/sessions";

// The authenticated app shell wraps every (app) surface (FOLDER_STRUCTURE.md). The
// middleware guarantees a session here; we read it to hydrate the account block, seed
// the shell's sidebar count + breadcrumb entity switcher, and mount the tRPC + Query
// providers the surfaces render from.
export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();
  return (
    <TRPCProvider>
      <AppShell user={session?.user} sessions={listSessions()}>
        {children}
      </AppShell>
    </TRPCProvider>
  );
}
