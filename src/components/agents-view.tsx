"use client";

import { useEffect, useState, useCallback, useMemo, useRef, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bot,
  MessageSquare,
  Zap,
  Clock,
  Cpu,
  FolderOpen,
  Globe,
  Users,
  Shield,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle,
  AlertCircle,
  Layers,
  Network,
  LayoutGrid,
  GitFork,
  Plus,
  X,
  Sparkles,
  Search,
  Key,
  ShieldCheck,
  Star,
  ExternalLink,
  Eye,
  EyeOff,
  Terminal,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { requestRestart } from "@/lib/restart-store";
import { SectionBody, SectionHeader, SectionLayout } from "@/components/section-layout";
import { InlineSpinner, LoadingState } from "@/components/ui/loading-state";
import { SubagentsManagerView } from "@/components/subagents-manager-view";
import { ModelsView } from "@/components/models-view";
import { HierarchyView } from "@/features/agents/views/hierarchy";

const POSITIONS_STORAGE_KEY = "mc-agents-node-positions";
const AGENT_ORDER_STORAGE_KEY = "mc-agents-order";
const AGENTS_STYLE_STORAGE_KEY = "mc-agents-style-preset";

type AgentsStyleId = "operator" | "blueprint" | "ember";

type AgentsStylePreset = {
  id: AgentsStyleId;
  label: string;
  eyebrow: string;
  description: string;
  preview: string[];
  variables: CSSProperties;
};

const AGENTS_STYLE_PRESETS: AgentsStylePreset[] = [
  {
    id: "operator",
    label: "Operator Grid",
    eyebrow: "Graphite + Emerald",
    description: "Dark tactical console for dense graphs and busy crews.",
    preview: ["#34d399", "#7dd3fc", "#fbbf24"],
    variables: {
      "--agents-page-bg": "#071016",
      "--agents-hero-gradient": "linear-gradient(135deg, rgba(11,26,33,0.98) 0%, rgba(7,16,22,0.98) 58%, rgba(5,11,16,0.96) 100%)",
      "--agents-orb-a": "rgba(52,211,153,0.22)",
      "--agents-orb-b": "rgba(125,211,252,0.18)",
      "--agents-orb-c": "rgba(251,191,36,0.12)",
      "--agents-panel-bg": "rgba(6,17,23,0.74)",
      "--agents-panel-strong": "rgba(8,19,27,0.94)",
      "--agents-panel-border": "rgba(110,231,183,0.16)",
      "--agents-panel-highlight": "rgba(255,255,255,0.05)",
      "--agents-panel-shadow": "rgba(1,8,13,0.48)",
      "--agents-ink": "#ecfdf5",
      "--agents-ink-muted": "rgba(220,252,231,0.74)",
      "--agents-ink-soft": "rgba(220,252,231,0.46)",
      "--agents-accent": "#34d399",
      "--agents-accent-strong": "#10b981",
      "--agents-accent-soft": "rgba(52,211,153,0.14)",
      "--agents-accent-border": "rgba(52,211,153,0.30)",
      "--agents-accent-text": "#a7f3d0",
      "--agents-accent-contrast": "#03120d",
      "--agents-chip-bg": "rgba(255,255,255,0.04)",
      "--agents-chip-border": "rgba(255,255,255,0.08)",
      "--agents-chip-text": "rgba(236,253,245,0.72)",
      "--agents-flow-bg": "linear-gradient(180deg, rgba(5,10,14,0.98) 0%, rgba(4,8,12,0.96) 100%)",
      "--agents-flow-grid": "rgba(148,163,184,0.12)",
      "--agents-gateway-bg": "radial-gradient(circle at 28% 30%, rgba(52,211,153,0.38), rgba(3,18,14,0.96) 72%)",
      "--agents-gateway-border": "rgba(110,231,183,0.46)",
      "--agents-gateway-glow": "rgba(52,211,153,0.24)",
      "--agents-agent-bg": "linear-gradient(180deg, rgba(12,25,35,0.96), rgba(8,17,25,0.98))",
      "--agents-agent-border": "rgba(125,211,252,0.14)",
      "--agents-agent-selected-bg": "linear-gradient(180deg, rgba(9,36,39,0.98), rgba(6,20,22,1))",
      "--agents-agent-selected-border": "rgba(94,234,212,0.54)",
      "--agents-card-shadow": "rgba(0,0,0,0.26)",
      "--agents-card-selected-shadow": "rgba(16,185,129,0.22)",
      "--agents-runtime-bg": "linear-gradient(180deg, rgba(9,29,27,0.92), rgba(7,19,18,0.98))",
      "--agents-runtime-border": "rgba(52,211,153,0.24)",
      "--agents-channel-bg": "linear-gradient(180deg, rgba(7,35,46,0.92), rgba(7,22,33,0.98))",
      "--agents-channel-border": "rgba(56,189,248,0.24)",
      "--agents-channel-text": "#bae6fd",
      "--agents-workspace-bg": "linear-gradient(180deg, rgba(44,30,14,0.92), rgba(27,18,10,0.98))",
      "--agents-workspace-border": "rgba(251,191,36,0.26)",
      "--agents-workspace-text": "#fde68a",
      "--agents-edge-delegation": "#5eead4",
      "--agents-edge-route": "#7dd3fc",
      "--agents-edge-workspace": "#fbbf24",
      "--agents-edge-muted": "rgba(148,163,184,0.34)",
      "--agents-edge-label": "rgba(236,253,245,0.82)",
      "--agents-edge-muted-soft": "rgba(148,163,184,0.66)",
    } as CSSProperties,
  },
  {
    id: "blueprint",
    label: "Blueprint Ice",
    eyebrow: "Navy + Azure",
    description: "Cold, technical, architecture-first viewing mode.",
    preview: ["#7dd3fc", "#38bdf8", "#c4b5fd"],
    variables: {
      "--agents-page-bg": "#08111f",
      "--agents-hero-gradient": "linear-gradient(135deg, rgba(15,29,55,0.98) 0%, rgba(8,17,31,0.98) 56%, rgba(9,13,28,0.96) 100%)",
      "--agents-orb-a": "rgba(56,189,248,0.24)",
      "--agents-orb-b": "rgba(196,181,253,0.14)",
      "--agents-orb-c": "rgba(34,211,238,0.16)",
      "--agents-panel-bg": "rgba(9,17,32,0.78)",
      "--agents-panel-strong": "rgba(11,19,36,0.94)",
      "--agents-panel-border": "rgba(125,211,252,0.18)",
      "--agents-panel-highlight": "rgba(255,255,255,0.05)",
      "--agents-panel-shadow": "rgba(3,7,17,0.46)",
      "--agents-ink": "#e0f2fe",
      "--agents-ink-muted": "rgba(224,242,254,0.74)",
      "--agents-ink-soft": "rgba(224,242,254,0.46)",
      "--agents-accent": "#38bdf8",
      "--agents-accent-strong": "#0ea5e9",
      "--agents-accent-soft": "rgba(56,189,248,0.14)",
      "--agents-accent-border": "rgba(56,189,248,0.32)",
      "--agents-accent-text": "#bae6fd",
      "--agents-accent-contrast": "#07111d",
      "--agents-chip-bg": "rgba(255,255,255,0.04)",
      "--agents-chip-border": "rgba(255,255,255,0.08)",
      "--agents-chip-text": "rgba(224,242,254,0.72)",
      "--agents-flow-bg": "linear-gradient(180deg, rgba(5,12,24,0.98) 0%, rgba(4,9,18,0.96) 100%)",
      "--agents-flow-grid": "rgba(125,211,252,0.11)",
      "--agents-gateway-bg": "radial-gradient(circle at 28% 30%, rgba(56,189,248,0.36), rgba(9,18,41,0.96) 72%)",
      "--agents-gateway-border": "rgba(125,211,252,0.42)",
      "--agents-gateway-glow": "rgba(56,189,248,0.22)",
      "--agents-agent-bg": "linear-gradient(180deg, rgba(15,25,46,0.96), rgba(9,17,34,0.98))",
      "--agents-agent-border": "rgba(125,211,252,0.16)",
      "--agents-agent-selected-bg": "linear-gradient(180deg, rgba(12,33,54,0.98), rgba(8,21,37,1))",
      "--agents-agent-selected-border": "rgba(125,211,252,0.54)",
      "--agents-card-shadow": "rgba(0,0,0,0.24)",
      "--agents-card-selected-shadow": "rgba(14,165,233,0.24)",
      "--agents-runtime-bg": "linear-gradient(180deg, rgba(17,32,54,0.92), rgba(11,21,38,0.98))",
      "--agents-runtime-border": "rgba(125,211,252,0.24)",
      "--agents-channel-bg": "linear-gradient(180deg, rgba(8,41,57,0.92), rgba(7,24,36,0.98))",
      "--agents-channel-border": "rgba(34,211,238,0.28)",
      "--agents-channel-text": "#cffafe",
      "--agents-workspace-bg": "linear-gradient(180deg, rgba(23,32,57,0.92), rgba(15,21,36,0.98))",
      "--agents-workspace-border": "rgba(196,181,253,0.28)",
      "--agents-workspace-text": "#ddd6fe",
      "--agents-edge-delegation": "#93c5fd",
      "--agents-edge-route": "#38bdf8",
      "--agents-edge-workspace": "#c4b5fd",
      "--agents-edge-muted": "rgba(148,163,184,0.34)",
      "--agents-edge-label": "rgba(224,242,254,0.82)",
      "--agents-edge-muted-soft": "rgba(148,163,184,0.66)",
    } as CSSProperties,
  },
  {
    id: "ember",
    label: "Ember Relay",
    eyebrow: "Copper + Amber",
    description: "Warmer, sharper and more theatrical for a cinematic deck.",
    preview: ["#fb923c", "#f59e0b", "#fda4af"],
    variables: {
      "--agents-page-bg": "#140d09",
      "--agents-hero-gradient": "linear-gradient(135deg, rgba(38,20,12,0.98) 0%, rgba(20,13,9,0.98) 56%, rgba(15,9,7,0.96) 100%)",
      "--agents-orb-a": "rgba(251,146,60,0.20)",
      "--agents-orb-b": "rgba(244,114,182,0.12)",
      "--agents-orb-c": "rgba(245,158,11,0.18)",
      "--agents-panel-bg": "rgba(24,14,10,0.78)",
      "--agents-panel-strong": "rgba(31,17,12,0.94)",
      "--agents-panel-border": "rgba(251,146,60,0.18)",
      "--agents-panel-highlight": "rgba(255,255,255,0.04)",
      "--agents-panel-shadow": "rgba(8,4,3,0.5)",
      "--agents-ink": "#ffedd5",
      "--agents-ink-muted": "rgba(255,237,213,0.74)",
      "--agents-ink-soft": "rgba(255,237,213,0.46)",
      "--agents-accent": "#fb923c",
      "--agents-accent-strong": "#f97316",
      "--agents-accent-soft": "rgba(251,146,60,0.14)",
      "--agents-accent-border": "rgba(251,146,60,0.32)",
      "--agents-accent-text": "#fdba74",
      "--agents-accent-contrast": "#160c07",
      "--agents-chip-bg": "rgba(255,255,255,0.04)",
      "--agents-chip-border": "rgba(255,255,255,0.08)",
      "--agents-chip-text": "rgba(255,237,213,0.72)",
      "--agents-flow-bg": "linear-gradient(180deg, rgba(18,10,7,0.98) 0%, rgba(12,7,5,0.96) 100%)",
      "--agents-flow-grid": "rgba(251,191,36,0.10)",
      "--agents-gateway-bg": "radial-gradient(circle at 28% 30%, rgba(251,146,60,0.34), rgba(34,16,8,0.96) 72%)",
      "--agents-gateway-border": "rgba(251,146,60,0.42)",
      "--agents-gateway-glow": "rgba(249,115,22,0.20)",
      "--agents-agent-bg": "linear-gradient(180deg, rgba(33,19,12,0.96), rgba(20,12,9,0.98))",
      "--agents-agent-border": "rgba(251,146,60,0.15)",
      "--agents-agent-selected-bg": "linear-gradient(180deg, rgba(48,26,12,0.98), rgba(27,15,8,1))",
      "--agents-agent-selected-border": "rgba(251,191,36,0.52)",
      "--agents-card-shadow": "rgba(0,0,0,0.26)",
      "--agents-card-selected-shadow": "rgba(249,115,22,0.24)",
      "--agents-runtime-bg": "linear-gradient(180deg, rgba(35,22,13,0.92), rgba(22,14,10,0.98))",
      "--agents-runtime-border": "rgba(249,115,22,0.24)",
      "--agents-channel-bg": "linear-gradient(180deg, rgba(51,25,15,0.92), rgba(31,16,11,0.98))",
      "--agents-channel-border": "rgba(251,146,60,0.28)",
      "--agents-channel-text": "#fdba74",
      "--agents-workspace-bg": "linear-gradient(180deg, rgba(53,34,10,0.92), rgba(31,20,8,0.98))",
      "--agents-workspace-border": "rgba(245,158,11,0.26)",
      "--agents-workspace-text": "#fcd34d",
      "--agents-edge-delegation": "#fb923c",
      "--agents-edge-route": "#fda4af",
      "--agents-edge-workspace": "#fbbf24",
      "--agents-edge-muted": "rgba(168,162,158,0.34)",
      "--agents-edge-label": "rgba(255,237,213,0.82)",
      "--agents-edge-muted-soft": "rgba(168,162,158,0.62)",
    } as CSSProperties,
  },
];

const DEFAULT_AGENTS_STYLE: AgentsStyleId = "operator";

function loadSavedAgentsStyle(): AgentsStyleId {
  if (typeof window === "undefined") return DEFAULT_AGENTS_STYLE;
  try {
    const raw = localStorage.getItem(AGENTS_STYLE_STORAGE_KEY);
    return AGENTS_STYLE_PRESETS.some((preset) => preset.id === raw)
      ? (raw as AgentsStyleId)
      : DEFAULT_AGENTS_STYLE;
  } catch {
    return DEFAULT_AGENTS_STYLE;
  }
}

function saveAgentsStyle(id: AgentsStyleId) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AGENTS_STYLE_STORAGE_KEY, id);
  } catch {
    // ignore localStorage errors
  }
}

