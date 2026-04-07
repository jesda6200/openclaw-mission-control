"use client";

import { useEffect, useMemo, useState } from "react";
import { InlineSpinner } from "@/components/ui/loading-state";

type AvailableModel = {
  key: string;
  name?: string;
  available?: boolean;
  local?: boolean;
  contextWindow?: number;
};

export type AgentModelSelectorProps = {
  value: string;
  onChange: (value: string) => void;
  defaultModel: string;
  disabled?: boolean;
};

export function AgentModelSelector({
  value,
  onChange,
  defaultModel,
  disabled = false,
}: AgentModelSelectorProps) {
  const [models, setModels] = useState<AvailableModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/models?scope=configured", {
          cache: "no-store",
        });
        const data = await res.json();
        const list = Array.isArray(data.models) ? (data.models as AvailableModel[]) : [];

        const filtered = list
          .filter((m) => m && typeof m.key === "string" && m.key.trim().length > 0)
          .sort((a, b) => (a.name || a.key).localeCompare(b.name || b.key));

        if (mounted) setModels(filtered);
      } catch {
        if (mounted) setModels([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const options = useMemo(() => {
    const byKey = new Map<string, AvailableModel>();

    for (const model of models) {
      byKey.set(model.key, model);
    }

    if (defaultModel && !byKey.has(defaultModel)) {
      byKey.set(defaultModel, {
        key: defaultModel,
        name: defaultModel.split("/").pop() || defaultModel,
        available: false,
        local: false,
      });
    }

    if (value && !byKey.has(value)) {
      byKey.set(value, {
        key: value,
        name: value.split("/").pop() || value,
        available: false,
        local: false,
      });
    }

    return [...byKey.values()].sort((a, b) =>
      (a.name || a.key).localeCompare(b.name || b.key)
    );
  }, [models, defaultModel, value]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2.5 text-xs text-muted-foreground/60">
        <InlineSpinner size="sm" />
        Loading available models...
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full appearance-none rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2.5 text-sm text-foreground/90 focus:border-[var(--accent-brand-border)] focus:outline-none disabled:opacity-40"
      >
        <option value="">
          Use default ({defaultModel.split("/").pop() || defaultModel})
        </option>
        {options.map((model) => (
          <option key={model.key} value={model.key}>
            {model.name || model.key.split("/").pop() || model.key}
            {" — "}
            {model.key.split("/")[0]}
            {model.local ? " (local)" : ""}
          </option>
        ))}
      </select>

      {options.length > 0 && (
        <p className="text-xs text-muted-foreground/50">
          {options.length} model{options.length !== 1 ? "s" : ""} available
        </p>
      )}
    </div>
  );
}

export default AgentModelSelector;
