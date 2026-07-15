import { cn } from "@/lib/utils";
import { avatarTint, PERMISSION_META } from "../../presentation";
import type { Agent, AgentPermission, AgentPermissions } from "../../schema";

// PROTOTYPE — throwaway (agent-card design gallery, see gallery.tsx). Word-sized atoms the
// variants share: the tinted avatar tile, a Tufte sparkline, a trend badge, permission pips
// and the allow/ask/deny text colors. Deliberately nothing bigger lives here — each variant
// owns its layout wholesale, or the comparison stops being a comparison.

/** allow / ask / deny as colored words (CONTEXT.md: green · amber · red). */
export const ACCESS_TEXT: Record<AgentPermission, string> = {
  allow: "text-green",
  ask: "text-amber",
  deny: "text-red",
};

export function TintAvatar({ agent, className }: { agent: Agent; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center font-mono font-semibold",
        avatarTint(agent.id),
        className,
      )}
    >
      {agent.avatar}
    </span>
  );
}

/** Word-sized trend graphic (Tufte): line + faint area over a normalised 0–1 series. */
export function Sparkline({
  values,
  className,
}: {
  values: readonly number[];
  className?: string;
}) {
  if (values.length < 2) return null;
  const width = 100;
  const height = 28;
  const pad = 2;
  const step = (width - pad * 2) / (values.length - 1);
  const y = (v: number) => height - pad - v * (height - pad * 2);
  const points = values.map((v, i) => `${(pad + i * step).toFixed(1)},${y(v).toFixed(1)}`);
  const line = `M${points.join(" L")}`;
  const area = `${line} L${(width - pad).toFixed(1)},${height - pad} L${pad},${height - pad} Z`;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      className={className}
    >
      <path d={area} className="fill-current opacity-[0.14]" />
      <path
        d={line}
        className="fill-none stroke-current"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Period-over-period delta badge — green up, red down (KPI-card anatomy). */
export function TrendBadge({ delta }: { delta: number }) {
  const up = delta >= 0;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-medium tabular-nums",
        up ? "bg-green-bg text-green" : "bg-red-bg text-red",
      )}
    >
      {up ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
    </span>
  );
}

const PIP_ORDER = [
  ["edit", "E"],
  ["bash", "B"],
  ["network", "N"],
] as const;

export function AccessPips({ permissions }: { permissions: AgentPermissions }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1">
      {PIP_ORDER.map(([key, letter]) => {
        const meta = PERMISSION_META[permissions[key]];
        return (
          <span
            key={key}
            title={`${key}: ${meta.label}`}
            className={cn(
              "grid size-4 place-items-center rounded font-mono text-[8.5px] font-semibold uppercase",
              meta.badgeClass,
            )}
          >
            {letter}
          </span>
        );
      })}
    </span>
  );
}