function getAgentsStylePreset(id: AgentsStyleId): AgentsStylePreset {
  return AGENTS_STYLE_PRESETS.find((preset) => preset.id === id) || AGENTS_STYLE_PRESETS[0];
}

function loadSavedPositions(): Record<string, { x: number; y: number }> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(POSITIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePositions(positions: Record<string, { x: number; y: number }>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(POSITIONS_STORAGE_KEY, JSON.stringify(positions));
  } catch { /* quota exceeded — ignore */ }
}

function clearSavedPositions() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(POSITIONS_STORAGE_KEY);
  } catch { /* ignore */ }
}

function loadSavedAgentOrder(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(AGENT_ORDER_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed)
      ? parsed.map((v) => String(v || "").trim()).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

function saveAgentOrder(order: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AGENT_ORDER_STORAGE_KEY, JSON.stringify(order));
  } catch {
    // ignore localStorage errors
  }
}

function applySavedOrder(agents: Agent[], order: string[]): Agent[] {
  if (order.length === 0) return agents;
  const rank = new Map<string, number>();
  for (let i = 0; i < order.length; i += 1) {
    rank.set(order[i], i);
  }
  return [...agents].sort((a, b) => {
    const ra = rank.has(a.id) ? (rank.get(a.id) as number) : Number.MAX_SAFE_INTEGER;
    const rb = rank.has(b.id) ? (rank.get(b.id) as number) : Number.MAX_SAFE_INTEGER;
    if (ra !== rb) return ra - rb;
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return a.name.localeCompare(b.name);
  });
}

/* ================================================================
   Types
   ================================================================ */

type Agent = {
  id: string;
  name: string;
  emoji: string;
  model: string;
  fallbackModels: string[];
  workspace: string;
  agentDir: string;
  isDefault: boolean;
  sessionCount: number;
  lastActive: number | null;
  totalTokens: number;
  bindings: string[];
  channels: string[];
  identitySnippet: string | null;
  identityTheme: string | null;
  identityAvatar: string | null;
  identitySource: string | null;
  skills: string[] | null;
  subagents: string[];
  runtimeSubagents: Array<{
    sessionKey: string;
    sessionId: string;
    shortId: string;
    model: string;
    totalTokens: number;
    lastActive: number;
    ageMs: number;
    status: "running" | "recent";
  }>;
  status: "active" | "idle" | "unknown";
};

type ConfiguredChannel = {
  channel: string;
  enabled: boolean;
};

type AgentsResponse = {
  agents: Agent[];
  owner: string | null;
  defaultModel: string;
  defaultFallbacks: string[];
  configuredChannels?: ConfiguredChannel[];
};

type AgentGroup = {
  id: string;
  label: string;
  agents: string[];
};

const MISSION_CONTROL_GROUPS: AgentGroup[] = [
  { id: "intelligence", label: "INTELLIGENCE", agents: ["intent-analyzer", "strategy-engine", "task-graph-builder", "dispatcher", "execution-manager"] },
  { id: "archi", label: "ARCHI", agents: ["backend-architect", "system-architect"] },
  { id: "production", label: "PRODUCTION", agents: ["dev-engineer", "web-builder", "data-analyst"] },
  { id: "ops", label: "OPS", agents: ["devops-engineer", "automation-engineer", "security-engineer"] },
  { id: "control", label: "CONTROL", agents: ["qa-engineer", "validator", "feedback-loop"] },
  { id: "expertise", label: "EXPERTISE", agents: ["research-agent", "product-manager", "crypto-analyst"] },
  { id: "autres", label: "AUTRES", agents: ["ai-engineer", "ui-designer", "memory-manager"] },
];

const MISSION_CONTROL_GROUP_ORDER = [
  "intelligence",
  "archi",
  "production",
  "ops",
  "control",
  "expertise",
  "autres",
] as const;

const MISSION_CONTROL_MAIN_AGENT_ID = "main";

/* ================================================================
   Helpers
   ================================================================ */

