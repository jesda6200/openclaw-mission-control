import { useMemo, useState } from "react";
import { HierarchyCanvas } from "./HierarchyCanvas";
import type { HierarchyGroupDefinition, HierarchyFilterMode, HierarchyAgentInput } from "./useHierarchyLayout";
import { useHierarchyLayout } from "./useHierarchyLayout";

type HierarchyViewProps = {
  data: { agents: HierarchyAgentInput[] };
  groups: HierarchyGroupDefinition[];
  mainAgentId: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function HierarchyView({ data, groups, mainAgentId, selectedId, onSelect }: HierarchyViewProps) {
  const [filterMode, setFilterMode] = useState<HierarchyFilterMode>("all");
  const [focusSignal, setFocusSignal] = useState(0);

  const normalizedGroups = useMemo(() => groups ?? [], [groups]);
  const layout = useHierarchyLayout({
    agents: data.agents,
    groups: normalizedGroups,
    filterMode,
    mainAgentId,
  });

  return (
    <HierarchyCanvas
      layout={layout}
      selectedId={selectedId}
      onSelect={onSelect}
      filterMode={filterMode}
      onFilterChange={setFilterMode}
      focusSignal={focusSignal}
      onFocusMain={() => setFocusSignal((count) => count + 1)}
    />
  );
}
