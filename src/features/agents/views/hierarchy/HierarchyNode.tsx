import { forwardRef } from "react";
import { Sparkles, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HierarchyNodeDatum } from "./useHierarchyLayout";

type HierarchyNodeProps = {
  node: HierarchyNodeDatum;
  selected: boolean;
  highlighted?: boolean;
  onSelect: (id: string) => void;
};

const STATUS_META: Record<string, { label: string; dot: string; chip: string }> = {
  active: { label: "Actif", dot: "bg-emerald-400", chip: "text-emerald-300" },
  idle: { label: "Idle", dot: "bg-amber-400", chip: "text-amber-300" },
  unknown: { label: "Attention", dot: "bg-rose-400", chip: "text-rose-300" },
};

function formatRelativeTime(timestamp: number | null) {
  if (!timestamp) return "Jamais";
  const diff = Date.now() - timestamp;
  if (diff < 60_000) return "À l'instant";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} h`;
  return `${Math.floor(diff / 86_400_000)} j`;
}

export const HierarchyNode = forwardRef<HTMLButtonElement, HierarchyNodeProps>(function HierarchyNode({ node, selected, highlighted = false, onSelect }, ref) {
  const status = STATUS_META[node.status] ?? STATUS_META.unknown;
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onSelect(node.id)}
      className={cn(
        "w-full rounded-[22px] border px-4 py-4 text-left transition-all duration-200",
        selected
          ? "border-[var(--agents-agent-selected-border)] bg-[var(--agents-agent-selected-bg)] shadow-[0_25px_55px_var(--agents-card-selected-shadow)]"
          : "border-[var(--agents-agent-border)] bg-[var(--agents-agent-bg)] shadow-[0_18px_40px_var(--agents-card-shadow)] hover:-translate-y-0.5 hover:border-[var(--agents-agent-selected-border)]",
        highlighted && "ring-2 ring-offset-2 ring-offset-transparent ring-[var(--agents-accent)]"
      )}
      style={{ color: "var(--agents-ink)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg"
          style={{
            background: "var(--agents-accent-soft)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px var(--agents-accent-border)",
            color: "var(--agents-accent-text)",
          }}
        >
          {node.emoji}
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border px-2 py-0.5 text-[11px]" style={{ borderColor: "var(--agents-panel-border)" }}>
          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
          <span className={status.chip}>{status.label}</span>
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2 text-sm font-semibold">
        <span className="truncate" style={{ color: "var(--agents-ink)" }}>{node.name}</span>
        {node.isMain && <Sparkles className="h-4 w-4 text-amber-300" />}
      </div>
      <p className="mt-1 text-xs" style={{ color: "var(--agents-ink-soft)" }}>
        {node.workspace || node.agentDir}
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]" style={{ color: "var(--agents-ink-soft)" }}>
        <div className="rounded-2xl border px-2 py-1 text-center" style={{ borderColor: "var(--agents-chip-border)", background: "var(--agents-chip-bg)" }}>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--agents-chip-text)]">Sessions</p>
          <p className="text-sm font-semibold text-[var(--agents-ink)]">{node.sessionCount}</p>
        </div>
        <div className="rounded-2xl border px-2 py-1 text-center" style={{ borderColor: "var(--agents-chip-border)", background: "var(--agents-chip-bg)" }}>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--agents-chip-text)]">Deleg.</p>
          <p className="flex items-center justify-center gap-1 text-sm font-semibold text-[var(--agents-ink)]">
            {node.delegateCount + node.runtimeCount}
            {node.hasDelegates && <Share2 className="h-3 w-3 text-[var(--agents-chip-text)]" />}
          </p>
        </div>
        <div className="rounded-2xl border px-2 py-1 text-center" style={{ borderColor: "var(--agents-chip-border)", background: "var(--agents-chip-bg)" }}>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--agents-chip-text)]">Actif</p>
          <p className="text-sm font-semibold text-[var(--agents-ink)]">{formatRelativeTime(node.lastActive)}</p>
        </div>
      </div>
      {node.channels.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1 text-[10px]" style={{ color: "var(--agents-chip-text)" }}>
          {node.channels.slice(0, 3).map((channel) => (
            <span key={channel} className="rounded-full border px-2 py-0.5" style={{ borderColor: "var(--agents-chip-border)", background: "var(--agents-chip-bg)" }}>
              {channel}
            </span>
          ))}
          {node.channels.length > 3 && (
            <span className="rounded-full border px-2 py-0.5" style={{ borderColor: "var(--agents-chip-border)", background: "var(--agents-chip-bg)" }}>
              +{node.channels.length - 3}
            </span>
          )}
        </div>
      )}
      {node.isDefault && (
        <div className="mt-3 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]" style={{ borderColor: "var(--agents-panel-border)" }}>
          Mode par défaut
        </div>
      )}
    </button>
  );
});
