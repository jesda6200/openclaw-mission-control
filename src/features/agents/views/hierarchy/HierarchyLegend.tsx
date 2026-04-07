import type { HierarchyLayout } from "./useHierarchyLayout";

type HierarchyLegendProps = {
  stats: HierarchyLayout["stats"];
};

const STATUS_ITEMS = [
  { key: "active", label: "Actifs", color: "bg-emerald-400" },
  { key: "idle", label: "Idle", color: "bg-amber-400" },
  { key: "unknown", label: "Attention", color: "bg-rose-400" },
] as const;

export function HierarchyLegend({ stats }: HierarchyLegendProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium" style={{ color: "var(--agents-ink-soft)" }}>
      {STATUS_ITEMS.map((item) => (
        <span key={item.key} className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1" style={{ borderColor: "var(--agents-panel-border)" }}>
          <span className={`h-1.5 w-1.5 rounded-full ${item.color}`} />
          {item.label}
        </span>
      ))}
      <span className="ml-2 text-[11px] uppercase tracking-[0.2em]" style={{ color: "var(--agents-chip-text)" }}>
        {stats.filtered} visibles / {stats.total} agents
      </span>
      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--agents-chip-bg)] px-2 py-1 text-[10px]" style={{ border: "1px solid var(--agents-chip-border)" }}>
        <span className="text-emerald-300">{stats.active}</span> actifs
      </span>
      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--agents-chip-bg)] px-2 py-1 text-[10px]" style={{ border: "1px solid var(--agents-chip-border)" }}>
        <span className="text-rose-300">{stats.unhealthy}</span> attention
      </span>
      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--agents-chip-bg)] px-2 py-1 text-[10px]" style={{ border: "1px solid var(--agents-chip-border)" }}>
        <span className="text-sky-300">{stats.delegated}</span> délégués
      </span>
    </div>
  );
}
