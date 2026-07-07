# Handoff: ATB Agent Platform — Frontend

## Overview
ATB is a **real-time AI agent-orchestration console**. Engineers use it to launch and steer autonomous agent "sessions," watch agent squads stream work token-by-token, review and approve code diffs, and manage the building blocks behind them — agents, workflows, skills, MCP servers, and sandboxes.

It is a dense, authenticated, single-page-feeling operations tool (think Linear / Vercel dashboard density, not a marketing site), with a crafted warm-neutral aesthetic and full dark/light theming.

This bundle is the **design + architecture handoff** for building it as a production-grade frontend.

## About the Design Files
The files in `design/` are **design references authored in HTML** — high-fidelity prototypes that show the intended look, layout, and interactions. **They are not production code to copy verbatim.** They are written as "Design Components" (a prototyping format) and are only meant to be *read* and *reproduced*.

The task is to **recreate these designs in a real production codebase**. There is **no existing codebase** — this is greenfield — so the companion documents in this bundle recommend the framework and full stack to build it in:

- **`TECH_STACK.md`** — every layer's pick, the reasoning, and the alternative.
- **`ARCHITECTURE.md`** — system tiers, the real-time data-flow pattern, and AWS ECS deployment.
- **`ROADMAP.md`** — the phased build plan (~12 weeks solo + AI-assisted).
- **`FOLDER_STRUCTURE.md`** — the recommended module layout.
- **`design/ATB Frontend Architecture.dc.html`** — the same content as a designed, printable document (open in a browser).

> The one-line summary: **Next.js 16 (App Router, RSC) + TypeScript + tRPC BFF + TanStack Query, with SSE for token streams and WebSockets for control, styled with Tailwind v4 bound to the existing CSS-variable token system, deployed as a Docker container on AWS ECS Fargate.**

## Fidelity
**High-fidelity.** The prototypes carry final colors, typography, spacing, radii, and interaction states. Reproduce the UI faithfully using the recommended stack's libraries. All exact token values are in [Design Tokens](#design-tokens) below and in `styles/tokens.css` once you scaffold.

---

## Screens / Views

The app is a persistent **left sidebar + main column** shell. The main column has a 53px top header (breadcrumb + entity switcher + contextual actions) and a scrolling content area. A ⌘K command palette and account/theme menu overlay everything.

### App Shell
- **Sidebar (238px, fixed):** workspace/environment switcher (top) → "New session" CTA (accent-soft button, ⌘N) → nav groups: **Workspace** (Overview, Sessions [live count badge], Runs), **Build** (Workflows, Agents, Skills, MCP servers), **Runtime** (Sandboxes, Analytics) → account block (bottom) with avatar, presence dot, and a popover holding the theme segmented control (Dark/Light), Settings, Command menu, Sign out.
- Nav items: 13.5px Geist medium, 7px×10px padding, 8px radius, `--nav-hover` on hover, active state fills `--sel-bg` with accent-colored icon.
- **Header:** breadcrumb (`Section / Entity`) where the entity is often a switcher button (dropdown of siblings); right side holds per-screen actions.

### Overview (dashboard home)
- Purpose: at-a-glance health. Activity feed (timestamped, color-dotted events), recent **failures** cards (run id, title, time, cause), and **model mix** cost breakdown (claude-opus/sonnet/haiku with $ and % bars).

### Sessions — **the hero surface**
- **List:** sessions grouped by status — **Needs you** (amber), **Active** (clay), **Ready to review** (violet), **Done** (green) — with a filter tab bar (All / Needs you / Active / Review / Done) carrying counts. Each row: status dot (pulses when running), title, stacked agent avatars (+N overflow), step progress (`3/5 steps`), and a right-aligned action/time. **Virtualize this list.**
- **Detail:** a **streaming chat transcript** (agent tokens arrive live) beside a **canvas** panel with tabs: **Plan / Run / Diff / Trace**. The Diff tab shows syntax-highlighted code diffs. Live status, cost, and squad phase update in real time.

### Runs
- Execution history table + a **failures** section (each with run id, title, timestamp, and root-cause description, e.g. "slack MCP 502 ×3"). Filterable, virtualized.

### Agents
- Roster of agents (Orchestrator, Recon, Builder, Security Reviewer, Test Runner, Synthesizer, Docs Writer). Each: 2-letter avatar (per-agent color), name, role, model (e.g. "Opus 4.8"), status dot, description.
- **Detail:** permissions displayed as three chips — **edit / bash / network** each `allow` (green) / `ask` (amber) / `deny` (red); attached skills & MCPs; usage (tasks, % merged, tokens, cost, avg time); and the full **system prompt**.

### Squads
- Agent teams (e.g. "Auth Migration Squad") with a lead + members roster (avatars), mission, target repo, current phase + progress, schedule, and recent runs list.

### Workflows
- Multi-agent pipelines (nodes + connections). List + detail.

### Skills
- Reusable capability packages (e.g. `sql-cookbook`, `repo-map`) with versions.

### MCP servers
- Connected tool servers (github, filesystem, postgres, slack) with **health states** (healthy / degraded — e.g. "latency 640ms", "502"). Degraded surfaces in amber/red.

### Sandboxes
- Compute environments (e.g. `perf-4vcpu`) agents run inside.

### Analytics
- Cost and usage over time — bar/line charts, model-mix, spend.

