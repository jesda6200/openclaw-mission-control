import { RefObject } from "react";
import { cn } from "@/lib/utils";

const sanitizeId = (value: string) => value.toLowerCase().replace(/[^a-z0-9_-]/g, "");

type CreateIdentityProps = {
  mode: "create";
  agentId: string;
  onAgentIdChange: (value: string) => void;
  displayName: string;
  onDisplayNameChange: (value: string) => void;
  disabled?: boolean;
  inputRef?: RefObject<HTMLInputElement>;
};

type EditIdentityProps = {
  mode: "edit";
  agentId: string;
  displayName: string;
  onDisplayNameChange: (value: string) => void;
  identityName: string;
  onIdentityNameChange: (value: string) => void;
  identityEmoji: string;
  onIdentityEmojiChange: (value: string) => void;
  identityTheme: string;
  onIdentityThemeChange: (value: string) => void;
  identityAvatar: string;
  onIdentityAvatarChange: (value: string) => void;
  setAsDefault: boolean;
  onDefaultChange: (value: boolean) => void;
  disabled?: boolean;
  onLoadIdentity?: () => void;
};

export type AgentIdentityFormProps = CreateIdentityProps | EditIdentityProps;

export function AgentIdentityForm(props: AgentIdentityFormProps) {
  if (props.mode === "create") {
    return (
      <div className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          1. Identity
        </p>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-foreground/70">
            Agent ID <span className="text-red-400">*</span>
          </label>
          <input
            ref={props.inputRef}
            type="text"
            value={props.agentId}
            onChange={(e) => props.onAgentIdChange(sanitizeId(e.target.value))}
            placeholder="e.g. work, research, creative"
            className="w-full rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2.5 text-sm text-foreground/90 placeholder:text-muted-foreground/60 focus:border-[var(--accent-brand-border)] focus:outline-none"
            disabled={props.disabled}
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
            value={props.displayName}
            onChange={(e) => props.onDisplayNameChange(e.target.value)}
            placeholder={
              props.agentId ? `e.g. ${props.agentId.charAt(0).toUpperCase()}${props.agentId.slice(1)}` : "Friendly name in UI"
            }
            className="w-full rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2.5 text-sm text-foreground/90 placeholder:text-muted-foreground/60 focus:border-[var(--accent-brand-border)] focus:outline-none"
            disabled={props.disabled}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-foreground/10 bg-foreground/[0.02] p-3">
      <label className="block text-xs font-semibold text-foreground/70">
        Display Name (dashboard label)
        <input
          type="text"
          value={props.displayName}
          onChange={(e) => props.onDisplayNameChange(e.target.value)}
          placeholder={props.agentId}
          className="mt-1.5 w-full rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2 text-sm text-foreground/90 placeholder:text-muted-foreground/60 focus:border-[var(--accent-brand-border)] focus:outline-none"
          disabled={props.disabled}
        />
      </label>

      <div className="grid gap-2 sm:grid-cols-2">
        <IdentityInput
          label="Identity name"
          value={props.identityName}
          placeholder={props.agentId}
          onChange={props.onIdentityNameChange}
          disabled={props.disabled}
        />
        <IdentityInput
          label="Identity emoji"
          value={props.identityEmoji}
          placeholder="🤖"
          onChange={props.onIdentityEmojiChange}
          disabled={props.disabled}
        />
        <IdentityInput
          label="Identity theme"
          value={props.identityTheme}
          placeholder="default"
          onChange={props.onIdentityThemeChange}
          disabled={props.disabled}
        />
        <IdentityInput
          label="Identity avatar (path/url/data URI)"
          value={props.identityAvatar}
          placeholder="avatars/agent.png"
          onChange={props.onIdentityAvatarChange}
          disabled={props.disabled}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex cursor-pointer items-center gap-2 text-xs text-foreground/80">
          <input
            type="checkbox"
            checked={props.setAsDefault}
            onChange={(e) => props.onDefaultChange(e.target.checked)}
            disabled={props.disabled}
            className="h-3.5 w-3.5 rounded border-foreground/20 text-[var(--accent-brand)] focus:ring-[var(--accent-brand-ring)]"
          />
          Set as default agent
        </label>
        {props.onLoadIdentity && (
          <button
            type="button"
            onClick={props.onLoadIdentity}
            disabled={props.disabled}
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
  value: string;
  placeholder?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

function IdentityInput({ label, value, placeholder, disabled, onChange }: IdentityInputProps) {
  return (
    <label className="block text-xs font-semibold text-foreground/70">
      {label}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "mt-1.5 w-full rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2 text-xs text-foreground/90 placeholder:text-muted-foreground/60 focus:border-[var(--accent-brand-border)] focus:outline-none",
          disabled && "opacity-60"
        )}
        disabled={disabled}
      />
    </label>
  );
}

