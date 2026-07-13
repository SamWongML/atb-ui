# ADR 0001 — List-screen UI architecture (shell chrome, rail slot, display model)

Status: accepted · 2026-07-11

## Context

The Agents screen was redesigned (two prototype rounds under
`features/agents/components/prototype/`, since deleted). The chosen direction —
"Linear Faithful" — moves every list-screen control into a single dense top **rail**
(back · location · status tabs · sort · filter · display · New) and out of the old
in-content `ListHeader` bar. The redesign must apply to the **whole app** and be
reusable by the other list screens (Workflows, Squads, Skills, MCP), not bolted onto
Agents alone.

## Research (best-practice basis)

- **Three-tier design tokens** — options → semantic/decision → component. Components
  consume *semantic* tokens only; the indirection is what makes theming and refactors
  safe. ([Martin Fowler](https://martinfowler.com/articles/design-token-based-ui-architecture.html),
  [design tokens & theming 2025](https://materialui.co/blog/design-tokens-and-theming-scalable-ui-2025))
  → We already have options (`styles/tokens.css :root`) and semantic bindings
  (`styles/globals.css @theme inline`). Every new component uses semantic utilities
  (`bg-panel`, `text-text-2`, `border-hair`, …) — never hex, never `bg-white/black`.
  `styles/tokens.contract.test.ts` enforces this.
- **Feature-Sliced Design** — `shared` holds design-system code with no business
  meaning; `features/<slice>` holds business-specific UI; `app` only wires providers.
  Unidirectional deps; slices expose a public surface. ([FSD](https://feature-sliced.design/blog/frontend-structure-best-practices))
  → Chrome/primitives (`ListRail`, `PageHeader`, `Switch`, `ListDisplay`,
  `useListQuery`, `AppShell`, `SidebarNav`) live in `components/` + `lib/` (shared).
  The agent card/list renderers live in `features/agents/` (they know agent shape).
- **App shell owns layout slots, not their contents** — the shell is the persistent
  frame; each page fills the slots. ([app-shell architecture](https://developer.chrome.com/blog/app-shell),
  [shell as a layout engine](https://www.designsystemscollective.com/component-shell-a-layout-engine-for-modern-apps-57e59d3f6951))
  → The shell provides a **header slot**; list pages fill it with a `ListRail`;
  pages that don't fill it fall back to the route-derived breadcrumb.
- **Composition / headless split** — keep state (query/sort/display) in a headless
  hook; keep the rail presentational and prop-driven so any screen can drive it.
  ([compound vs composition](https://www.reactchallenges.com/blog/composition-vs-compound-components),
  [headless components](https://dev.to/haribhandari/react-build-your-own-composable-headless-components-170b))

## Decisions

1. **Header is a shell slot with a breadcrumb fallback.** *(Mechanism superseded by ADR
   0002: the client portal is replaced by a server-rendered `@header` parallel-route slot,
   which eliminates the one-frame refresh flash noted in Consequences.)* `AppShell` renders a
   `PageChromeProvider`; the header region hosts a portal target plus the
   route-derived `BreadcrumbNav`. `components/page-chrome.tsx` exposes `<PageHeader>`,
   which portals its children into the slot (and renders inline when no provider is
   present, so feature components stay unit-testable). List screens render
   `<PageHeader><ListRail …/></PageHeader>`; detail/other pages keep the breadcrumb.
2. **One rail for every list screen.** `components/list-rail.tsx` is generic and
   prop-driven (count · filter-as-tabs · sort · search · New · optional display),
   route-aware for the location + back affordance. Agents, Workflows, Squads, Skills
   and MCP all use it → the old `components/list-header.tsx` is retired.
3. **One query model.** `lib/use-list-query.ts` (`useListQuery`) centralizes the
   query/status/sort/direction state + filtering + per-status counts every list
   repeated by hand.
4. **One display model.** `components/list-display.tsx` (`useListDisplay` +
   `ListDisplayMenu`, on the `Switch` primitive and `Surface`'s `fullWidth` prop) owns
   layout/density/full-width/grouping/visible-properties. A screen declares only its
   property vocabulary; Agents uses the full grid/list, others opt in later.
5. **Sidebar redesign is global.** `SidebarNav` (a compose action + a search button
   that opens ⌘K, collapsible groups) applies to every `(app)` route via the shell.

## Consequences

- New list screens cost a `useListQuery` config + a `<PageHeader><ListRail/>` + a card
  renderer — no bespoke toolbar.
- ~~The header slot uses a client portal, so a hard refresh of a list page paints the
  breadcrumb fallback for one frame before the rail mounts.~~ **Superseded by ADR 0002** —
  the rail is server-rendered via the `@header` parallel-route slot, so there is no refresh
  flash; the fixed header height still keeps zero layout shift.
- `ListRail`/`ListDisplay` are theme-safe by construction (semantic tokens only), so
  they re-theme with the app with no per-screen work.
