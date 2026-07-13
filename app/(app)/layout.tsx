import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { LIST_PREFS_COOKIE, parseListPrefs } from "@/lib/list-prefs";
import { ListPrefsProvider } from "@/lib/list-prefs-provider";
import { TRPCProvider } from "@/lib/trpc/provider";
import { getServerSession } from "@/server/auth/server";
import { serverCaller } from "@/server/trpc/caller";

// The authenticated app shell wraps every (app) surface (FOLDER_STRUCTURE.md). The
// middleware guarantees a session here; we read it to hydrate the account block, seed
// the shell's sidebar count + breadcrumb entity switcher (through the BFF, like every
// surface), and mount the tRPC + Query providers the surfaces render from. We also read
// the list-prefs cookie here so the toolbar's saved view (sort/filter/display) renders on
// the first server paint — no flash of defaults on a hard refresh.
// The `header` parallel-route slot (app/(app)/@header) carries each list route's server-rendered
// <ListRail>, so a hard refresh paints the full rail on the first frame instead of the breadcrumb
// fallback (ADR 0002). It renders inside the same providers as `children`, so the rail and the
// roster body share one list-prefs context and one Query cache.
export default async function AppLayout({
  children,
  header,
}: {
  children: ReactNode;
  header: ReactNode;
}) {
  const session = await getServerSession();
  const sessions = await serverCaller(session).sessions.list();
  const listPrefs = parseListPrefs((await cookies()).get(LIST_PREFS_COOKIE)?.value);
  return (
    <TRPCProvider>
      <ListPrefsProvider initial={listPrefs}>
        <AppShell user={session?.user} sessions={sessions} header={header}>
          {children}
        </AppShell>
      </ListPrefsProvider>
    </TRPCProvider>
  );
}
