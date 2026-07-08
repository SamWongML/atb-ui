import { create } from "zustand";

// Global UI state for the ⌘K palette (TECH_STACK.md L4 — Zustand owns small, truly
// global UI state). Open is triggered from several places (the header search button,
// the account menu, the ⌘K shortcut) that don't share a tree, so it lives here rather
// than being prop-drilled.

type CommandMenuState = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const useCommandMenu = create<CommandMenuState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
