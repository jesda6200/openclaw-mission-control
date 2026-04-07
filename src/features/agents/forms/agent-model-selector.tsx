"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  ChevronDown,
  Eye,
  EyeOff,
  ExternalLink,
  Key,
  Plus,
  Search,
  ShieldCheck,
  Star,
} from "lucide-react";
import { InlineSpinner } from "@/components/ui/loading-state";
import { cn } from "@/lib/utils";

export type AvailableModel = {
  key: string;
  name: string;
  available: boolean;
  local: boolean;
  contextWindow: number;
};

export type AuthProviderInfo = {
  provider: string;
  authenticated: boolean;
  authKind: string | null;
};

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

export type AgentModelSelectorProps = {
  model: string;
  onModelChange: (value: string) => void;
  defaultModel: string;
  fallbacks: string[];
  onFallbackAdd: (value: string) => void;
  onFallbackRemove: (value: string) => void;
  disabled?: boolean;
};

export function AgentModelSelector({
  model,
  onModelChange,
  defaultModel,
  fallbacks,
  onFallbackAdd,
  onFallbackRemove,
  disabled = false,
}: AgentModelSelectorProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground/70">Primary model</label>
        <ModelPicker value={model} onChange={onModelChange} defaultModel={defaultModel} disabled={disabled} />
      </div>
      <FallbackModelsField
        primary={model}
        fallbacks={fallbacks}
        onAdd={onFallbackAdd}
        onRemove={onFallbackRemove}
        disabled={disabled}
      />
    </div>
  );
}

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
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    queueMicrotask(() => fetchModels());
  }, [fetchModels]);

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

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  const authedProviders = useMemo(
    () => new Set(authProviders.filter((p) => p.authenticated).map((p) => p.provider)),
    [authProviders]
  );

  const { availableModels, groupedAvailable, unauthProviders } = useMemo(() => {
    const avail = models.filter((m) => m.available || m.local);
    const unavail = models.filter((m) => !m.available && !m.local);
    const grouped: Record<string, AvailableModel[]> = {};
    for (const m of avail) {
      const provider = m.key.split("/")[0] || "other";
      if (!grouped[provider]) grouped[provider] = [];
      grouped[provider].push(m);
    }
    for (const key of Object.keys(grouped)) {
      grouped[key].sort((a, b) => (a.name || a.key).localeCompare(b.name || b.key));
    }
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

  const providerOrder = useMemo(() => {
    const priority = ["anthropic", "openai", "google", "minimax", "ollama"];
    const keys = Object.keys(filteredGroups);
    const sorted = [
      ...priority.filter((p) => keys.includes(p)),
      ...keys.filter((p) => !priority.includes(p)).sort(),
    ];
    return sorted;
  }, [filteredGroups]);

  const selectedModel = models.find((m) => m.key === value);
  const displayLabel = value
    ? selectedModel
      ? `${selectedModel.name || selectedModel.key.split("/").pop()}`
      : value
    : `Use default (${defaultModel.split("/").pop() || defaultModel})`;
  const selectedProvider = value ? value.split("/")[0] : null;
  const selectedMeta = selectedProvider ? PROVIDER_META[selectedProvider] : null;

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
        setLoading(true);
        await fetchModels();
        setTimeout(() => setSaveSuccess(null), 3000);
      }
    } catch {
      /* ignore */
    }
    setSavingKey(false);
  }, [addingProvider, apiKey, fetchModels]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2.5 text-xs text-muted-foreground/50">
        <InlineSpinner size="sm" />
        Loading available models...
      </div>
    )
