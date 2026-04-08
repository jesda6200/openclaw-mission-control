import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle, ExternalLink, Plus, ShieldCheck, X } from "lucide-react";
import { InlineSpinner } from "@/components/ui/loading-state";
import { cn } from "@/lib/utils";

export type ChannelBindingPickerProps = {
  bindings: string[];
  onAdd: (binding: string) => void;
  onRemove: (binding: string) => void;
  onChannelsChanged?: () => void;
  disabled?: boolean;
};

type ChannelInfo = {
  channel: string;
  label: string;
  icon: string;
  configured: boolean;
  enabled: boolean;
  accounts: string[];
  setupType: "auto" | "token" | "qr" | "cli";
  setupCommand?: string;
  setupHint?: string;
  docsUrl: string;
  tokenPlaceholder?: string;
  tokenLabel?: string;
  configHint?: string;
  statuses: Array<{
    connected?: boolean;
    linked?: boolean;
    error?: boolean;
  }>;
};

export function ChannelBindingPicker({
  bindings,
  onAdd,
  onRemove,
  onChannelsChanged,
  disabled = false,
}: ChannelBindingPickerProps) {
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
      setChannels(
        (data.channels || []).map((c: Record<string, unknown>) => ({
          ...c,
          statuses: Array.isArray(c.statuses) ? c.statuses : [],
        })) as ChannelInfo[]
      );
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    queueMicrotask(() => fetchChannels());
  }, [fetchChannels]);

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
        await fetchChannels();
        onChannelsChanged?.();
        setTimeout(() => setSetupSuccess(null), 4000);
      }
    } catch {
      /* ignore */
    }
    setSaving(false);
  }, [appTokenInput, fetchChannels, onChannelsChanged, selectedChannel, tokenInput]);

  const handleBindChannel = useCallback(
    (ch: ChannelInfo) => {
      const binding = accountId.trim() ? `${ch.channel}:${accountId.trim()}` : ch.channel;
      onAdd(binding);
      setSelectedChannel(null);
      setAccountId("");
      setSetupMode(false);
    },
    [accountId, onAdd]
  );

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
      {bindings.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {bindings.map((b) => {
            const chKey = b.split(":")[0];
            const chInfo = channels.find((c) => c.channel === chKey);
            const status = chInfo ? getStatus(chInfo) : null;
            return (
              <span
                key={b}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--accent-brand-border)] bg-[var(--accent-brand-subtle)] px-2.5 py-1 text-xs text-[var(--accent-brand-text)]"
              >
                <span>{chInfo?.icon || "📡"}</span>
                <span className="font-medium">{b}</span>
                {status && (
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      status.color === "emerald"
                        ? "bg-emerald-400"
                        : status.color === "amber"
                          ? "bg-amber-400"
                          : "bg-zinc-500"
                    )}
                  />
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

      {setupSuccess && (
        <div className="mb-2 flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5 text-xs text-emerald-400 animate-in fade-in slide-in-from-top-1">
          <CheckCircle className="h-3 w-3 shrink-0" />
          {channels.find((c) => c.channel === setupSuccess)?.label || setupSuccess} connected! You can now bind it.
        </div>
      )}

      {!selectedChannel ? (
        <div>
          {readyChannels.length > 0 && (
            <>
              <p className="mb-1.5 text-xs text-muted-foreground/60">Connected channels — click to bind:</p>
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
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="font-medium">{ch.label}</span>
                        <span className={cn("text-xs", status.color === "emerald" ? "text-emerald-400" : "text-amber-400")}>
                          {alreadyBound ? "Bound" : status.text}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {setupChannels.length > 0 && (
            <div className={cn(readyChannels.length > 0 && "mt-3")}>
              <p className="mb-1.5 text-xs text-muted-foreground/40">More channels — needs one-time setup:</p>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {setupChannels.map((ch, idx) => (
                  <button
                    key={`${ch.channel}-${idx}`}
                    type="button"
                    onClick={() => {
                      setSelectedChannel(ch);
                      setSetupMode(true);
                    }}
                    disabled={disabled}
                    className="flex items-center gap-2 rounded-lg border border-dashed border-foreground/10 bg-transparent px-3 py-2 text-left text-xs text-muted-foreground/50 transition-colors hover:border-foreground/15 hover:text-foreground/60 disabled:opacity-40"
                  >
                    <span className="text-sm opacity-60">{ch.icon}</span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="font-medium">{ch.label}</span>
                      <span className="text-xs text-muted-foreground/30">Set up</span>
                    </div>
                    <Plus className="h-2.5 w-2.5 text-muted-foreground/30" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {channels.length === 0 && (
            <p className="py-3 text-center text-xs text-muted-foreground/40">Could not fetch channels. Is the Gateway running?</p>
          )}
        </div>
      ) : (
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
              onClick={() => {
                setSelectedChannel(null);
                setSetupMode(false);
                setTokenInput("");
                setAppTokenInput("");
                setAccountId("");
              }}
              className="rounded p-0.5 text-muted-foreground/40 hover:text-foreground/70"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          {getStatus(selectedChannel).ready && !setupMode ? (
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleBindChannel(selectedChannel);
                    }
                  }}
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
                {selectedChannel.accounts.length > 1 && <> Accounts: {selectedChannel.accounts.join(", ")}</>}
              </p>
            </div>
          ) : (
            <div>
              <p className="mb-2 text-xs text-foreground/60">{selectedChannel.setupHint}</p>

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
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && tokenInput.trim()) {
                          e.preventDefault();
                          handleSetupToken();
                        }
                      }}
                      placeholder={selectedChannel.tokenPlaceholder || "Paste token here..."}
                      aria-label={selectedChannel.tokenLabel || "Token"}
                      className="w-full rounded-lg border border-foreground/10 bg-card px-3 py-2 text-xs font-mono text-foreground/90 placeholder:text-muted-foreground/50 focus:border-[var(--accent-brand-border)] focus:outline-none"
                      autoFocus
                      disabled={saving}
                    />
                  </div>
                  {selectedChannel.channel === "slack" && (
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground/60">App Token (Socket Mode)</label>
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
                        <span className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-0.5">
                            <span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:0ms]" />
                            <span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:150ms]" />
                            <span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:300ms]" />
                          </span>
                          Connecting...
                        </span>
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
                  <p className="text-xs text-muted-foreground/40">Token is stored securely in OpenClaw credentials. Never leaves your machine.</p>
                </div>
              )}

              {selectedChannel.setupType === "qr" && (
                <div className="space-y-2">
                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                    <p className="text-xs font-medium text-amber-400 mb-1">Interactive setup required</p>
                    <p className="text-xs text-muted-foreground/60">This channel requires scanning a QR code. Open the Terminal and run:</p>
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

              {selectedChannel.setupType === "cli" && (
                <div className="space-y-2">
                  <div className="rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2">
                    {selectedChannel.setupCommand ? (
                      <>
                        <p className="text-xs text-muted-foreground/60 mb-1">Run this command in the Terminal:</p>
                        <code className="block rounded bg-black/30 px-2 py-1.5 text-xs font-mono text-emerald-400">{selectedChannel.setupCommand}</code>
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
                <p className="mt-1 text-xs text-muted-foreground/40 italic">{selectedChannel.configHint}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
