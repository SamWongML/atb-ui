"use client";

import { LayoutGrid, List } from "lucide-react";
import { type ReactNode, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import type { ListDensity, ListLayout } from "@/lib/list-prefs";
import { useListPrefs } from "@/lib/list-prefs-provider";
import { cn } from "@/lib/utils";

// The one display model for every BUILD list surface (Agents, Workflows, Squads,
// Skills, MCP) — Linear's "Display options" adapted to this app: HOW the roster
// renders (layout · density · full width · grouping · visible properties),
// independent of WHAT it shows (search/filter/sort stay with each screen's query
// state). One hook + one popover, so every list screen shares the same preference
// shape and the same control; a screen declares only its own property vocabulary and a
// `scope`. State is persisted per-scope in the shared list-prefs store (survives refresh).

export type { ListDensity, ListLayout } from "@/lib/list-prefs";

export type DisplayProperty = {
  /** Stable key the list/grid renderer checks via `display.visible[key]`. */
  key: string;
  label: string;
};

export type ListDisplayConfig = {
  /** Persistence key — must match the screen's `useListQuery` scope. */
  scope: string;
  /** The screen's toggleable item properties, in display order. */
  properties: readonly DisplayProperty[];
  /** Whether the list layout supports grouping (shows the "Group" switch). */
  groupable?: boolean;
  defaults?: {
    layout?: ListLayout;
    fullWidth?: boolean;
    grouped?: boolean;
  };
};

export type ListDisplayState = {
  layout: ListLayout;
  setLayout: (layout: ListLayout) => void;
  density: ListDensity;
  setDensity: (density: ListDensity) => void;
  fullWidth: boolean;
  setFullWidth: (fullWidth: boolean) => void;
  grouped: boolean;
  setGrouped: (grouped: boolean) => void;
  /** Visibility per property key (defaults to true for every configured property). */
  visible: Record<string, boolean>;
  toggleProperty: (key: string) => void;
  reset: () => void;
  config: ListDisplayConfig;
};

function allVisible(config: ListDisplayConfig): Record<string, boolean> {
  return Object.fromEntries(config.properties.map((property) => [property.key, true]));
}

export function useListDisplay(config: ListDisplayConfig): ListDisplayState {
  const { prefs, setDisplay: setDisplayPref } = useListPrefs();
  const scoped = prefs.display[config.scope];

  const defaults = {
    layout: config.defaults?.layout ?? ("grid" as ListLayout),
    density: "comfortable" as ListDensity,
    fullWidth: config.defaults?.fullWidth ?? false,
    grouped: config.defaults?.grouped ?? true,
  };
  const layout = scoped?.layout ?? defaults.layout;
  const density = scoped?.density ?? defaults.density;
  const fullWidth = scoped?.fullWidth ?? defaults.fullWidth;
  const grouped = scoped?.grouped ?? defaults.grouped;
  const visibleOverride = scoped?.visible;
  const visible = useMemo(
    () => ({ ...allVisible(config), ...(visibleOverride ?? {}) }),
    [config, visibleOverride],
  );

  const { scope } = config;
  return {
    layout,
    setLayout: (value) => setDisplayPref(scope, { layout: value }),
    density,
    setDensity: (value) => setDisplayPref(scope, { density: value }),
    fullWidth,
    setFullWidth: (value) => setDisplayPref(scope, { fullWidth: value }),
    grouped,
    setGrouped: (value) => setDisplayPref(scope, { grouped: value }),
    visible,
    toggleProperty: (key) =>
      setDisplayPref(scope, { visible: { ...visible, [key]: !(visible[key] ?? true) } }),
    reset: () =>
      setDisplayPref(scope, {
        layout: defaults.layout,
        density: defaults.density,
        fullWidth: defaults.fullWidth,
        grouped: defaults.grouped,
        visible: allVisible(config),
      }),
    config,
  };
}

/** The Display popover. The caller supplies its own trigger button as children. */
export function ListDisplayMenu({
  display,
  children,
  align = "end",
}: {
  display: ListDisplayState;
  children: ReactNode;
  align?: "start" | "end";
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align={align} className="w-[290px] p-3">
        <div className="grid grid-cols-2 gap-1.5">
          {(
            [
              { layout: "grid" as const, label: "Grid", icon: LayoutGrid },
              { layout: "list" as const, label: "List", icon: List },
            ] as const
          ).map(({ layout, label, icon: Icon }) => {
            const selected = display.layout === layout;
            return (
              <button
                key={layout}
                type="button"
                onClick={() => display.setLayout(layout)}
                aria-pressed={selected}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-lg border p-2.5 text-[11.5px] font-medium transition-colors",
                  selected
                    ? "border-[var(--sel-bd)] bg-[var(--sel-bg)] text-text"
                    : "border-border text-text-3 hover:border-border-2 hover:text-text-2",
                )}
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-col gap-2.5">
          <DisplayRow label="Density">
            <div className="flex rounded-md bg-inset p-0.5">
              {(["comfortable", "compact"] as const).map((density) => (
                <button
                  key={density}
                  type="button"
                  onClick={() => display.setDensity(density)}
                  className={cn(
                    "h-6 rounded-[5px] px-2 text-[11px] font-medium capitalize transition-colors",
                    display.density === density
                      ? "border border-border bg-panel text-text"
                      : "text-text-3 hover:text-text-2",
                  )}
                >
                  {density}
                </button>
              ))}
            </div>
          </DisplayRow>

          <DisplayRow label="Full width">
            <Switch
              checked={display.fullWidth}
              onCheckedChange={display.setFullWidth}
              aria-label="Full width"
            />
          </DisplayRow>

          {display.config.groupable && (
            <DisplayRow label="Group by status" dim={display.layout === "grid"}>
              <Switch
                checked={display.grouped}
                onCheckedChange={display.setGrouped}
                disabled={display.layout === "grid"}
                aria-label="Group by status"
              />
            </DisplayRow>
          )}
        </div>

        <p className="mt-3.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-text-4">
          Display properties
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {display.config.properties.map(({ key, label }) => {
            const on = display.visible[key] ?? true;
            return (
              <button
                key={key}
                type="button"
                onClick={() => display.toggleProperty(key)}
                aria-pressed={on}
                className={cn(
                  "rounded-md border px-2 py-0.5 text-[11.5px] font-medium transition-colors",
                  on
                    ? "border-[var(--sel-bd)] bg-[var(--sel-bg)] text-text"
                    : "border-border text-text-4 hover:border-border-2 hover:text-text-3",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={display.reset}
          className="mt-3 w-full rounded-md border-t border-hair pt-2 text-center text-[11.5px] text-text-3 transition-colors hover:text-text"
        >
          Reset to default
        </button>
      </PopoverContent>
    </Popover>
  );
}

function DisplayRow({
  label,
  dim,
  children,
}: {
  label: string;
  dim?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex items-center justify-between", dim && "opacity-45")}>
      <span className="text-[12.5px] text-text-2">{label}</span>
      {children}
    </div>
  );
}
