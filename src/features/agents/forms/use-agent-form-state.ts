import { useMemo, useState } from 'react';

export type UseAgentFormStateOptions = {
  initialId?: string;
  initialDisplayName?: string;
  initialWorkspace?: string;
  initialAgentDir?: string;
  initialDefault?: boolean;
};

export type UseAgentFormStateComputed = {
  model?: string;
  bindings?: string[];
};

export type AgentCliCommandOptions = {
  name: string;
  model?: string;
  workspace?: string;
  agentDir?: string;
  bindings?: string[];
  setAsDefault?: boolean;
};

export function buildAgentCliCommand(opts: AgentCliCommandOptions): string {
  const parts = ['openclaw agents add'];
  if (opts.name) parts.push(opts.name);
  if (opts.model) parts.push('--model', opts.model);
  if (opts.workspace) parts.push('--workspace', opts.workspace);
  if (opts.agentDir) parts.push('--agent-dir', opts.agentDir);
  for (const binding of opts.bindings ?? []) {
    if (binding) parts.push('--bind', binding);
  }
  if (opts.setAsDefault) {
    parts.push('--default');
  }
  return parts.join(' ');
}

export function useAgentFormState(
  options: UseAgentFormStateOptions,
  computed?: UseAgentFormStateComputed
) {
  const [agentId, setAgentId] = useState(options.initialId ?? '');
  const [displayName, setDisplayName] = useState(options.initialDisplayName ?? '');
  const [workspace, setWorkspace] = useState(options.initialWorkspace ?? '');
  const [agentDir, setAgentDir] = useState(options.initialAgentDir ?? '');
  const [setAsDefault, setSetAsDefault] = useState(options.initialDefault ?? false);

  const computedModel = computed?.model ?? '';
  const computedBindings = computed?.bindings ?? [];

  const cliCommand = useMemo(
    () =>
      buildAgentCliCommand({
        name: agentId.trim(),
        model: computedModel,
        workspace: workspace.trim(),
        agentDir: agentDir.trim(),
        bindings: computedBindings,
        setAsDefault,
      }),
    [agentId, agentDir, computedBindings, computedModel, setAsDefault, workspace]
  );

  return {
    agentId,
    setAgentId,
    displayName,
    setDisplayName,
    workspace,
    setWorkspace,
    agentDir,
    setAgentDir,
    setAsDefault,
    setSetAsDefault,
    cliCommand,
  };
}
