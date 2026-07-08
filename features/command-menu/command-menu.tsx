"use client";

import { useRouter } from "next/navigation";
import { type CommandAction, CommandPalette } from "./command-palette";
import { useCommandMenu } from "./store";

// Container: wires the Zustand open-state and the App Router into the controlled
// CommandPalette. app/(app) renders one of these at the shell root.

export function CommandMenu({ actions }: { actions?: readonly CommandAction[] }) {
  const router = useRouter();
  const open = useCommandMenu((state) => state.open);
  const setOpen = useCommandMenu((state) => state.setOpen);

  return (
    <CommandPalette
      open={open}
      onOpenChange={setOpen}
      onNavigate={(href) => router.push(href)}
      actions={actions}
    />
  );
}