function formatTokens(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(1)}K`;
  return `${(n / 1_000_000).toFixed(2)}M`;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatAgo(ms: number | null): string {
  if (!ms) return "Never";
  const diff = Date.now() - ms;
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function shortModel(m: string): string {
  const parts = m.split("/");
  return parts[parts.length - 1];
}

function channelIcon(ch: string): string {
  switch (ch) {
    case "telegram": return "✈️";
    case "whatsapp": return "💬";
    case "email": return "📧";
    case "discord": return "🎮";
    case "slack": return "💼";
    case "web": return "🌐";
    default: return "📡";
  }
}

function shortPath(p: string): string {
  const parts = p.split("/");
  return parts[parts.length - 1] || parts[parts.length - 2] || p;
}

const STATUS_COLORS: Record<string, { dot: string; text: string }> = {
  active: { dot: "bg-emerald-400", text: "text-emerald-400" },
  idle: { dot: "bg-amber-400", text: "text-amber-400" },
  unknown: { dot: "bg-zinc-500", text: "text-muted-foreground" },
};


const AGENT_GRAPH_COLORS = {
  delegation: "var(--agents-edge-delegation)",
  delegationLabel: "var(--agents-edge-label)",
  route: "var(--agents-edge-route)",
  routeLabel: "var(--agents-edge-label)",
  workspace: "var(--agents-edge-workspace)",
  muted: "var(--agents-edge-muted)",
  mutedSoft: "var(--agents-edge-muted-soft)",
};

/* ================================================================
   Add Agent Modal
   ================================================================ */

type AvailableModel = {
  key: string;
  name: string;
  available: boolean;
  local: boolean;
  contextWindow: number;
};

type AuthProviderInfo = {
  provider: string;
  authenticated: boolean;
  authKind: string | null;
};

/* ── Provider metadata for display ── */

const PROVIDER_META: Record<string, { label: string; icon: string; color: string; keyUrl?: string; keyHint: string }> = {
  anthropic: { label: "Anthropic", icon: "🟣", color: "violet", keyUrl: "https://console.anthropic.com/settings/keys", keyHint: "sk-ant-..." },
  openai: { label: "OpenAI", icon: "🟢", color: "emerald", keyUrl: "https://platform.openai.com/api-keys", keyHint: "sk-..." },
  google: { label: "Google", icon: "🔵", color: "blue", keyUrl: "https://aistudio.google.com/apikey", keyHint: "AIza..." },
  openrouter: { label: "OpenRouter", icon: "🟠", color: "orange", keyUrl: "https://openrouter.ai/keys", keyHint: "sk-or-..." },
  minimax: { label: "MiniMax", icon: "🟡", color: "yellow", keyUrl: "https://platform.minimaxi.com/", keyHint: "eyJ..." },
  groq: { label: "Groq", icon: "⚡", color: "cyan", keyUrl: "https://console.groq.com/keys", keyHint: "gsk_..." },
  xai: { label: "xAI", icon: "𝕏", color: "zinc", keyUrl: "https://console.x.ai/", keyHint: "xai-..." },
  mistral: { label: "Mistral", icon: "🌊", color: "sky", keyUrl: "https://console.mistral.ai/api-keys/", keyHint: "" },
  zai: { label: "Z.AI", icon: "💎", color: "indigo", keyHint: "" },
  cerebras: { label: "Cerebras", icon: "🧠", color: "pink", keyHint: "" },
  ollama: { label: "Ollama (local)", icon: "🦙", color: "lime", keyHint: "Local — no key needed" },
};

const RECOMMENDED_MODELS = [
  "anthropic/claude-opus-4-6",
  "anthropic/claude-sonnet-4-5",
  "openai/gpt-5.2",
  "anthropic/claude-sonnet-4",
  "google/gemini-2.5-pro",
  "minimax/MiniMax-M2.5",
];

/* ── Model Picker: grouped by provider, with auth flow ── */

function ModelPicker({
  value,
  onChange,
  defaultModel,
  disabled,
}: {
  value: string;
  onChange: (model: string) => void;
  defaultModel: string;
  disabled: boolean;
}) {
  const [models, setModels] = useState<AvailableModel[]>([]);
  const [authProviders, setAuthProviders] = useState<AuthProviderInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [addingProvider, setAddingProvider] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchModels = useCallback(async () => {
    try {
      const res = await fetch("/api/models?scope=all");
      const data = await res.json();
      setModels((data.models || []) as AvailableModel[]);
      setAuthProviders((data.authProviders || []) as AuthProviderInfo[]);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { queueMicrotask(() => fetchModels()); }, [fetchModels]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as globalThis.Node)) {
        setOpen(false);
        setAddingProvider(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Focus search when open
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  // Derive authenticated provider set
  const authedProviders = useMemo(
    () => new Set(authProviders.filter((p) => p.authenticated).map((p) => p.provider)),
    [authProviders]
  );

  // Split models: available (authed) vs unavailable
  const { availableModels, groupedAvailable, unauthProviders } = useMemo(() => {
    const avail = models.filter((m) => m.available || m.local);
    const unavail = models.filter((m) => !m.available && !m.local);

    // Group available models by provider
    const grouped: Record<string, AvailableModel[]> = {};
    for (const m of avail) {
      const provider = m.key.split("/")[0] || "other";
      if (!grouped[provider]) grouped[provider] = [];
      grouped[provider].push(m);
    }
    // Sort each group
    for (const key of Object.keys(grouped)) {
      grouped[key].sort((a, b) => (a.name || a.key).localeCompare(b.name || b.key));
    }

    // Find providers that have models but aren't authenticated
    const unavailProviders = new Set<string>();
    for (const m of unavail) {
      const p = m.key.split("/")[0];
      if (p && !authedProviders.has(p)) unavailProviders.add(p);
    }

    return {
      availableModels: avail,
      groupedAvailable: grouped,
      unauthProviders: [...unavailProviders].sort(),
    };
  }, [models, authedProviders]);

  // Filter by search
  const filteredGroups = useMemo(() => {
    if (!search.trim()) return groupedAvailable;
    const q = search.toLowerCase();
    const result: Record<string, AvailableModel[]> = {};
    for (const [provider, items] of Object.entries(groupedAvailable)) {
      const filtered = items.filter(
        (m) =>
          m.key.toLowerCase().includes(q) ||
          (m.name || "").toLowerCase().includes(q) ||
          provider.toLowerCase().includes(q)
      );
      if (filtered.length > 0) result[provider] = filtered;
    }
    return result;
  }, [groupedAvailable, search]);

  // Provider order: prioritize recommended providers
  const providerOrder = useMemo(() => {
    const priority = ["anthropic", "openai", "google", "minimax", "ollama"];
    const keys = Object.keys(filteredGroups);
    const sorted = [
      ...priority.filter((p) => keys.includes(p)),
      ...keys.filter((p) => !priority.includes(p)).sort(),
    ];
    return sorted;
  }, [filteredGroups]);

  // Selected model display
  const selectedModel = models.find((m) => m.key === value);
  const displayLabel = value
    ? selectedModel
      ? `${selectedModel.name || selectedModel.key.split("/").pop()}`
      : value
    : `Use default (${defaultModel.split("/").pop() || defaultModel})`;
  const selectedProvider = value ? value.split("/")[0] : null;
  const selectedMeta = selectedProvider ? PROVIDER_META[selectedProvider] : null;

  // Save API key
  const handleSaveKey = useCallback(async () => {
    if (!addingProvider || !apiKey.trim()) return;
    setSavingKey(true);
    try {
      const res = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "auth-provider", provider: addingProvider, token: apiKey.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setSaveSuccess(addingProvider);
        setApiKey("");
        setAddingProvider(null);
        // Refresh models
        setLoading(true);
        await fetchModels();
        setTimeout(() => setSaveSuccess(null), 3000);
      }
    } catch { /* ignore */ }
    setSavingKey(false);
  }, [addingProvider, apiKey, fetchModels]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2.5 text-xs text-muted-foreground/50">
        <InlineSpinner size="sm" />
        Loading available models...
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {/* ── Trigger button ── */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
          open
            ? "border-[var(--accent-brand-border)] bg-foreground/5"
            : "border-foreground/10 bg-foreground/5 hover:border-foreground/15",
          disabled && "opacity-40 cursor-not-allowed"
        )}
      >
        {selectedMeta && <span className="text-sm">{selectedMeta.icon}</span>}
        <span className={cn("flex-1 truncate", !value && "text-muted-foreground/60")}>
          {displayLabel}
        </span>
        {value && authedProviders.has(value.split("/")[0]) && (
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
        )}
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground/50 transition-transform", open && "rotate-180")} />
      </button>

      {/* ── Success toast ── */}
      {saveSuccess && (
        <div className="mt-1.5 flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5 text-xs text-emerald-400 animate-in fade-in slide-in-from-top-1">
          <CheckCircle className="h-3 w-3 shrink-0" />
          {PROVIDER_META[saveSuccess]?.label || saveSuccess} connected! Models are now available.
        </div>
      )}

      {/* ── Dropdown ── */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 flex max-h-96 flex-col overflow-hidden rounded-xl border border-foreground/10 bg-card shadow-2xl">
          {/* Search */}
          <div className="flex items-center gap-2 border-b border-foreground/10 px-3 py-2">
            <Search className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search models..."
              aria-label="Search models"
              className="flex-1 bg-transparent text-xs text-foreground/90 placeholder:text-muted-foreground/60 outline-none"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} className="text-muted-foreground/40 hover:text-foreground/60">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Default option */}
            {!search && (
              <button
                type="button"
                onClick={() => { onChange(""); setOpen(false); }}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors hover:bg-[var(--accent-brand-subtle)]",
                  !value && "bg-[var(--accent-brand-subtle)] text-[var(--accent-brand-text)]"
                )}
              >
                <Star className="h-3.5 w-3.5 text-amber-400" />
                <span className="font-medium">Use default</span>
                <span className="text-xs text-muted-foreground/50">({defaultModel.split("/").pop()})</span>
              </button>
            )}

            {/* Recommended section */}
            {!search && (
              <>
                <div className="px-3 pt-2.5 pb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground/40">
                  Recommended
                </div>
                {RECOMMENDED_MODELS.map((key) => {
                  const m = models.find((x) => x.key === key);
                  if (!m) return null;
                  const provider = key.split("/")[0];
                  const isAuthed = authedProviders.has(provider);
                  const isAvailable = !!(m.available || m.local);
                  const needsKey = !isAvailable && !isAuthed;
                  const meta = PROVIDER_META[provider];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        if (needsKey) {
                          setAddingProvider(provider);
                          return;
                        }
                        if (!isAvailable) return;
                        onChange(key);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors",
                        value === key ? "bg-[var(--accent-brand-subtle)] text-[var(--accent-brand-text)]" : "hover:bg-foreground/5",
                        !isAvailable && "opacity-60"
                      )}
                    >
                      <span className="text-xs">{meta?.icon || "🤖"}</span>
                      <span className="flex-1 font-medium">{m.name || key.split("/").pop()}</span>
                      {isAvailable ? (
                        <ShieldCheck className="h-3 w-3 text-emerald-500" />
                      ) : needsKey ? (
                        <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-xs font-semibold text-amber-400">
                          <Key className="h-2.5 w-2.5" />
                          Needs key
                        </span>
                      ) : (
                        <span className="rounded-full bg-zinc-500/10 px-1.5 py-0.5 text-xs font-semibold text-zinc-400">
                          Unavailable
                        </span>
                      )}
                    </button>
                  );
                })}
                <div className="mx-3 my-1.5 h-px bg-foreground/5" />
              </>
            )}

            {/* Grouped available models */}
            {providerOrder.map((provider) => {
              const items = filteredGroups[provider];
              if (!items) return null;
              const meta = PROVIDER_META[provider];
              const isAuthed = authedProviders.has(provider);
              return (
                <div key={provider}>
                  <div className="flex items-center gap-2 px-3 pt-2.5 pb-1">
                    <span className="text-xs">{meta?.icon || "🤖"}</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/40">
                      {meta?.label || provider}
                    </span>
                    {isAuthed && <ShieldCheck className="h-2.5 w-2.5 text-emerald-500" />}
                    <span className="text-xs text-muted-foreground/30">{items.length}</span>
                  </div>
                  {items.map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => { onChange(m.key); setOpen(false); }}
                      className={cn(
                        "flex w-full items-center gap-2.5 px-3 py-1.5 pl-7 text-left text-xs transition-colors",
                        value === m.key
                          ? "bg-[var(--accent-brand-subtle)] text-[var(--accent-brand-text)]"
                          : "text-foreground/80 hover:bg-foreground/5"
                      )}
                    >
                      <span className="flex-1 truncate">{m.name || m.key.split("/").pop()}</span>
                      {m.local && (
                        <span className="rounded-full bg-lime-500/10 px-1.5 py-0.5 text-xs font-medium text-lime-400">LOCAL</span>
                      )}
                      {RECOMMENDED_MODELS.includes(m.key) && (
                        <Star className="h-2.5 w-2.5 text-amber-400" />
                      )}
                    </button>
                  ))}
                </div>
              );
            })}

            {Object.keys(filteredGroups).length === 0 && search && (
              <div className="px-3 py-3 text-center text-xs text-muted-foreground/50">
                No models match &ldquo;{search}&rdquo;
              </div>
            )}

            {/* ── Add a Provider section ── */}
            {!search && unauthProviders.length > 0 && (
              <>
                <div className="mx-3 my-1.5 h-px bg-foreground/5" />
                <div className="px-3 pt-2 pb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground/40">
                  Connect a new provider
                </div>
                <div className="px-3 pb-2 grid grid-cols-2 gap-1.5">
                  {unauthProviders.slice(0, 8).map((p) => {
                    const meta = PROVIDER_META[p];
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setAddingProvider(p)}
                        className="flex items-center gap-1.5 rounded-lg border border-foreground/10 bg-foreground/5 px-2 py-1.5 text-xs text-muted-foreground/70 transition-colors hover:border-[var(--accent-brand-border)] hover:text-foreground/80"
                      >
                        <span>{meta?.icon || "🤖"}</span>
                        <span className="truncate font-medium">{meta?.label || p}</span>
                        <Plus className="ml-auto h-2.5 w-2.5 text-muted-foreground/30" />
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* ── Inline Add Provider flow ── */}
          {addingProvider && (
            <div className="border-t border-foreground/10 bg-foreground/5 px-3 py-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">{PROVIDER_META[addingProvider]?.icon || "🤖"}</span>
                <span className="text-xs font-semibold text-foreground/80">
                  Connect {PROVIDER_META[addingProvider]?.label || addingProvider}
                </span>
                <button
                  type="button"
                  onClick={() => { setAddingProvider(null); setApiKey(""); setShowKey(false); }}
                  className="ml-auto rounded p-0.5 text-muted-foreground/40 hover:text-foreground/60"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <input
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSaveKey(); } }}
                    placeholder={PROVIDER_META[addingProvider]?.keyHint || "Paste API key..."}
                    aria-label="API key"
                    className="w-full rounded-lg border border-foreground/10 bg-card px-3 py-2 pr-8 text-xs font-mono text-foreground/90 placeholder:text-muted-foreground/50 focus:border-[var(--accent-brand-border)] focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground/60"
                  >
                    {showKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleSaveKey}
                  disabled={!apiKey.trim() || savingKey}
                  className="shrink-0 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-medium transition-colors hover:bg-primary/90 disabled:opacity-40"
                >
                  {savingKey ? (
                    <span className="inline-flex items-center gap-0.5">
                      <span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:0ms]" />
                      <span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:150ms]" />
                      <span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:300ms]" />
                    </span>
                  ) : "Connect"}
                </button>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground/50">
                <Key className="h-2.5 w-2.5" />
                <span>Stored securely in OpenClaw. Never leaves your machine.</span>
                {PROVIDER_META[addingProvider]?.keyUrl && (
                  <a
                    href={PROVIDER_META[addingProvider].keyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto flex items-center gap-0.5 text-[var(--accent-brand-text)] hover:text-[var(--accent-brand)]"
                  >
                    Get a key <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Footer summary */}
          <div className="border-t border-foreground/10 bg-foreground/5 px-3 py-1.5">
            <p className="text-xs text-muted-foreground/40">
              {availableModels.length} models ready from {Object.keys(groupedAvailable).length} providers
              {unauthProviders.length > 0 && ` · ${unauthProviders.length} more providers available`}
            </p>
          </div>
        </div>
      )}

      {/* Status text */}
      {!open && availableModels.length === 0 && (
        <p className="mt-1.5 text-xs text-amber-400">
          No authenticated models found. Click above to connect a provider.
        </p>
      )}
    </div>
  );
}

/* ── Channel info fetched from backend ── */

type ChannelInfo = {
  channel: string;
  label: string;
  icon: string;
  setupType: "qr" | "token" | "cli" | "auto";
  setupCommand: string;
  setupHint: string;
  configHint: string;
  tokenLabel?: string;
  tokenPlaceholder?: string;
  docsUrl: string;
  enabled: boolean;
  configured: boolean;
  accounts: string[];
  statuses: { channel: string; account: string; status: string; linked?: boolean; connected?: boolean; error?: string }[];
};

/* ── Channel Binding Picker: live status, inline setup ── */

function ChannelBindingPicker({
  bindings,
  onAdd,
  onRemove,
  onChannelsChanged,
  disabled,
}: {
  bindings: string[];
  onAdd: (binding: string) => void;
  onRemove: (binding: string) => void;
  onChannelsChanged?: () => void;
  disabled: boolean;
}) {
  const [channels, setChannels] = useState<ChannelInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<ChannelInfo | null>(null);
  const [setupMode, setSetupMode] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [appTokenInput, setAppTokenInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [setupSuccess, setSetupSuccess] = useState<string | null>(null);
  const [accountId, setAccountId] = useState("");

  const fetchChannels = useCallback(async () => {
    try {
      const res = await fetch("/api/channels?scope=all", { cache: "no-store" });
      const data = await res.json();
      setChannels((data.channels || []).map((c: Record<string, unknown>) => ({ ...c, statuses: Array.isArray(c.statuses) ? c.statuses : [] })) as ChannelInfo[]);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { queueMicrotask(() => fetchChannels()); }, [fetchChannels]);

  // Derive channel status
  const getStatus = useCallback((ch: ChannelInfo): { text: string; color: string; ready: boolean } => {
    if (ch.setupType === "auto") return { text: "Always available", color: "emerald", ready: true };
    if (!ch.configured && !ch.enabled) return { text: "Not set up", color: "zinc", ready: false };
    if (ch.enabled) {
      const hasConnected = ch.statuses.some((s) => s.connected || s.linked);
      if (hasConnected) return { text: "Connected", color: "emerald", ready: true };
      const hasError = ch.statuses.some((s) => s.error);
      if (hasError) return { text: "Error", color: "red", ready: false };
      return { text: "Enabled", color: "amber", ready: true };
    }
    return { text: "Configured", color: "amber", ready: true };
  }, []);

  const handleSetupToken = useCallback(async () => {
    if (!selectedChannel || !tokenInput.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "connect",
          channel: selectedChannel.channel,
          token: tokenInput.trim(),
          appToken: appTokenInput.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setSetupSuccess(selectedChannel.channel);
        setTokenInput("");
        setAppTokenInput("");
        setSetupMode(false);
        // Refresh channels
        await fetchChannels();
        onChannelsChanged?.();
        setTimeout(() => setSetupSuccess(null), 4000);
      }
    } catch { /* ignore */ }
    setSaving(false);
  }, [selectedChannel, tokenInput, appTokenInput, fetchChannels, onChannelsChanged]);

  const handleBindChannel = useCallback((ch: ChannelInfo) => {
    const binding = accountId.trim()
      ? `${ch.channel}:${accountId.trim()}`
      : ch.channel;
    onAdd(binding);
    setSelectedChannel(null);
    setAccountId("");
    setSetupMode(false);
  }, [accountId, onAdd]);

  // Split channels: ready vs needs setup
  const { readyChannels, setupChannels } = useMemo(() => {
    const ready: ChannelInfo[] = [];
    const setup: ChannelInfo[] = [];
    for (const ch of channels) {
      const status = getStatus(ch);
      if (status.ready) ready.push(ch);
      else setup.push(ch);
    }
    return { readyChannels: ready, setupChannels: setup };
  }, [channels, getStatus]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground/50">
        <InlineSpinner size="sm" />
        Checking available channels...
      </div>
    );
  }

  return (
    <div>
      {/* Existing bindings chips */}
      {bindings.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {bindings.map((b) => {
            const chKey = b.split(":")[0];
            const chInfo = channels.find((c) => c.channel === chKey);
            const status = chInfo ? getStatus(chInfo) : null;
            return (
              <span key={b} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--accent-brand-border)] bg-[var(--accent-brand-subtle)] px-2.5 py-1 text-xs text-[var(--accent-brand-text)]">
                <span>{chInfo?.icon || "📡"}</span>
                <span className="font-medium">{b}</span>
                {status && (
                  <span className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    status.color === "emerald" ? "bg-emerald-400" : status.color === "amber" ? "bg-amber-400" : "bg-zinc-500"
                  )} />
                )}
                <button
                  type="button"
                  onClick={() => onRemove(b)}
                  className="ml-0.5 rounded text-[var(--accent-brand-text)]/60 hover:text-[var(--accent-brand)]"
                  disabled={disabled}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Success toast */}
      {setupSuccess && (
        <div className="mb-2 flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5 text-xs text-emerald-400 animate-in fade-in slide-in-from-top-1">
          <CheckCircle className="h-3 w-3 shrink-0" />
          {channels.find((c) => c.channel === setupSuccess)?.label || setupSuccess} connected! You can now bind it.
        </div>
      )}

      {/* Channel picker or setup */}
      {!selectedChannel ? (
        <div>
          {/* Ready channels */}
          {readyChannels.length > 0 && (
            <>
              <p className="mb-1.5 text-xs text-muted-foreground/60">
                Connected channels — click to bind:
              </p>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {readyChannels.map((ch, idx) => {
                  const status = getStatus(ch);
                  const alreadyBound = bindings.some((b) => b.split(":")[0] === ch.channel);
                  return (
                    <button
                      key={`${ch.channel}-${idx}`}
                      type="button"
                      onClick={() => {
                        if (alreadyBound) return;
                        setSelectedChannel(ch);
                      }}
                      disabled={disabled || alreadyBound}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors",
                        alreadyBound
                          ? "border-[var(--accent-brand-border)] bg-[var(--accent-brand-subtle)] text-[var(--accent-brand-text)] opacity-60 cursor-not-allowed"
                          : "border-foreground/10 bg-foreground/5 text-foreground/70 hover:border-[var(--accent-brand-border)] hover:bg-[var(--accent-brand-subtle)] hover:text-[var(--accent-brand-text)] disabled:opacity-40"
                      )}
                    >
                      <span className="text-xs">{ch.icon}</span>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium block truncate">{ch.label}</span>
                        <span className={cn(
                          "text-xs",
                          status.color === "emerald" ? "text-emerald-400" : "text-amber-400"
                        )}>
                          {alreadyBound ? "Bound" : status.text}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Channels that need setup */}
          {setupChannels.length > 0 && (
            <>
              <div className={cn(readyChannels.length > 0 && "mt-3")}>
                <p className="mb-1.5 text-xs text-muted-foreground/40">
                  More channels — needs one-time setup:
                </p>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                  {setupChannels.map((ch, idx) => (
                    <button
                      key={`${ch.channel}-${idx}`}
                      type="button"
                      onClick={() => { setSelectedChannel(ch); setSetupMode(true); }}
                      disabled={disabled}
                      className="flex items-center gap-2 rounded-lg border border-dashed border-foreground/10 bg-transparent px-3 py-2 text-left text-xs text-muted-foreground/50 transition-colors hover:border-foreground/15 hover:text-foreground/60 disabled:opacity-40"
                    >
                      <span className="text-sm opacity-60">{ch.icon}</span>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium block truncate">{ch.label}</span>
                        <span className="text-xs text-muted-foreground/30">Set up</span>
                      </div>
                      <Plus className="h-2.5 w-2.5 text-muted-foreground/30" />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {channels.length === 0 && (
            <p className="py-3 text-center text-xs text-muted-foreground/40">
              Could not fetch channels. Is the Gateway running?
            </p>
          )}
        </div>
      ) : (
        /* Selected channel: bind or set up */
        <div className="rounded-lg border border-[var(--accent-brand-border)] bg-[var(--accent-brand-subtle)] p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs">{selectedChannel.icon}</span>
              <span className="text-xs font-semibold text-foreground/80">{selectedChannel.label}</span>
              {getStatus(selectedChannel).ready && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-xs font-medium text-emerald-400">
                  <ShieldCheck className="h-2.5 w-2.5" /> Connected
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => { setSelectedChannel(null); setSetupMode(false); setTokenInput(""); setAppTokenInput(""); setAccountId(""); }}
              className="rounded p-0.5 text-muted-foreground/40 hover:text-foreground/70"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          {/* If channel is ready — just bind */}
          {getStatus(selectedChannel).ready && !setupMode ? (
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleBindChannel(selectedChannel); } }}
                  placeholder="Account ID (optional — leave empty for all)"
                  aria-label="Account ID (optional)"
                  className="flex-1 rounded-lg border border-foreground/10 bg-card px-3 py-2 text-xs text-foreground/90 placeholder:text-muted-foreground/60 focus:border-[var(--accent-brand-border)] focus:outline-none"
                  autoFocus
                  disabled={disabled}
                />
                <button
                  type="button"
                  onClick={() => handleBindChannel(selectedChannel)}
                  disabled={disabled}
                  className="shrink-0 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-medium transition-colors hover:bg-primary/90 disabled:opacity-40"
                >
                  Bind
                </button>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground/50">
                Leave empty to route all {selectedChannel.label} messages to this agent.
                {selectedChannel.accounts.length > 1 && (
                  <> Accounts: {selectedChannel.accounts.join(", ")}</>
                )}
              </p>
            </div>
          ) : (
            /* Channel needs setup */
            <div>
              <p className="mb-2 text-xs text-foreground/60">
                {selectedChannel.setupHint}
              </p>

              {/* Token-based setup (Telegram, Discord, Slack, etc.) */}
              {selectedChannel.setupType === "token" && (
                <div className="space-y-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground/60">
                      {selectedChannel.tokenLabel || "Token"}
                    </label>
                    <input
                      type="password"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && tokenInput.trim()) { e.preventDefault(); handleSetupToken(); } }}
                      placeholder={selectedChannel.tokenPlaceholder || "Paste token here..."}
                      aria-label={selectedChannel.tokenLabel || "Token"}
                      className="w-full rounded-lg border border-foreground/10 bg-card px-3 py-2 text-xs font-mono text-foreground/90 placeholder:text-muted-foreground/50 focus:border-[var(--accent-brand-border)] focus:outline-none"
                      autoFocus
                      disabled={saving}
                    />
                  </div>
                  {selectedChannel.channel === "slack" && (
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground/60">
                        App Token (Socket Mode)
                      </label>
                      <input
                        type="password"
                        value={appTokenInput}
                        onChange={(e) => setAppTokenInput(e.target.value)}
                        placeholder="xapp-..."
                        aria-label="App Token (Socket Mode)"
                        className="w-full rounded-lg border border-foreground/10 bg-card px-3 py-2 text-xs font-mono text-foreground/90 placeholder:text-muted-foreground/50 focus:border-[var(--accent-brand-border)] focus:outline-none"
                        disabled={saving}
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSetupToken}
                      disabled={!tokenInput.trim() || saving}
                      className="rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-medium transition-colors hover:bg-primary/90 disabled:opacity-40"
                    >
                      {saving ? (
                        <span className="flex items-center gap-1.5"><span className="inline-flex items-center gap-0.5"><span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:0ms]" /><span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:150ms]" /><span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:300ms]" /></span> Connecting...</span>
                      ) : (
                        "Connect & Save"
                      )}
                    </button>
                    <a
                      href={selectedChannel.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[var(--accent-brand-text)] hover:text-[var(--accent-brand)] flex items-center gap-0.5"
                    >
                      Setup guide <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                  <p className="text-xs text-muted-foreground/40">
                    Token is stored securely in OpenClaw credentials. Never leaves your machine.
                  </p>
                </div>
              )}

              {/* QR-based setup (WhatsApp) */}
              {selectedChannel.setupType === "qr" && (
                <div className="space-y-2">
                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                    <p className="text-xs font-medium text-amber-400 mb-1">Interactive setup required</p>
                    <p className="text-xs text-muted-foreground/60">
                      {selectedChannel.label} requires scanning a QR code. Open the Terminal and run:
                    </p>
                    <code className="mt-1.5 block rounded bg-black/30 px-2 py-1.5 text-xs font-mono text-emerald-400">
                      {selectedChannel.setupCommand}
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/terminal"
                      className="rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-medium transition-colors hover:bg-primary/90 inline-flex items-center gap-1.5"
                    >
                      Open Terminal
                    </Link>
                    <a
                      href={selectedChannel.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[var(--accent-brand-text)] hover:text-[var(--accent-brand)] flex items-center gap-0.5"
                    >
                      Setup guide <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                </div>
              )}

              {/* CLI-based setup */}
              {selectedChannel.setupType === "cli" && (
                <div className="space-y-2">
                  <div className="rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2">
                    {selectedChannel.setupCommand ? (
                      <>
                        <p className="text-xs text-muted-foreground/60 mb-1">
                          Run this command in the Terminal:
                        </p>
                        <code className="block rounded bg-black/30 px-2 py-1.5 text-xs font-mono text-emerald-400">
                          {selectedChannel.setupCommand}
                        </code>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground/70">
                        {selectedChannel.setupHint || "Manual setup is required. Follow the official docs for this channel."}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedChannel.setupCommand ? (
                      <Link
                        href="/terminal"
                        className="rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-medium transition-colors hover:bg-primary/90 inline-flex items-center gap-1.5"
                      >
                        Open Terminal
                      </Link>
                    ) : null}
                    <a
                      href={selectedChannel.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[var(--accent-brand-text)] hover:text-[var(--accent-brand)] flex items-center gap-0.5"
                    >
                      Docs <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                </div>
              )}

              {selectedChannel.configHint && (
                <p className="mt-1 text-xs text-muted-foreground/40 italic">
                  {selectedChannel.configHint}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Fallback models (for create-agent wizard) ── */

function FallbackModelsField({
  primary,
  fallbacks,
  onAdd,
  onRemove,
  disabled,
}: {
  primary: string;
  fallbacks: string[];
  onAdd: (key: string) => void;
  onRemove: (key: string) => void;
  disabled: boolean;
}) {
  const [models, setModels] = useState<{ key: string; name: string }[]>([]);
  useEffect(() => {
    fetch("/api/models?scope=status")
      .then((r) => r.json())
      .then((d) => setModels((d.models || []).map((m: { key: string; name?: string }) => ({ key: m.key, name: m.name || m.key }))));
  }, []);
  const addable = models.filter((m) => m.key !== primary && !fallbacks.includes(m.key));
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-foreground/70">
        Fallback models
        <span className="ml-1 text-xs font-normal text-muted-foreground/40">optional</span>
      </label>
      <p className="mb-1.5 text-[11px] text-muted-foreground/50">
        Used when the primary model is unavailable (failover).
      </p>
      {fallbacks.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {fallbacks.map((key) => (
            <span
              key={key}
              className="inline-flex items-center gap-1 rounded-md border border-foreground/10 bg-foreground/5 px-2 py-1 text-xs text-foreground/80"
            >
              {key.split("/").pop() || key}
              <button
                type="button"
                onClick={() => onRemove(key)}
                disabled={disabled}
                className="rounded p-0.5 text-muted-foreground/60 hover:text-red-400 disabled:opacity-40"
                aria-label="Remove"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      {addable.length > 0 && (
        <select
          value=""
          onChange={(e) => {
            const v = e.target.value;
            if (v) onAdd(v);
            e.target.value = "";
          }}
          disabled={disabled}
          className="w-full rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2 text-xs text-foreground/80 focus:border-[var(--accent-brand-border)] focus:outline-none disabled:opacity-40"
        >
          <option value="">Add fallback model...</option>
          {addable.map((m) => (
            <option key={m.key} value={m.key}>
              {m.name || m.key}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

function buildCliCommand(opts: {
  name: string;
  model: string;
  workspace: string;
  agentDir: string;
  bindings: string[];
  setAsDefault: boolean;
}): string {
  const parts = ["openclaw agents add", opts.name];
  if (opts.model) parts.push("--model", opts.model);
  if (opts.workspace) parts.push("--workspace", opts.workspace);
  if (opts.agentDir) parts.push("--agent-dir", opts.agentDir);
  for (const b of opts.bindings) parts.push("--bind", b);
  if (opts.setAsDefault) parts.push("--default");
  return parts.join(" ");
}

function CliCommandPreview({ command, busy }: { command: string; busy: boolean }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(command).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [command]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Terminal className="h-3 w-3 text-muted-foreground/50" />
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Command preview
        </p>
      </div>
      <div className="group relative rounded-lg border border-foreground/10 bg-foreground/[0.03]">
        <pre className="overflow-x-auto px-3 py-2.5 text-xs font-mono text-foreground/80 leading-relaxed">
          {command}
        </pre>
        <button
          type="button"
          onClick={handleCopy}
          disabled={busy}
          className="absolute right-2 top-2 rounded-md border border-foreground/10 bg-card px-1.5 py-1 text-muted-foreground/50 opacity-0 transition-opacity hover:text-foreground/70 group-hover:opacity-100 disabled:opacity-0"
        >
          {copied ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>
      <p className="text-[11px] text-muted-foreground/40">
        This is the equivalent CLI command that will be executed.
      </p>
    </div>
  );
}

function AddAgentModal({
  onClose,
  onCreated,
  onChannelsChanged,
  defaultModel,
  existingAgents = [],
}: {
  onClose: () => void;
  onCreated: () => void;
  onChannelsChanged?: () => void;
  defaultModel: string;
  existingAgents?: { id: string; name?: string }[];
}) {
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [model, setModel] = useState("");
  const [fallbacks, setFallbacks] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [workspace, setWorkspace] = useState("");
  const [agentDir, setAgentDir] = useState("");
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [subagents, setSubagents] = useState<string[]>([]);
  const [bindings, setBindings] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { nameRef.current?.focus(); }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape" && !busy) onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, busy]);

  const addBinding = useCallback((binding: string) => {
    if (!bindings.includes(binding)) {
      setBindings((prev) => [...prev, binding]);
    }
  }, [bindings]);

  const removeBinding = useCallback((b: string) => {
    setBindings((prev) => prev.filter((x) => x !== b));
  }, []);

  // Build CLI command from current form state
  const cliCommand = useMemo(
    () =>
      buildCliCommand({
        name: name.trim(),
        model,
        workspace: workspace.trim(),
        agentDir: agentDir.trim(),
        bindings,
        setAsDefault,
      }),
    [name, model, workspace, agentDir, bindings, setAsDefault]
  );

  const handleCreate = useCallback(async () => {
    if (!name.trim()) {
      setError("Agent name is required");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          name: name.trim(),
          displayName: displayName.trim() || undefined,
          model: model || undefined,
          fallbacks: fallbacks.length > 0 ? fallbacks : undefined,
          default: setAsDefault || undefined,
          subagents: subagents.length > 0 ? subagents : undefined,
          workspace: workspace.trim() || undefined,
          agentDir: agentDir.trim() || undefined,
          bindings: bindings.length > 0 ? bindings : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || `Failed (HTTP ${res.status})`);
        setBusy(false);
        return;
      }
      setSuccess(true);
      requestRestart("New agent was added — restart to pick up changes.");
      setTimeout(() => {
        onCreated();
        onClose();
      }, 1500);
    } catch (err) {
      setError(String(err));
    }
    setBusy(false);
  }, [name, displayName, model, fallbacks, setAsDefault, subagents, workspace, agentDir, bindings, onCreated, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-backdrop-in" onClick={() => { if (!busy) onClose(); }} />

      <div className="relative z-10 flex max-h-[calc(100vh-3rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl glass-strong animate-modal-in">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-foreground/10 px-4 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-brand-subtle)]">
              <Sparkles className="h-4 w-4 text-[var(--accent-brand-text)]" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-foreground">Create New Agent</h2>
              <p className="text-xs text-muted-foreground">Isolated workspace, sessions & auth</p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={busy} className="rounded p-1 text-muted-foreground/60 hover:text-foreground/70 disabled:opacity-40">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable form */}
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-4">
          {/* Step 1 — Identity */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              1. Identity
            </p>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground/70">
                Agent ID <span className="text-red-400">*</span>
              </label>
              <input
                ref={nameRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                placeholder="e.g. work, research, creative"
                className="w-full rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2.5 text-sm text-foreground/90 placeholder:text-muted-foreground/60 focus:border-[var(--accent-brand-border)] focus:outline-none"
                disabled={busy}
              />
              <p className="mt-1 text-xs text-muted-foreground/50">
                Unique ID used throughout OpenClaw — auto-formatted to lowercase
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground/70">
                Display name
                <span className="ml-1 text-xs font-normal text-muted-foreground/40">optional</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={name ? `e.g. ${name.charAt(0).toUpperCase() + name.slice(1)}` : "Friendly name in UI"}
                className="w-full rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2.5 text-sm text-foreground/90 placeholder:text-muted-foreground/60 focus:border-[var(--accent-brand-border)] focus:outline-none"
                disabled={busy}
              />
            </div>
          </div>

          {/* Step 2 — Model */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              2. Model
            </p>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground/70">
                Primary model
              </label>
              <ModelPicker
                value={model}
                onChange={setModel}
                defaultModel={defaultModel}
                disabled={busy}
              />
            </div>
            <FallbackModelsField
              primary={model}
              fallbacks={fallbacks}
              onAdd={(key) => setFallbacks((prev) => (prev.includes(key) ? prev : [...prev, key]))}
              onRemove={(key) => setFallbacks((prev) => prev.filter((k) => k !== key))}
              disabled={busy}
            />
          </div>

          {/* Step 3 — Channels */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              3. Channel bindings
            </p>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground/70">
                Route channels to this agent
                <span className="ml-1 text-xs font-normal text-muted-foreground/40">optional</span>
              </label>
              <ChannelBindingPicker
                bindings={bindings}
                onAdd={addBinding}
                onRemove={removeBinding}
                onChannelsChanged={onChannelsChanged}
                disabled={busy}
              />
            </div>
          </div>

          {/* Step 4 — Advanced */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 transition-colors hover:text-foreground/60"
            >
              <ChevronDown className={cn("h-3 w-3 transition-transform", showAdvanced && "rotate-180")} />
              4. Advanced options
            </button>
            {showAdvanced && (
              <div className="space-y-2 rounded-lg border border-foreground/10 bg-foreground/[0.02] p-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground/70">
                    Custom workspace path
                  </label>
                  <input
                    type="text"
                    value={workspace}
                    onChange={(e) => setWorkspace(e.target.value)}
                    placeholder={`~/.openclaw/workspace-${name || "<name>"}`}
                    className="w-full rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2 text-xs font-mono text-foreground/80 placeholder:text-muted-foreground/60 focus:border-[var(--accent-brand-border)] focus:outline-none"
                    disabled={busy}
                  />
                  <p className="mt-1 text-xs text-muted-foreground/40">
                    Defaults to <code>~/.openclaw/workspace-{name || "<name>"}</code>
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground/70">
                    Custom agent state directory
                  </label>
                  <input
                    type="text"
                    value={agentDir}
                    onChange={(e) => setAgentDir(e.target.value)}
                    placeholder={`~/.openclaw/agents/${name || "<name>"}/agent`}
                    className="w-full rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2 text-xs font-mono text-foreground/80 placeholder:text-muted-foreground/60 focus:border-[var(--accent-brand-border)] focus:outline-none"
                    disabled={busy}
                  />
                  <p className="mt-1 text-xs text-muted-foreground/40">
                    Matches <code>openclaw agents add --agent-dir</code>
                  </p>
                </div>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={setAsDefault}
                    onChange={(e) => setSetAsDefault(e.target.checked)}
                    disabled={busy}
                    className="h-3.5 w-3.5 rounded border-foreground/20 text-[var(--accent-brand)] focus:ring-[var(--accent-brand-ring)]"
                  />
                  <span className="text-xs text-foreground/80">Set as default agent</span>
                </label>
                {existingAgents.length > 0 && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground/70">
                      Subagents (can delegate to)
                    </label>
                    <p className="mb-1.5 text-[11px] text-muted-foreground/50">
                      Allow this agent to spawn sessions with these agents via sessions_spawn.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {existingAgents.map((a) => (
                        <label
                          key={a.id}
                          className={cn(
                            "flex cursor-pointer items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors",
                            subagents.includes(a.id)
                              ? "border-[var(--accent-brand-border)] bg-[var(--accent-brand-subtle)] text-[var(--accent-brand)]"
                              : "border-foreground/10 bg-foreground/5 text-muted-foreground hover:bg-foreground/10"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={subagents.includes(a.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSubagents((prev) => [...prev, a.id]);
                              else setSubagents((prev) => prev.filter((id) => id !== a.id));
                            }}
                            disabled={busy}
                            className="sr-only"
                          />
                          {a.name || a.id}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Command Preview */}
          {name.trim() && (
            <CliCommandPreview command={cliCommand} busy={busy} />
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-400">
              <CheckCircle className="h-3.5 w-3.5 shrink-0" />
              Agent &ldquo;{name}&rdquo; created successfully!
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-foreground/10 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-lg border border-foreground/10 px-4 py-2 text-xs text-muted-foreground transition-colors hover:bg-foreground/5 disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={busy || !name.trim() || success}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--accent-brand)] text-[var(--accent-brand-on)] px-4 py-2 text-xs font-medium transition-colors hover:opacity-90 disabled:opacity-40"
          >
            {busy ? (
              <>
                <span className="inline-flex items-center gap-0.5">
                  <span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:0ms]" />
                  <span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:150ms]" />
                  <span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:300ms]" />
                </span>
                Running...
              </>
            ) : success ? (
              <>
                <CheckCircle className="h-3.5 w-3.5" />
                Done!
              </>
            ) : (
              <>
                <Terminal className="h-3.5 w-3.5" />
                Run & Create Agent
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   Edit Agent Modal
   ================================================================ */

function EditAgentModal({
  agent,
  idx,
  allAgents,
  defaultModel,
  onClose,
  onSaved,
  onMove,
  onChannelsChanged,
}: {
  agent: Agent;
  idx: number;
  allAgents: Agent[];
  defaultModel: string;
  onClose: () => void;
  onSaved: () => void;
  onMove: (agentId: string, direction: "up" | "down") => Promise<void>;
  onChannelsChanged?: () => void;
}) {
  /* ── derive initial bindings in channel:accountId format ── */
  const initialBindings = useMemo(
    () =>
      agent.bindings.map((b) => {
        const ch = b.split(" ")[0];
        const accMatch = b.match(/accountId=(\S+)/);
        return accMatch ? `${ch}:${accMatch[1]}` : ch;
      }),
    [agent.bindings]
  );

  const [model, setModel] = useState(agent.model);
  const [fallbacks, setFallbacks] = useState<string[]>(agent.fallbackModels);
  const [subagents, setSubagents] = useState<string[]>(agent.subagents);
  const [skillsMode, setSkillsMode] = useState<"all" | "custom">(
    agent.skills !== null ? "custom" : "all"
  );
  const [selectedSkills, setSelectedSkills] = useState<string[]>(agent.skills || []);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [bindings, setBindings] = useState<string[]>(initialBindings);
  const [displayName, setDisplayName] = useState(agent.name);
  const [setAsDefault, setSetAsDefault] = useState(agent.isDefault);
  const [identityName, setIdentityName] = useState(agent.name);
  const [identityEmoji, setIdentityEmoji] = useState(agent.emoji);
  const [identityTheme, setIdentityTheme] = useState(agent.identityTheme || "");
  const [identityAvatar, setIdentityAvatar] = useState(agent.identityAvatar || "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /* ── Fetch available models ── */
  const [models, setModels] = useState<AvailableModel[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Agent editing should only expose models usable by this instance,
        // not the full global catalog.
        const res = await fetch("/api/models?scope=configured", {
          cache: "no-store",
        });
        const data = await res.json();
        const all = (data.models || []) as AvailableModel[];
        const allowed = all
          .filter((m) => m.available || m.local)
          .sort((a, b) => (a.name || a.key).localeCompare(b.name || b.key));

        // Keep currently configured values visible even if provider auth changed.
        const byKey = new Map<string, AvailableModel>(
          allowed.map((m) => [m.key, m])
        );
        const ensureModel = (key: string) => {
          if (!key || byKey.has(key)) return;
          byKey.set(key, {
            key,
            name: key.split("/").pop() || key,
            available: false,
            local: false,
            contextWindow: 0,
          });
        };
        ensureModel(agent.model);
        for (const fallback of agent.fallbackModels || []) ensureModel(fallback);
        ensureModel(defaultModel);

        setModels(
          [...byKey.values()].sort((a, b) =>
            (a.name || a.key).localeCompare(b.name || b.key)
          )
        );
      } catch {
        /* ignore */
      }
      setModelsLoading(false);
    })();
  }, [agent.fallbackModels, agent.model, defaultModel]);

  /* ── Fetch available skills ── */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/skills", { cache: "no-store" });
        const data = await res.json();
        const names = ((data.skills || []) as { name: string; eligible?: boolean }[])
          .map((s) => s.name)
          .filter(Boolean)
          .sort();
        setAvailableSkills(names);
      } catch { /* ignore */ }
    })();
  }, []);

  /* ── Channel binding wizard state ── */
  /* ── Keyboard ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, busy]);

  const addBinding = useCallback((binding: string) => {
    if (!bindings.includes(binding)) {
      setBindings((prev) => [...prev, binding]);
    }
  }, [bindings]);

  const removeBinding = useCallback((b: string) => {
    setBindings((prev) => prev.filter((x) => x !== b));
  }, []);

  const toggleFallback = useCallback((modelKey: string) => {
    setFallbacks((prev) =>
      prev.includes(modelKey)
        ? prev.filter((f) => f !== modelKey)
        : [...prev, modelKey]
    );
  }, []);

  const toggleSubagent = useCallback((agentId: string) => {
    setSubagents((prev) =>
      prev.includes(agentId)
        ? prev.filter((s) => s !== agentId)
        : [...prev, agentId]
    );
  }, []);

  const handleLoadIdentityFromWorkspace = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set-identity",
          id: agent.id,
          fromIdentity: true,
          workspace: agent.workspace,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || `Failed (HTTP ${res.status})`);
      }
      requestRestart("Agent identity was updated from IDENTITY.md.");
      setSuccess(true);
      setTimeout(() => {
        onSaved();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }, [agent.id, agent.workspace, onClose, onSaved]);

  const handleDelete = useCallback(async () => {
    if (deleteConfirmText.trim() !== agent.id) {
      setError(`Type "${agent.id}" to confirm delete.`);
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          id: agent.id,
          force: true,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || `Failed (HTTP ${res.status})`);
      }
      requestRestart("Agent deleted — restart to clean up routes and sessions.");
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setDeleting(false);
    }
  }, [agent.id, deleteConfirmText, onClose, onSaved]);

  const moveAgent = useCallback(
    async (direction: "up" | "down") => {
      if (busy || deleting) return;
      setBusy(true);
      setError(null);
      try {
        await onMove(agent.id, direction);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setBusy(false);
      }
    },
    [agent.id, busy, deleting, onMove]
  );

  /* ── Save ── */
  const handleSave = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const updateBody: Record<string, unknown> = {
        action: "update",
        id: agent.id,
        model: model || null,
        fallbacks: fallbacks.length > 0 ? fallbacks : [],
        skills: skillsMode === "custom" ? selectedSkills : null,
        subagents,
        bindings,
      };
      if (displayName !== agent.name) {
        updateBody.displayName = displayName;
      }
      if (setAsDefault !== agent.isDefault) {
        updateBody.default = setAsDefault;
      }

      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateBody),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || `Failed (HTTP ${res.status})`);
        setBusy(false);
        return;
      }

      const identityBody: Record<string, unknown> = {
        action: "set-identity",
        id: agent.id,
      };
      let hasIdentityChanges = false;
      const nextIdentityName = identityName.trim();
      const nextIdentityEmoji = identityEmoji.trim();
      const nextIdentityTheme = identityTheme.trim();
      const nextIdentityAvatar = identityAvatar.trim();
      if (nextIdentityName && nextIdentityName !== agent.name) {
        identityBody.name = nextIdentityName;
        hasIdentityChanges = true;
      }
      if (nextIdentityEmoji && nextIdentityEmoji !== agent.emoji) {
        identityBody.emoji = nextIdentityEmoji;
        hasIdentityChanges = true;
      }
      if (nextIdentityTheme && nextIdentityTheme !== (agent.identityTheme || "")) {
        identityBody.theme = nextIdentityTheme;
        hasIdentityChanges = true;
      }
      if (nextIdentityAvatar && nextIdentityAvatar !== (agent.identityAvatar || "")) {
        identityBody.avatar = nextIdentityAvatar;
        hasIdentityChanges = true;
      }

      if (hasIdentityChanges) {
        const identityRes = await fetch("/api/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(identityBody),
        });
        const identityData = await identityRes.json();
        if (!identityRes.ok || identityData.error) {
          setError(identityData.error || `Identity update failed (HTTP ${identityRes.status})`);
          setBusy(false);
          return;
        }
      }

      setSuccess(true);
      requestRestart("Agent settings updated — restart to pick up changes.");
      setTimeout(() => {
        onSaved();
        onClose();
      }, 1200);
    } catch (err) {
      setError(String(err));
    }
    setBusy(false);
  }, [
    agent.emoji,
    agent.id,
    agent.identityAvatar,
    agent.identityTheme,
    agent.isDefault,
    agent.name,
    bindings,
    displayName,
    fallbacks,
    identityAvatar,
    identityEmoji,
    identityName,
    identityTheme,
    model,
    onClose,
    onSaved,
    selectedSkills,
    setAsDefault,
    skillsMode,
    subagents,
  ]);

  const sc = STATUS_COLORS[agent.status] || STATUS_COLORS.unknown;
  const otherAgents = allAgents.filter((a) => a.id !== agent.id);
  const mutating = busy || deleting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-backdrop-in"
        onClick={() => {
          if (!mutating) onClose();
        }}
      />

      <div className="relative z-10 flex h-full max-h-[calc(100vh-3rem)] w-full max-w-xl flex-col overflow-hidden rounded-2xl glass-strong animate-modal-in">
        {/* ── Header ── */}
        <div className="flex shrink-0 items-center justify-between border-b border-foreground/10 px-4 py-4">
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent-brand-subtle)] ring-1 ring-[var(--accent-brand-border)] text-sm font-bold shadow"
            >
              {agent.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-foreground">
                  {agent.name}
                </h2>
                <span className={cn("h-2 w-2 rounded-full", sc.dot)} />
                <span className={cn("text-xs font-medium", sc.text)}>
                  {agent.status === "active"
                    ? "Active"
                    : agent.status === "idle"
                      ? "Idle"
                      : "Unknown"}
                </span>
                {agent.isDefault && (
                  <span className="rounded-full bg-[var(--accent-brand-subtle)] px-2 py-0.5 text-xs font-medium text-[var(--accent-brand-text)]">
                    Default
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {agent.id} · {formatAgo(agent.lastActive)} ·{" "}
                {agent.sessionCount} sessions · {formatTokens(agent.totalTokens)}{" "}
                tokens
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={mutating}
            className="rounded p-1 text-muted-foreground/60 hover:text-foreground/70 disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Scrollable form ── */}
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-4">
          {/* 1. Identity + default */}
          <div className="space-y-2 rounded-lg border border-foreground/10 bg-foreground/[0.02] p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-foreground/70">Agent order</p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    void moveAgent("up");
                  }}
                  disabled={mutating || idx <= 0}
                  className="rounded-md border border-foreground/10 px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-foreground/5 disabled:opacity-40"
                  title="Move agent up"
                >
                  Move up
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void moveAgent("down");
                  }}
                  disabled={mutating || idx >= allAgents.length - 1}
                  className="rounded-md border border-foreground/10 px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-foreground/5 disabled:opacity-40"
                  title="Move agent down"
                >
                  Move down
                </button>
              </div>
            </div>
            <label className="block text-xs font-semibold text-foreground/70">
              Display Name (dashboard label)
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={agent.id}
                className="mt-1.5 w-full rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2 text-sm text-foreground/90 placeholder:text-muted-foreground/60 focus:border-[var(--accent-brand-border)] focus:outline-none"
                disabled={mutating}
              />
            </label>

            <div className="grid gap-2 sm:grid-cols-2">
              <label className="block text-xs font-semibold text-foreground/70">
                Identity name
                <input
                  type="text"
                  value={identityName}
                  onChange={(e) => setIdentityName(e.target.value)}
                  placeholder={agent.name}
                  className="mt-1.5 w-full rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2 text-xs text-foreground/90 placeholder:text-muted-foreground/60 focus:border-[var(--accent-brand-border)] focus:outline-none"
                  disabled={mutating}
                />
              </label>
              <label className="block text-xs font-semibold text-foreground/70">
                Identity emoji
                <input
                  type="text"
                  value={identityEmoji}
                  onChange={(e) => setIdentityEmoji(e.target.value)}
                  placeholder={agent.emoji}
                  className="mt-1.5 w-full rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2 text-xs text-foreground/90 placeholder:text-muted-foreground/60 focus:border-[var(--accent-brand-border)] focus:outline-none"
                  disabled={mutating}
                />
              </label>
              <label className="block text-xs font-semibold text-foreground/70">
                Identity theme
                <input
                  type="text"
                  value={identityTheme}
                  onChange={(e) => setIdentityTheme(e.target.value)}
                  placeholder={agent.identityTheme || "default"}
                  className="mt-1.5 w-full rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2 text-xs text-foreground/90 placeholder:text-muted-foreground/60 focus:border-[var(--accent-brand-border)] focus:outline-none"
                  disabled={mutating}
                />
              </label>
              <label className="block text-xs font-semibold text-foreground/70">
                Identity avatar (path/url/data URI)
                <input
                  type="text"
                  value={identityAvatar}
                  onChange={(e) => setIdentityAvatar(e.target.value)}
                  placeholder={agent.identityAvatar || "avatars/agent.png"}
                  className="mt-1.5 w-full rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2 text-xs text-foreground/90 placeholder:text-muted-foreground/60 focus:border-[var(--accent-brand-border)] focus:outline-none"
                  disabled={mutating}
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-foreground/80">
                <input
                  type="checkbox"
                  checked={setAsDefault}
                  onChange={(e) => setSetAsDefault(e.target.checked)}
                  disabled={mutating}
                  className="h-3.5 w-3.5 rounded border-foreground/20 text-[var(--accent-brand)] focus:ring-[var(--accent-brand-ring)]"
                />
                Set as default agent
              </label>
              <button
                type="button"
                onClick={handleLoadIdentityFromWorkspace}
                disabled={mutating}
                className="rounded-lg border border-foreground/10 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-foreground/5 disabled:opacity-40"
              >
                Load from IDENTITY.md
              </button>
            </div>
          </div>

          {/* 1. Primary Model */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground/70">
              <Cpu className="h-3 w-3 text-[var(--accent-brand-text)]" /> Primary Model
            </label>
            {modelsLoading ? (
              <div className="flex items-center gap-2 rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2.5 text-xs text-muted-foreground/50">
                <span className="inline-flex items-center gap-0.5">
                  <span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:0ms]" />
                  <span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:150ms]" />
                  <span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:300ms]" />
                </span>
                Loading models…
              </div>
            ) : (
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={busy}
                className="w-full appearance-none rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2.5 text-sm text-foreground/90 focus:border-[var(--accent-brand-border)] focus:outline-none disabled:opacity-40"
              >
                <option value="">
                  Use default ({shortModel(defaultModel)})
                </option>
                {models.map((m) => (
                  <option key={m.key} value={m.key}>
                    {m.name || m.key.split("/").pop()} —{" "}
                    {m.key.split("/")[0]}
                    {m.local ? " (local)" : ""}
                  </option>
                ))}
              </select>
            )}
            {!modelsLoading && models.length > 0 && (
              <p className="mt-1 text-xs text-muted-foreground/50">
                {models.length} authenticated models.{" "}
                <Link
                  href="/agents?tab=models"
                  className="text-[var(--accent-brand-text)] hover:text-[var(--accent-brand)]"
                >
                  Manage providers →
                </Link>
              </p>
            )}
          </div>

          {/* 2. Fallback Models (multi-select checkboxes) */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground/70">
              <Layers className="h-3 w-3 text-[var(--accent-brand-text)]" /> Fallback Models
              <span className="text-xs font-normal text-muted-foreground/40">
                — priority order
              </span>
            </label>
            {modelsLoading ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground/50">
                <span className="inline-flex items-center gap-0.5">
                  <span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:0ms]" />
                  <span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:150ms]" />
                  <span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:300ms]" />
                </span> Loading…
              </div>
            ) : models.length === 0 ? (
              <p className="text-xs text-muted-foreground/50">
                No authenticated models available
              </p>
            ) : (
              <div className="max-h-36 space-y-0.5 overflow-y-auto rounded-lg border border-foreground/10 p-1.5">
                {models
                  .filter((m) => m.key !== model)
                  .map((m) => {
                    const checked = fallbacks.includes(m.key);
                    const order = checked
                      ? fallbacks.indexOf(m.key) + 1
                      : null;
                    return (
                      <label
                        key={m.key}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors",
                          checked
                            ? "bg-[var(--accent-brand-subtle)] text-[var(--accent-brand)]"
                            : "text-muted-foreground hover:bg-foreground/5"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleFallback(m.key)}
                          disabled={busy}
                          className="sr-only"
                        />
                        <div
                          className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded border text-xs font-bold",
                            checked
                              ? "border-[var(--accent-brand)] bg-[var(--accent-brand-subtle)] text-[var(--accent-brand)]"
                              : "border-foreground/10 bg-foreground/5"
                          )}
                        >
                          {order ?? ""}
                        </div>
                        <span className="flex-1 truncate">
                          {m.name || shortModel(m.key)}
                        </span>
                        <span className="text-xs text-muted-foreground/40">
                          {m.key.split("/")[0]}
                        </span>
                      </label>
                    );
                  })}
              </div>
            )}
            {fallbacks.length > 0 && (
              <p className="mt-1 text-xs text-muted-foreground/50">
                {fallbacks.length} fallback{fallbacks.length !== 1 && "s"}{" "}
                selected — numbered in priority order
              </p>
            )}
          </div>

          {/* 3. Delegation targets (multi-select) */}
          {otherAgents.length > 0 && (
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground/70">
                <Network className="h-3 w-3 text-[var(--accent-brand-text)]" /> Delegation Targets
                <span className="text-xs font-normal text-muted-foreground/40">
                  — select agents this one can hand work to
                </span>
              </label>
              <p className="mb-1.5 text-xs text-muted-foreground/50">
                Checked = this agent is allowed to delegate tasks to that agent.
              </p>
              <div className="space-y-0.5 rounded-lg border border-foreground/10 p-1.5">
                {otherAgents.map((a) => {
                  const checked = subagents.includes(a.id);
                  return (
                    <label
                      key={a.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-colors",
                        checked
                          ? "bg-[var(--accent-brand-subtle)] text-[var(--accent-brand)]"
                          : "text-muted-foreground hover:bg-foreground/5"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSubagent(a.id)}
                        disabled={busy}
                        className="sr-only"
                      />
                      <div
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                          checked
                            ? "border-[var(--accent-brand)] bg-[var(--accent-brand-subtle)]"
                            : "border-foreground/10 bg-foreground/5"
                        )}
                      >
                        {checked && (
                          <CheckCircle className="h-2.5 w-2.5 text-[var(--accent-brand-text)]" />
                        )}
                      </div>
                      <span className="text-sm">{a.emoji}</span>
                      <span className="flex-1 truncate font-medium">
                        {a.name}
                      </span>
                      <span className="text-xs text-muted-foreground/40">
                        {shortModel(a.model)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Per-agent skill filtering */}
          {availableSkills.length > 0 && (
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground/70">
                <Wrench className="h-3 w-3 text-amber-400" /> Skills
                <span className="text-xs font-normal text-muted-foreground/40">
                  — control which skills this agent can use
                </span>
              </label>
              <div className="mb-2 flex items-center gap-2">
                <label className="flex cursor-pointer items-center gap-1.5 text-xs text-foreground/80">
                  <input
                    type="radio"
                    name={`skills-mode-${agent.id}`}
                    checked={skillsMode === "all"}
                    onChange={() => setSkillsMode("all")}
                    disabled={busy}
                    className="h-3 w-3 text-[var(--accent-brand)]"
                  />
                  All skills (inherit global)
                </label>
                <label className="flex cursor-pointer items-center gap-1.5 text-xs text-foreground/80">
                  <input
                    type="radio"
                    name={`skills-mode-${agent.id}`}
                    checked={skillsMode === "custom"}
                    onChange={() => setSkillsMode("custom")}
                    disabled={busy}
                    className="h-3 w-3 text-[var(--accent-brand)]"
                  />
                  Custom allowlist
                </label>
              </div>
              {skillsMode === "custom" && (
                <>
                  <div className="max-h-40 space-y-0.5 overflow-y-auto rounded-lg border border-foreground/10 p-1.5">
                    {availableSkills.map((skill) => {
                      const checked = selectedSkills.includes(skill);
                      return (
                        <label
                          key={skill}
                          className={cn(
                            "flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors",
                            checked
                              ? "bg-amber-500/10 text-amber-500"
                              : "text-muted-foreground hover:bg-foreground/5"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setSelectedSkills((prev) =>
                                checked
                                  ? prev.filter((s) => s !== skill)
                                  : [...prev, skill]
                              )
                            }
                            disabled={busy}
                            className="sr-only"
                          />
                          <div
                            className={cn(
                              "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                              checked
                                ? "border-amber-500 bg-amber-500/20"
                                : "border-foreground/10 bg-foreground/5"
                            )}
                          >
                            {checked && (
                              <CheckCircle className="h-2.5 w-2.5 text-amber-500" />
                            )}
                          </div>
                          <span className="flex-1 truncate font-medium">
                            {skill}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground/50">
                    {selectedSkills.length === 0
                      ? "No skills selected — agent will have no skills loaded"
                      : `${selectedSkills.length} skill${selectedSkills.length !== 1 ? "s" : ""} selected`}
                  </p>
                </>
              )}
            </div>
          )}

          {/* 5. Channel Bindings */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground/70">
              <Globe className="h-3 w-3 text-blue-400" /> Channel Bindings
            </label>
            <ChannelBindingPicker
              bindings={bindings}
              onAdd={addBinding}
              onRemove={removeBinding}
              onChannelsChanged={onChannelsChanged}
              disabled={busy}
            />
          </div>

          {/* Workspace (read-only) */}
          <div className="rounded-lg border border-foreground/5 bg-foreground/5 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
              <FolderOpen className="h-3 w-3 text-amber-400/60" /> Workspace
            </div>
            <code className="mt-0.5 block truncate text-xs text-foreground/60">
              {agent.workspace}
            </code>
          </div>

          <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5">
            <p className="text-xs font-semibold text-red-300">Danger Zone</p>
            <p className="mt-1 text-xs text-red-200/80">
              Delete this agent and prune workspace/state (CLI parity: <code>openclaw agents delete</code>).
            </p>
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => {
                  setConfirmDelete(true);
                  setDeleteConfirmText("");
                  setError(null);
                }}
                disabled={mutating}
                className="mt-2 rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-40"
              >
                Delete Agent…
              </button>
            ) : (
              <div className="mt-2 space-y-2">
                <p className="text-xs text-red-200/80">
                  Type <code>{agent.id}</code> to confirm.
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder={agent.id}
                  aria-label={`Type ${agent.id} to confirm deletion`}
                  className="w-full rounded-lg border border-red-500/30 bg-black/20 px-3 py-2 text-xs text-red-100 placeholder:text-red-200/60 focus:border-red-400/60 focus:outline-none"
                  disabled={mutating}
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={mutating || deleteConfirmText.trim() !== agent.id}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-500 disabled:opacity-40"
                  >
                    {deleting ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-0.5">
                          <span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:0ms]" />
                          <span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:150ms]" />
                          <span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:300ms]" />
                        </span>
                        Deleting…
                      </span>
                    ) : (
                      "Confirm Delete"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDelete(false);
                      setDeleteConfirmText("");
                    }}
                    disabled={mutating}
                    className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs text-red-200/80 transition-colors hover:bg-red-500/10 disabled:opacity-40"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-400">
              <CheckCircle className="h-3.5 w-3.5 shrink-0" />
              Settings saved! Restarting gateway to apply…
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-foreground/10 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={mutating}
            className="rounded-lg border border-foreground/10 px-4 py-2 text-xs text-muted-foreground transition-colors hover:bg-foreground/5 disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={mutating || success}
            className="flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-xs font-medium transition-colors hover:bg-primary/90 disabled:opacity-40"
          >
            {busy ? (
              <>
                <span className="inline-flex items-center gap-0.5">
                  <span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:0ms]" />
                  <span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:150ms]" />
                  <span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:300ms]" />
                </span>
                Saving…
              </>
            ) : success ? (
              <>
                <CheckCircle className="h-3.5 w-3.5" />
                Saved!
              </>
            ) : (
              <>
                <CheckCircle className="h-3.5 w-3.5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

type WorkspaceFileEntry = {
  relativePath: string;
  size: number;
  mtime: number;
  ext: string;
};

type WorkspaceFileCategoryKey =
  | "foundational"
  | "skills"
  | "memory"
  | "config"
  | "source"
  | "content"
  | "other";

type WorkspaceFileCategory = {
  key: WorkspaceFileCategoryKey;
  label: string;
  hint: string;
  files: WorkspaceFileEntry[];
};

const FOUNDATIONAL_WORKSPACE_FILES = new Set([
  "AGENTS.MD",
  "SOUL.MD",
  "TOOLS.MD",
  "IDENTITY.MD",
  "USER.MD",
  "HEARTBEAT.MD",
  "BOOTSTRAP.MD",
  "BOOT.MD",
  "MEMORY.MD",
  "SYSTEM.MD",
]);

const SOURCE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".py",
  ".go",
  ".rs",
  ".java",
  ".kt",
  ".swift",
  ".rb",
  ".php",
  ".cpp",
  ".c",
  ".h",
  ".hpp",
  ".cs",
  ".sh",
]);

const CONFIG_EXTENSIONS = new Set([
  ".json",
  ".yaml",
  ".yml",
  ".toml",
  ".ini",
  ".env",
  ".conf",
  ".config",
]);

function baseName(pathValue: string): string {
  const parts = pathValue.replace(/\\/g, "/").split("/");
  return parts[parts.length - 1] || pathValue;
}

function classifyWorkspaceFile(file: WorkspaceFileEntry): WorkspaceFileCategoryKey {
  const rel = file.relativePath.replace(/\\/g, "/");
  const lower = rel.toLowerCase();
  const name = baseName(rel);
  const upperName = name.toUpperCase();

  if (FOUNDATIONAL_WORKSPACE_FILES.has(upperName)) return "foundational";
  if (
    lower.includes("/skills/") ||
    lower.endsWith("/skill.md") ||
    lower.endsWith("/skill.json") ||
    upperName === "SKILL.MD"
  ) {
    return "skills";
  }
  if (
    lower.includes("/memory/") ||
    lower.includes("/journal/") ||
    /^\d{4}-\d{2}-\d{2}/.test(name)
  ) {
    return "memory";
  }
  if (
    CONFIG_EXTENSIONS.has(file.ext) ||
    lower.includes("/config/") ||
    lower.endsWith("openclaw.json") ||
    lower.endsWith("package.json")
  ) {
    return "config";
  }
  if (SOURCE_EXTENSIONS.has(file.ext)) return "source";
  if (
    file.ext === ".md" ||
    file.ext === ".txt" ||
    file.ext === ".rst" ||
    file.ext === ".adoc" ||
    file.ext === ".html"
  ) {
    return "content";
  }
  return "other";
}

function WorkspaceFilesModal({
  workspacePath,
  onClose,
  onOpenDocument,
}: {
  workspacePath: string;
  onClose: () => void;
  onOpenDocument: (workspacePath: string, relativePath?: string | null) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [files, setFiles] = useState<WorkspaceFileEntry[]>([]);
  const [truncated, setTruncated] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/workspace/files?path=${encodeURIComponent(workspacePath)}`,
          { cache: "no-store" }
        );
        const body = (await res.json()) as {
          error?: string;
          files?: WorkspaceFileEntry[];
          truncated?: boolean;
        };
        if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
        if (!mounted) return;
        setFiles(Array.isArray(body.files) ? body.files : []);
        setTruncated(Boolean(body.truncated));
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [workspacePath]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const filteredFiles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return files;
    return files.filter((f) => f.relativePath.toLowerCase().includes(q));
  }, [files, search]);

  const categorizedFiles = useMemo(() => {
    const buckets: Record<WorkspaceFileCategoryKey, WorkspaceFileEntry[]> = {
      foundational: [],
      skills: [],
      memory: [],
      config: [],
      source: [],
      content: [],
      other: [],
    };
    for (const file of filteredFiles) {
      buckets[classifyWorkspaceFile(file)].push(file);
    }

    const order: Array<Omit<WorkspaceFileCategory, "files">> = [
      {
        key: "foundational",
        label: "Foundational",
        hint: "USER.md, SOUL.md, AGENTS.md and core identity files",
      },
      {
        key: "skills",
        label: "Skills",
        hint: "Skill specs and skill-related files",
      },
      {
        key: "memory",
        label: "Memory & Journal",
        hint: "Memory files, journals, and chronological notes",
      },
      {
        key: "config",
        label: "Config",
        hint: "Configuration and runtime metadata",
      },
      {
        key: "source",
        label: "Source Code",
        hint: "Executable/source files in this workspace",
      },
      {
        key: "content",
        label: "Documents & Notes",
        hint: "Markdown/text docs and narrative content",
      },
      {
        key: "other",
        label: "Other",
        hint: "Everything else",
      },
    ];

    return order
      .map((meta) => ({
        ...meta,
        files: [...buckets[meta.key]].sort((a, b) =>
          a.relativePath.localeCompare(b.relativePath)
        ),
      }))
      .filter((group) => group.files.length > 0);
  }, [filteredFiles]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-backdrop-in"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[calc(100vh-3rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl glass-strong animate-modal-in">
        <div className="flex shrink-0 items-center justify-between border-b border-foreground/10 px-4 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-amber-400" />
              <h2 className="text-xs font-semibold text-foreground">
                Workspace Files
              </h2>
            </div>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              <code>{workspacePath}</code>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-muted-foreground/60 hover:text-foreground/70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="shrink-0 space-y-2 border-b border-foreground/10 px-4 py-3">
          <div className="flex items-center gap-2 rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2 text-sm text-muted-foreground">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter files by path..."
              aria-label="Filter files by path"
              className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/60"
            />
          </div>
          <p className="text-xs text-muted-foreground/70">
            {loading
              ? "Scanning workspace..."
              : `${filteredFiles.length} file${filteredFiles.length !== 1 ? "s" : ""}${
                  search.trim() ? ` (filtered from ${files.length})` : ""
                }`}
            {truncated ? " · truncated snapshot" : ""}
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {loading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
              <span className="inline-flex items-center gap-0.5">
                <span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:0ms]" />
                <span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:150ms]" />
                <span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:300ms]" />
              </span>
              Loading workspace files...
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          ) : filteredFiles.length === 0 ? (
            <p className="text-xs text-muted-foreground/60">
              No files match this filter.
            </p>
          ) : (
            <div className="space-y-2">
              {categorizedFiles.map((group) => (
                <section key={group.key} className="space-y-1.5">
                  <div className="sticky top-0 z-[1] rounded-lg border border-foreground/10 bg-card/95 px-2.5 py-1.5 backdrop-blur-sm">
                    <p className="text-xs font-semibold text-foreground/80">
                      {group.label}{" "}
                      <span className="text-muted-foreground/60">
                        ({group.files.length})
                      </span>
                    </p>
                    <p className="text-[11px] text-muted-foreground/50">
                      {group.hint}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    {group.files.map((file) => (
                      <button
                        key={file.relativePath}
                        type="button"
                        onClick={() => {
                          onOpenDocument(workspacePath, file.relativePath);
                          onClose();
                        }}
                        className="w-full rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2 text-left transition-colors hover:border-[var(--accent-brand-border)] hover:bg-[var(--accent-brand-subtle)]"
                        title="Open in Documents"
                      >
                        <p className="truncate text-xs font-medium text-foreground/80">
                          {file.relativePath}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground/60">
                          {file.ext || "(no ext)"} · {formatBytes(file.size)} ·{" "}
                          {formatAgo(file.mtime)}
                        </p>
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-foreground/10 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-foreground/10 px-4 py-2 text-xs text-muted-foreground transition-colors hover:bg-foreground/5"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onOpenDocument(workspacePath, null);
              onClose();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-xs font-medium transition-colors hover:bg-primary/90"
          >
            Open Workspace in Documents
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}


function SummaryBar({ agents }: { agents: Agent[] }) {
  const total = agents.length;
  const active = agents.filter((agent) => agent.status === "active").length;
  const idle = agents.filter((agent) => agent.status === "idle").length;
  const sessions = agents.reduce((sum, agent) => sum + agent.sessionCount, 0);

  const items = [
    { label: "Agents", value: total },
    { label: "Active", value: active },
    { label: "Idle", value: idle },
    { label: "Sessions", value: sessions },
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-3"
        >
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground/60">
            {item.label}
          </p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function GridView({
  agents,
  selectedId,
  onSelect,
}: {
  agents: Agent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid gap-2 lg:grid-cols-2 2xl:grid-cols-3">
      {agents.map((agent) => {
        const selected = agent.id === selectedId;
        return (
          <button
            key={agent.id}
            type="button"
            onClick={() => onSelect(agent.id)}
            className={cn(
              "rounded-2xl border px-4 py-3 text-left transition-colors",
              selected
                ? "border-[var(--accent-brand-border)] bg-[var(--accent-brand-subtle)]"
                : "border-foreground/10 bg-foreground/5 hover:bg-foreground/10"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base">{agent.emoji}</span>
                  <p className="truncate text-sm font-semibold text-foreground">
                    {agent.name}
                  </p>
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {agent.id} · {shortModel(agent.model)}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium",
                  agent.status === "active"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : agent.status === "idle"
                      ? "bg-amber-500/15 text-amber-400"
                      : "bg-foreground/10 text-muted-foreground"
                )}
              >
                {agent.status}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="rounded-lg bg-black/10 px-2 py-1.5">
                Sessions: {agent.sessionCount}
              </div>
              <div className="rounded-lg bg-black/10 px-2 py-1.5">
                Tokens: {formatTokens(agent.totalTokens)}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function AgentDetail({
  agent,
  idx,
  allAgents,
  onUpdated,
}: {
  agent: Agent;
  idx: number;
  allAgents: Agent[];
  onUpdated: () => void;
}) {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-foreground/5 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{agent.emoji}</span>
            <h3 className="truncate text-base font-semibold text-foreground">
              {agent.name}
            </h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Ordre {idx + 1}/{allAgents.length} · {agent.id}
          </p>
        </div>

        <button
          type="button"
          onClick={onUpdated}
          className="rounded-lg border border-foreground/10 px-3 py-1.5 text-xs text-muted-foreground hover:bg-foreground/5"
        >
          Refresh
        </button>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2">
        <div className="rounded-xl bg-black/10 px-3 py-2">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground/60">
            Model
          </p>
          <p className="mt-1 text-sm text-foreground">{agent.model}</p>
        </div>

        <div className="rounded-xl bg-black/10 px-3 py-2">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground/60">
            Workspace
          </p>
          <p className="mt-1 break-all text-sm text-foreground">{agent.workspace}</p>
        </div>

        <div className="rounded-xl bg-black/10 px-3 py-2">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground/60">
            Status
          </p>
          <p className="mt-1 text-sm text-foreground">{agent.status}</p>
        </div>

        <div className="rounded-xl bg-black/10 px-3 py-2">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground/60">
            Last active
          </p>
          <p className="mt-1 text-sm text-foreground">{formatAgo(agent.lastActive)}</p>
        </div>
      </div>

      {agent.bindings.length > 0 && (
        <div className="mt-4">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground/60">
            Bindings
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {agent.bindings.map((binding) => (
              <span
                key={binding}
                className="rounded-full border border-foreground/10 bg-black/10 px-2.5 py-1 text-xs text-foreground/80"
              >
                {binding}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   Main Export
   ================================================================ */

export function AgentsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Unified view mode: flow (org chart), grid (cards), subagents
  type ViewMode = "flow" | "grid" | "subagents" | "models";
  const initialView: ViewMode = (() => {
    const t = (searchParams.get("tab") || "").toLowerCase();
    if (t === "subagents") return "subagents";
    if (t === "models") return "models";
    return "flow";
  })();
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);
  // Derived helpers for backward compat
  const tab: "agents" | "subagents" | "models" = viewMode === "subagents" ? "subagents" : viewMode === "models" ? "models" : "agents";
  const view: "flow" | "grid" = viewMode === "grid" ? "grid" : "flow";
  const [data, setData] = useState<AgentsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [selectedWorkspacePath, setSelectedWorkspacePath] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [savedAgentOrder, setSavedAgentOrder] = useState<string[]>(loadSavedAgentOrder);
  const [stylePresetId, setStylePresetId] = useState<AgentsStyleId>(loadSavedAgentsStyle);

  const handleAgentClick = useCallback((id: string) => {
    setSelectedId(id);
    setEditingAgentId(id);
  }, []);

  const handleWorkspaceClick = useCallback((workspacePath: string) => {
    setSelectedWorkspacePath(workspacePath);
  }, []);

  const stylePreset = useMemo(
    () => getAgentsStylePreset(stylePresetId),
    [stylePresetId]
  );

  const applyStylePreset = useCallback((id: AgentsStyleId) => {
    setStylePresetId(id);
    saveAgentsStyle(id);
  }, []);

  const openDocumentForWorkspace = useCallback((workspacePath: string, relativePath?: string | null) => {
    const normalizedWorkspacePath = workspacePath.replace(/\\/g, "/");
    const workspaceName =
      normalizedWorkspacePath.split("/").filter(Boolean).pop() || "workspace";
    const params = new URLSearchParams();
    params.set("workspace", workspaceName);
    if (relativePath) {
      const normalizedRelativePath = relativePath
        .replace(/\\/g, "/")
        .replace(/^\/+/, "");
      if (normalizedRelativePath) {
        params.set("path", `${workspaceName}/${normalizedRelativePath}`);
      }
    }
    router.push(`/documents?${params.toString()}`);
  }, [router]);

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch("/api/agents", { cache: "no-store", signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const orderedAgents = applySavedOrder(
        Array.isArray(json.agents) ? json.agents : [],
        savedAgentOrder
      );
      setData({
        ...json,
        agents: orderedAgents,
      });
      setError(null);
      setSelectedId((prev) => {
        if (prev && orderedAgents.some((a: Agent) => a.id === prev)) return prev;
        if (orderedAgents.length === 0) return null;
        const def = orderedAgents.find((a: Agent) => a.isDefault);
        return def?.id || orderedAgents[0].id;
      });
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [savedAgentOrder]);

  const reorderAgents = useCallback(
    async (agentId: string, direction: "up" | "down") => {
      if (!data) return;
      const ids = data.agents.map((a) => a.id);
      const index = ids.indexOf(agentId);
      if (index < 0) return;
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= ids.length) return;
      const reordered = [...ids];
      const tmp = reordered[index];
      reordered[index] = reordered[nextIndex];
      reordered[nextIndex] = tmp;
      setSavedAgentOrder(reordered);
      saveAgentOrder(reordered);
      setData((prev) =>
        prev
          ? {
              ...prev,
              agents: applySavedOrder(prev.agents, reordered),
            }
          : prev
      );
    },
    [data]
  );

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  useEffect(() => {
    const pollId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void fetchAgents();
      }
    }, 5000);
    return () => window.clearInterval(pollId);
  }, [fetchAgents]);

  useEffect(() => {
    const handleFocus = () => {
      void fetchAgents();
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") void fetchAgents();
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchAgents]);

  const selectedAgent = useMemo(
    () => data?.agents.find((a) => a.id === selectedId) || null,
    [data, selectedId]
  );

  const selectedIdx = useMemo(
    () => data?.agents.findIndex((a) => a.id === selectedId) ?? 0,
    [data, selectedId]
  );

  const editingAgent = useMemo(
    () => data?.agents.find((a) => a.id === editingAgentId) || null,
    [data, editingAgentId]
  );

  const editingIdx = useMemo(
    () => data?.agents.findIndex((a) => a.id === editingAgentId) ?? 0,
    [data, editingAgentId]
  );

  const switchView = useCallback((next: ViewMode) => {
    setViewMode(next);
    // Keep URL in sync for subagents/models tabs (bookmarkable)
    const params = new URLSearchParams(searchParams.toString());
    params.delete("section");
    if (next === "subagents") params.set("tab", "subagents");
    else if (next === "models") params.set("tab", "models");
    else params.delete("tab");
    const query = params.toString();
    router.push(query ? `/agents?${query}` : "/agents");
  }, [router, searchParams]);

  useEffect(() => {
    if (viewMode === "subagents" || viewMode === "models") {
      setShowAddModal(false);
      setEditingAgentId(null);
      setSelectedWorkspacePath(null);
    } else if (viewMode !== "flow") {
      setSelectedWorkspacePath(null);
    }
  }, [viewMode]);

  const agentCount = data?.agents.length ?? 0;
  const totalSessions = data?.agents.reduce((sum, agent) => sum + agent.sessionCount, 0) ?? 0;
  const activeCount = data?.agents.filter((agent) => agent.status === "active").length ?? 0;
  const runtimeCount = data?.agents.reduce((count, agent) => count + agent.runtimeSubagents.filter((sub) => sub.status === "running").length, 0) ?? 0;
  const workspaceCount = data ? new Set(data.agents.map((agent) => agent.workspace)).size : 0;
  const channelCount = data ? new Set(data.agents.flatMap((agent) => agent.channels)).size : 0;
  const defaultAgent = data?.agents.find((agent) => agent.isDefault) || data?.agents[0] || null;
  const viewOptions = [
    { key: "flow" as ViewMode, icon: GitFork, label: "Hierarchy" },
    { key: "grid" as ViewMode, icon: LayoutGrid, label: "Cards" },
    { key: "subagents" as ViewMode, icon: Network, label: "Subagents" },
    { key: "models" as ViewMode, icon: Cpu, label: "Models" },
  ];

  // Models tab — delegate to ModelsView which has its own layout
  if (tab === "models") {
    return <ModelsView />;
  }

  if (loading) {
    return (
      <SectionLayout>
        <LoadingState label="Loading agents..." />
      </SectionLayout>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
        <AlertCircle className="h-8 w-8 text-red-400" />
        <p className="text-sm">Failed to load agents</p>
        <p className="text-xs text-muted-foreground/60">{error}</p>
        <button
    type="button"
    onClick={fetchAgents}
    className="rounded-lg bg-foreground/5 px-3 py-1.5 text-xs text-foreground hover:bg-foreground/10"
  >
    Retry
  </button>
      </div>
    );
  }

  return (
    <SectionLayout className="bg-transparent">
      <div
        className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
        style={stylePreset.variables}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0" style={{ background: "var(--agents-page-bg)" }} />
          <div className="absolute left-[6%] top-16 h-56 w-56 rounded-full blur-3xl" style={{ background: "var(--agents-orb-a)" }} />
          <div className="absolute right-[8%] top-20 h-64 w-64 rounded-full blur-3xl" style={{ background: "var(--agents-orb-b)" }} />
          <div className="absolute bottom-[-8rem] left-[28%] h-56 w-56 rounded-full blur-3xl" style={{ background: "var(--agents-orb-c)" }} />
        </div>
      <SectionHeader
        title={
          <span className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-brand-subtle)]">
              <Users className="h-4 w-4 text-[var(--accent-brand-text)]" />
            </span>
            Agents
          </span>
        }
        description="Monitor agents, delegation paths, workspaces, channels, and runtime activity."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Unified view switcher — pill segmented control */}
            <div className="flex rounded-xl bg-muted/50 p-1">
              {([
                { key: "flow" as ViewMode, icon: GitFork, label: "Hierarchy" },
                { key: "grid" as ViewMode, icon: LayoutGrid, label: "Cards" },
                { key: "subagents" as ViewMode, icon: Network, label: "Subagents" },
                { key: "models" as ViewMode, icon: Cpu, label: "Models" },
              ] as const).map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => switchView(key)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                    viewMode === key
                      ? "bg-white text-stone-900 shadow-sm dark:bg-stone-800 dark:text-stone-100"
                      : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                  )}
                >
                  <Icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {tab === "agents" && (
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Add Agent</span>
              </button>
            )}

            <button type="button" onClick={fetchAgents} className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 dark:hover:text-stone-100">
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>
        }
      />

      {tab === "subagents" && (
        <SubagentsManagerView
          agents={data.agents}
          onAgentsReload={() => {
            void fetchAgents();
          }}
        />
      )}

      {/* Flow view: full width, full remaining height */}
      {tab === "agents" && view === "flow" && (
        <HierarchyView
          data={data}
          selectedId={selectedId}
          onSelect={handleAgentClick}
          groups={MISSION_CONTROL_GROUPS}
          mainAgentId={MISSION_CONTROL_MAIN_AGENT_ID}
        />
      )}

      {/* Grid view + detail: scrollable with max-width */}
      {tab === "agents" && view === "grid" && (
        <SectionBody width="content" padding="roomy" innerClassName="space-y-2">
          <SummaryBar agents={data.agents} />
          <GridView
            agents={data.agents}
            selectedId={selectedId}
            onSelect={handleAgentClick}
          />
          {selectedAgent && (
            <AgentDetail
              agent={selectedAgent}
              idx={selectedIdx}
              allAgents={data.agents}
              onUpdated={fetchAgents}
            />
          )}
        </SectionBody>
      )}

      {/* Add Agent Modal */}
      {tab === "agents" && showAddModal && (
        <AddAgentModal
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            void fetchAgents();
          }}
          onChannelsChanged={() => {
            void fetchAgents();
          }}
          defaultModel={data.defaultModel}
          existingAgents={data?.agents ?? []}
        />
      )}

      {/* Edit Agent Modal */}
      {tab === "agents" && editingAgent && (
        <EditAgentModal
          agent={editingAgent}
          idx={editingIdx}
          allAgents={data.agents}
          defaultModel={data.defaultModel}
          onClose={() => setEditingAgentId(null)}
          onSaved={() => {
            void fetchAgents();
          }}
          onMove={reorderAgents}
          onChannelsChanged={() => {
            void fetchAgents();
          }}
        />
      )}

      {tab === "agents" && selectedWorkspacePath && (
        <WorkspaceFilesModal
          workspacePath={selectedWorkspacePath}
          onClose={() => setSelectedWorkspacePath(null)}
          onOpenDocument={openDocumentForWorkspace}
        />
      )}
          </div>
</SectionLayout>
  );
}
