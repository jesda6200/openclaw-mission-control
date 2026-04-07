type AgentWorkspaceFormProps = {
  workspace: string;
  onWorkspaceChange: (value: string) => void;
  agentDir: string;
  onAgentDirChange: (value: string) => void;
  defaultWorkspaceHint: string;
  defaultAgentDirHint: string;
  disabled?: boolean;
  setAsDefault: boolean;
  onDefaultChange: (value: boolean) => void;
};

export function AgentWorkspaceForm({
  workspace,
  onWorkspaceChange,
  agentDir,
  onAgentDirChange,
  defaultWorkspaceHint,
  defaultAgentDirHint,
  disabled,
  setAsDefault,
  onDefaultChange,
}: AgentWorkspaceFormProps) {
  return (
    <div className="space-y-4 rounded-lg border border-foreground/10 bg-foreground/[0.02] p-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground/70">
          Custom workspace path
        </label>
        <input
          type="text"
          value={workspace}
          onChange={(e) => onWorkspaceChange(e.target.value)}
          placeholder={defaultWorkspaceHint}
          className="w-full rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2 text-xs font-mono text-foreground/80 placeholder:text-muted-foreground/60 focus:border-[var(--accent-brand-border)] focus:outline-none"
          disabled={disabled}
        />
        <p className="mt-1 text-xs text-muted-foreground/40">
          Defaults to <code>{defaultWorkspaceHint}</code>
        </p>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground/70">
          Custom agent state directory
        </label>
        <input
          type="text"
          value={agentDir}
          onChange={(e) => onAgentDirChange(e.target.value)}
          placeholder={defaultAgentDirHint}
          className="w-full rounded-lg border border-foreground/10 bg-foreground/5 px-3 py-2 text-xs font-mono text-foreground/80 placeholder:text-muted-foreground/60 focus:border-[var(--accent-brand-border)] focus:outline-none"
          disabled={disabled}
        />
        <p className="mt-1 text-xs text-muted-foreground/40">
          Matches <code>openclaw agents add --agent-dir</code>
        </p>
      </div>

      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={setAsDefault}
          onChange={(e) => onDefaultChange(e.target.checked)}
          disabled={disabled}
          className="h-3.5 w-3.5 rounded border-foreground/20 text-[var(--accent-brand)] focus:ring-[var(--accent-brand-ring)]"
        />
        <span className="text-xs text-foreground/80">Set as default agent</span>
      </label>
    </div>
  );
}

