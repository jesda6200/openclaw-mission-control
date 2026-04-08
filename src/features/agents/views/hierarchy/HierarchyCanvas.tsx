import { useEffect, useMemo, useRef, useState } from "react";
import { Filter, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { HierarchyLegend } from "./HierarchyLegend";
import { HierarchyNode } from "./HierarchyNode";
import type { HierarchyFilterMode, HierarchyLayout } from "./useHierarchyLayout";

type HierarchyCanvasProps = {
  layout: HierarchyLayout;
  selectedId: string | null;
  onSelect: (id: string) => void;
  filterMode: HierarchyFilterMode;
  onFilterChange: (mode: HierarchyFilterMode) => void;
  focusSignal: number;
  onFocusMain: () => void;
};

const FILTER_OPTIONS: Array<{ key: HierarchyFilterMode; label: string }> = [
  { key: "all", label: "Tous" },
  { key: "delegated", label: "Delegue" },
  { key: "unhealthy", label: "Unhealthy" },
];

export function HierarchyCanvas({
  layout,
  selectedId,
  onSelect,
  filterMode,
  onFilterChange,
  focusSignal,
  onFocusMain,
}: HierarchyCanvasProps) {
  const mainRef = useRef<HTMLButtonElement>(null);
  const [highlightMain, setHighlightMain] = useState(false);

  useEffect(() => {
    if (!layout.mainAgent) return;
    requestAnimationFrame(() => setHighlightMain(true));
    if (mainRef.current) {
      mainRef.current.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }
    const timer = window.setTimeout(() => setHighlightMain(false), 1400);
    return () => window.clearTimeout(timer);
  }, [focusSignal, layout.mainAgent?.id]);

  const groups = layout.groups;
  const orphanGroups = useMemo(
    () => (layout.orphanAgents.length ? [{ id: "orphans", label: "Non classes", agents: layout.orphanAgents }] : []),
    [layout.orphanAgents]
  );

  return (
    <div
      className="relative h-0 flex-1 overflow-hidden border-t"
      style={{ borderColor: "var(--agents-panel-border)", background: "var(--agents-flow-bg)" }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/25 to-transparent" />
        <div className="absolute left-[12%] top-10 h-40 w-40 rounded-full blur-3xl" style={{ background: "var(--agents-orb-a)" }} />
        <div className="absolute right-[10%] top-20 h-48 w-48 rounded-full blur-3xl" style={{ background: "var(--agents-orb-b)" }} />
      </div>
      <div className="relative z-10 flex h-full flex-col">
        <div
          className="flex flex-wrap items-center gap-2 border-b px-4 py-4"
          style={{
            borderColor: "var(--agents-panel-border)",
            background: "color-mix(in srgb, var(--agents-panel-bg) 82%, transparent)",
            boxShadow: "0 20px 45px var(--agents-panel-shadow)",
          }}
        >
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em]" style={{ color: "var(--agents-chip-text)" }}>
              Hierarchy
            </p>
            <p className="text-sm font-semibold" style={{ color: "var(--agents-ink)" }}>
              Organigramme par poles et etat en direct
            </p>
          </div>
          <HierarchyLegend stats={layout.stats} />
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <div
              className="inline-flex items-center rounded-full border bg-[color-mix(in_srgb,var(--agents-panel-bg)_90%,transparent)] p-1"
              style={{ borderColor: "var(--agents-panel-border)" }}
            >
              {FILTER_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => onFilterChange(option.key)}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    filterMode === option.key
                      ? "bg-white text-stone-900 dark:bg-stone-900 dark:text-white"
                      : "text-[var(--agents-ink-soft)] hover:text-white"
                  )}
                >
                  {option.key !== "all" && <Filter className="h-3 w-3" />}
                  {option.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onFocusMain}
              disabled={!layout.mainAgent}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                !layout.mainAgent && "cursor-not-allowed opacity-50"
              )}
              style={{
                borderColor: "var(--agents-panel-border)",
                background: "color-mix(in srgb, var(--agents-panel-strong) 90%, transparent)",
                color: layout.mainAgent ? "var(--agents-ink)" : "var(--agents-ink-soft)",
              }}
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              Focus main
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-4 pb-10 pt-6">
          {layout.mainAgent && (
            <div className="mx-auto max-w-xl">
              <HierarchyNode
                ref={mainRef}
                node={layout.mainAgent}
                selected={selectedId === layout.mainAgent.id}
                highlighted={highlightMain}
                onSelect={onSelect}
              />
              <div className="mx-auto mt-4 h-10 w-px bg-gradient-to-b from-transparent via-[var(--agents-panel-border)] to-transparent" />
            </div>
          )}

          <div className="mt-8 grid gap-2 lg:grid-cols-2 xl:grid-cols-3" style={{ gridAutoRows: "1fr" }}>
            {[...groups, ...orphanGroups].map((group) => (
              <section
                key={group.id}
                className="relative flex h-full flex-col rounded-[28px] border"
                style={{ borderColor: "var(--agents-panel-border)", background: "color-mix(in srgb, var(--agents-panel-bg) 92%, transparent)" }}
              >
                <div
                  className="flex items-center justify-between border-b px-4 py-3"
                  style={{ borderColor: "var(--agents-panel-border)" }}
                >
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em]" style={{ color: "var(--agents-chip-text)" }}>
                      {group.label}
                    </p>
                    <p className="text-sm font-semibold" style={{ color: "var(--agents-ink)" }}>
                      {group.agents.length} agent{group.agents.length > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-[11px]" style={{ color: "var(--agents-ink-soft)" }}>
                    Pole
                  </div>
                </div>
                <div className="flex-1 space-y-2 px-4 py-4">
                  {group.agents.map((agent) => (
                    <HierarchyNode
                      key={agent.id}
                      node={agent}
                      selected={selectedId === agent.id}
                      onSelect={onSelect}
                    />
                  ))}
                  {group.agents.length === 0 && (
                    <p className="text-center text-sm" style={{ color: "var(--agents-ink-soft)" }}>
                      Aucun agent pour ce filtre
                    </p>
                  )}
                </div>
              </section>
            ))}
            {groups.length === 0 && layout.orphanAgents.length === 0 && (
              <div
                className="rounded-[28px] border px-4 py-10 text-center text-sm"
                style={{ borderColor: "var(--agents-panel-border)", color: "var(--agents-ink-soft)" }}
              >
                Aucun agent ne correspond a ce filtre. Ajuste les filtres pour revoir l&rsquo;ensemble du graphe.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
