"use client";

import type { Ref } from "react";

function sanitizeId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9_-]/g, "");
}

export type CreateIdentityProps = {
  inputRef?: Ref<HTMLInputElement>;
  agentId: string;
  onAgentIdChange: (value: string) => void;
  displayName: string;
  onDisplayNameChange: (value: string) => void;
  disabled?: boolean;
  setAsDefault?: boolean;
  onDefaultChange?: (value: boolean) => void;
  identityName?: string;
  onIdentityNameChange?: (value: string) => void;
  identityEmoji?: string;
  onIdentityEmojiChange?: (value: string) => void;
  identityTheme?: string;
  onIdentityThemeChange?: (value: string) => void;
  identityAvatar?: string;
  onIdentityAvatarChange?: (value: string) => void;
  onLoadIdentity?: () => void;
};

export type EditIdentityProps = CreateIdentityProps;
export type AgentIdentityFormProps = CreateIdentityProps | EditIdentityProps;

export function AgentIdentityForm({
  inputRef,
  agentId,
  onAgentIdChange,
  displayName,
  onDisplayNameChange,
  disabled = false,
  setAsDefault = false,
  onDefaultChange,
  identityName = "",
  onIdentityNameChange,
  identityEmoji = "",
  onIdentityEmojiChange,
  identityTheme = "",
  onIdentityThemeChange,
  identityAvatar = "",
  onIdentityAvatarChange,
  onLoadIdentity,
}: AgentIdentityFormProps) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        1. Identity
      </p>

      <div className="grid gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-foreground/70">
            Agent ID <span className="text-red-400">*</span>
          </label>
          <input
            ref={inputRef}
            type="text"
            value={agentId}
            onChange={(e) => onAgentIdChange(sanitizeId(e.target.value))}
            placeholder="e.g. work, research, creative"
            className="w-full rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2.5 text-sm text-foreground/90 placeholder:text-muted-foreground/60 focus:border-[var(--accent-brand-border)] focus:outline-none"
            disabled={disabled}
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
            onChange={(e) => onDisplayNameChange(e.target.value)}
            placeholder={agentId ? `e.g. ${agentId.charAt(0).toUpperCase()}${agentId.slice(1)}` : "Friendly name in UI"}
            className="w-full rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2.5 text-sm text-foreground/90 placeholder:text-muted-foreground/60 focus:border-[var(--accent-brand-border)] focus:outline-none"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <IdentityInput
          label="Identity name"
          value={identityName}
          placeholder={agentId}
          onChange={onIdentityNameChange}
          disabled={disabled}
        />
        <IdentityInput
          label="Identity emoji"
          value={identityEmoji}
          placeholder="🤖"
          onChange={onIdentityEmojiChange}
          disabled={disabled}
        />
        <IdentityInput
          label="Identity theme"
          value={identityTheme}
          placeholder="default"
          onChange={onIdentityThemeChange}
          disabled={disabled}
        />
        <IdentityInput
          label="Identity avatar (path/url/data URI)"
          value={identityAvatar}
          placeholder="avatars/agent.png"
          onChange={onIdentityAvatarChange}
          disabled={disabled}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex cursor-pointer items-center gap-2 text-xs text-foreground/80">
          <input
            type="checkbox"
            checked={setAsDefault}
            onChange={(e) => onDefaultChange?.(e.target.checked)}
            disabled={disabled}
            className="h-3.5 w-3.5 rounded border-foreground/20 text-[var(--accent-brand)] focus:ring-[var(--accent-brand-ring)]"
          />
          Set as default agent
        </label>

        {onLoadIdentity && (
          <button
            type="button"
            onClick={onLoadIdentity}
            disabled={disabled}
            className="rounded-lg border border-foreground/10 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-foreground/5 disabled:opacity-40"
          >
            Load from IDENTITY.md
          </button>
        )}
      </div>
    </div>
  );
}

type IdentityInputProps = {
  label: string;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
};

function IdentityInput({
  label,
  value = "",
  placeholder,
  disabled = false,
  onChange,
}: IdentityInputProps) {
  return (
    <label className="block text-xs font-semibold text-foreground/70">
      {label}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="mt-1.5 w-full rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2 text-xs text-foreground/90 placeholder:text-muted-foreground/60 focus:border-[var(--accent-brand-border)] focus:outline-none"
      />
    </label>
  );
}
