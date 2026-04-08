import { useMemo } from "react";

export type HierarchyFilterMode = "all" | "delegated" | "unhealthy";

export type HierarchyGroupDefinition = {
  id: string;
  label: string;
  agents: string[];
};

export type HierarchyAgentInput = {
  id: string;
  name: string;
  emoji: string;
  status: string;
  lastActive: number | null;
  sessionCount: number;
  workspace: string;
  agentDir: string;
  isDefault: boolean;
  subagents: string[];
  runtimeSubagents: Array<{ status: string }>;
  bindings: string[];
  channels: string[];
};

export type HierarchyNodeDatum = {
  id: string;
  name: string;
  emoji: string;
  status: string;
  lastActive: number | null;
  sessionCount: number;
  workspace: string;
  agentDir: string;
  isDefault: boolean;
  hasDelegates: boolean;
  delegateCount: number;
  runtimeCount: number;
  channels: string[];
  isMain: boolean;
};

export type HierarchyDensity = "roomy" | "tight" | "compact";

export type HierarchyLayout = {
  groups: Array<{
    id: string;
    label: string;
    agents: HierarchyNodeDatum[];
  }>;
  orphanAgents: HierarchyNodeDatum[];
  mainAgent: HierarchyNodeDatum | null;
  density: HierarchyDensity;
  stats: {
    total: number;
    filtered: number;
    delegated: number;
    unhealthy: number;
    active: number;
  };
};

type UseHierarchyLayoutParams = {
  agents: HierarchyAgentInput[];
  groups: HierarchyGroupDefinition[];
  filterMode: HierarchyFilterMode;
  mainAgentId: string;
};

const FILTERS: Record<HierarchyFilterMode, (agent: HierarchyAgentInput) => boolean> = {
  all: () => true,
  delegated: (agent) => (agent.subagents?.length ?? 0) + (agent.runtimeSubagents?.length ?? 0) > 0,
  unhealthy: (agent) => agent.status !== "active",
};

const STATUS_ORDER: Record<string, number> = {
  active: 0,
  idle: 1,
  unknown: 2,
  error: 3,
};

function resolveDensity(totalVisible: number): HierarchyDensity {
  if (totalVisible >= 24) return "compact";
  if (totalVisible >= 12) return "tight";
  return "roomy";
}

function toNode(agent: HierarchyAgentInput, mainAgentId: string): HierarchyNodeDatum {
  const delegateCount = agent.subagents?.length ?? 0;
  const runtimeCount = agent.runtimeSubagents?.length ?? 0;
  return {
    id: agent.id,
    name: agent.name,
    emoji: agent.emoji,
    status: agent.status,
    lastActive: agent.lastActive,
    sessionCount: agent.sessionCount,
    workspace: agent.workspace,
    agentDir: agent.agentDir,
    isDefault: agent.isDefault,
    hasDelegates: delegateCount + runtimeCount > 0,
    delegateCount,
    runtimeCount,
    channels: agent.channels ?? [],
    isMain: agent.id === mainAgentId,
  };
}

function sortNodes(a: HierarchyNodeDatum, b: HierarchyNodeDatum) {
  const aOrder = STATUS_ORDER[a.status] ?? 99;
  const bOrder = STATUS_ORDER[b.status] ?? 99;
  if (aOrder !== bOrder) return aOrder - bOrder;
  if (a.hasDelegates !== b.hasDelegates) return a.hasDelegates ? -1 : 1;
  return a.name.localeCompare(b.name);
}

export function useHierarchyLayout({ agents, groups, filterMode, mainAgentId }: UseHierarchyLayoutParams): HierarchyLayout {
  return useMemo(() => {
    const predicate = FILTERS[filterMode] ?? FILTERS.all;
    const filteredAgents = agents.filter((agent) => predicate(agent));
    const nodeMap = new Map<string, HierarchyNodeDatum>();
    filteredAgents.forEach((agent) => {
      nodeMap.set(agent.id, toNode(agent, mainAgentId));
    });

    const groupedAgents = groups.map((group) => {
      const nodes = group.agents
        .map((agentId) => nodeMap.get(agentId))
        .filter((node): node is HierarchyNodeDatum => Boolean(node))
        .sort(sortNodes);
      return { ...group, agents: nodes };
    });

    const assignedIds = new Set<string>();
    groupedAgents.forEach((group) => {
      group.agents.forEach((node) => assignedIds.add(node.id));
    });

    const orphanAgents = filteredAgents
      .filter((agent) => !assignedIds.has(agent.id))
      .map((agent) => nodeMap.get(agent.id)!)
      .filter((node): node is HierarchyNodeDatum => Boolean(node))
      .sort(sortNodes);

    const mainAgentSource = agents.find((agent) => agent.id === mainAgentId) ?? null;
    const mainAgent = mainAgentSource ? toNode(mainAgentSource, mainAgentId) : null;

    const filteredCount =
      groupedAgents.reduce((sum, group) => sum + group.agents.length, 0) +
      orphanAgents.length +
      (mainAgent ? 1 : 0);
    const stats = {
      total: agents.length,
      filtered: filteredCount,
      delegated: agents.filter((agent) => (agent.subagents?.length ?? 0) + (agent.runtimeSubagents?.length ?? 0) > 0).length,
      unhealthy: agents.filter((agent) => agent.status !== "active").length,
      active: agents.filter((agent) => agent.status === "active").length,
    };

    return {
      groups: groupedAgents.filter((group) => group.agents.length > 0),
      orphanAgents,
      mainAgent,
      density: resolveDensity(filteredCount || agents.length),
      stats,
    };
  }, [agents, filterMode, groups, mainAgentId]);
}