### Overlays
- **Command palette (⌘K):** fuzzy search over navigation + actions. Built with `cmdk`.
- **Settings:** preferences including a theme picker (two large theme preview cards).
- **Account menu:** popover from the sidebar footer.
- **Icon picker:** used when creating/editing entities.

---

## Interactions & Behavior
- **Navigation:** client-side routing between the ~11 surfaces; breadcrumb reflects section + entity; entity switcher is a dropdown of siblings. Put filters, selected session, and active canvas tab in the **URL** (shareable/reloadable).
- **Real-time (defining behavior):**
  - Agent output **streams token-by-token** into the session transcript (SSE).
  - Session status, step progress, squad phase, cost, and MCP health update **live**.
  - Running indicators **pulse** (`@keyframes pulse` — opacity 1↔0.4 over 2s).
  - User controls (approve / interrupt / steer) send **WebSocket** messages; the UI updates optimistically then reconciles on the authoritative echo.
  - See `ARCHITECTURE.md` §"Real-time data flow" for the exact SSE→cache→render pattern.
- **Theme toggle:** flips `data-theme` between `dark` (default) and `light` on the root; all colors are CSS variables, so the whole tree re-themes instantly. Persist choice to `localStorage`.
- **Hover states:** nav/menu items get `--nav-hover` bg; buttons lighten/shift border to `--accent-soft-bd`.
- **Loading states:** streaming content shows skeleton/placeholder counts before data; live lists show a pulsing cursor while tokens arrive.
- **Empty/error states:** failures render in `--red`/`--amber`; degraded MCPs flagged inline.

## State Management
- **Server state** (sessions, runs, agents, etc.): TanStack Query. This is also the sink that streaming events reconcile into via `queryClient.setQueryData`.
- **Client/global UI state** (command palette open, theme, panel layout): Zustand + `localStorage` for theme.
- **URL state** (filters, selected entity, canvas tab): nuqs.
- **Streaming:** a single `reconcile()` layer receives SSE + WS events (Zod-validated) and writes them into the Query cache — components never subscribe to sockets directly.

## Design Tokens

Fonts: **Geist** (sans / UI), **Geist Mono** (labels, metadata, code), **Newsreader** (serif — display headings & emphasis). Micro-labels are uppercase Geist Mono, ~10px, letter-spacing `.12–.16em`, color `--text-4`.

Radii: 6–9px (controls), 11–16px (cards/panels), 999px (pills). Shadows: `--shadow: 0 18px 50px -18px rgba(0,0,0,.7)`.

### Dark theme (`:root`, default)
```css
--bg:#0b0a09; --panel:#151312; --panel-2:#1b1917; --inset:#100f0e; --raise:#211d1b;
--border:#272320; --border-2:#342f2a; --hair:#1d1a18;
--text:#f4f1ec; --text-2:#a8a29a; --text-3:#726b64; --text-4:#4c4642;
--accent:#c96442; --accent-2:#d9764f;
--accent-soft:color-mix(in oklab,var(--accent) 15%,transparent);
--accent-soft-bd:color-mix(in oklab,var(--accent) 42%,transparent);
--clay:#cf6a44; --green:#79a97a; --blue:#6f97c2;
--amber:#d2a05f; --violet:#8f86d0; --purple:#ab93cb; --red:#cd6b58;
/* each semantic color has a matching --<name>-bg via color-mix ~15% */
--sans:'Geist',system-ui,sans-serif;
--mono:'Geist Mono',ui-monospace,monospace;
--serif:'Newsreader',Georgia,serif;
```

### Light theme (`[data-theme="light"]`)
```css
--bg:#f6f5f2; --panel:#ffffff; --panel-2:#faf9f6; --inset:#f0eeea; --raise:#ffffff;
--border:#e8e5df; --border-2:#dbd7cf; --hair:#efece7;
--text:#1c1a17; --text-2:#55514b; --text-3:#78736b; --text-4:#a7a199;
--accent:#b85631; --accent-2:#c96844;
--clay:#b05631; --green:#43793f; --blue:#3d72a6;
--amber:#92661f; --violet:#5f56bd; --purple:#7a5eae; --red:#bd4b36;
```
The light palette is intentionally de-warmed and deepened for **WCAG AA** contrast on white. Keep these values — do not re-derive.

**Color meaning (semantic):** clay/accent = primary/active · green = healthy/done/allow · amber = attention/needs-you/ask/degraded · violet = review · blue = info/running · red = error/deny.

## Assets
- **Icons:** all inline SVG (16px viewBox, 1.4–1.6 stroke, `currentColor`). No icon-font/library dependency in the prototype — reproduce with an icon set of your choice (e.g. Lucide) or lift the SVGs directly.
- **Logo:** the "a" mark is a CSS gradient tile (`linear-gradient(160deg,var(--accent-2),var(--accent))`), not an image.
- **Fonts:** Geist, Geist Mono, Newsreader — all on Google Fonts.
- No raster image assets; agent/user avatars are 2-letter monograms on colored tiles.

## Files
- `design/ATB Agent Platform.dc.html` — the full interactive product prototype (all screens, streaming, canvas, command palette, theming). **Primary reference.**
- `design/ATB Frontend Architecture.dc.html` — the architecture & stack decision document, designed and printable.
- `design/support.js` — runtime needed to open the `.dc.html` prototypes in a browser.
- `TECH_STACK.md`, `ARCHITECTURE.md`, `ROADMAP.md`, `FOLDER_STRUCTURE.md` — the build plan.

> To view the prototype: open `design/ATB Agent Platform.dc.html` in a browser (it loads `support.js` from the same folder).
