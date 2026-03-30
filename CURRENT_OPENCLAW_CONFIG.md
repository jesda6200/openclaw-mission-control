# CURRENT OPENCLAW CONFIG

- Généré le : `2026-03-30T10:08:53Z`
- Runtime config : `/home/damien/.openclaw/openclaw.json`
- Source routage : `/home/damien/.openclaw/workspace/agents-routing.json`
- Source mémoire agents : `/home/damien/.openclaw/workspace/all_agents_memory.json`

## Résumé

- Agents : **23**
- Modèle par défaut : **`openai/gpt-5.4`**
- Bindings : **5**
- Règles de routage : **11**
- Étapes du pipeline : **7**

## Fallbacks par défaut

- `ollama/qwen2.5:14b`
- `ollama/qwen2.5-coder:14b`
- `ollama/gemma3:27b`
- `ollama/qwen3:14b`
- `openai-codex/gpt-5.4`
- `openai-codex/gpt-5.4-mini`
- `openai/gpt-5.4-mini`
- `openai/gpt-5.3-codex`
- `ollama/qwen2.5-coder:14b`
- `ollama/glm-4.7-flash`
- `ollama/mistral:7b`
- `ollama/qwen3:8b`
- `ollama/codellama:13b`

## Agents et modèles

| Agent | Modèle | Workspace | Agent dir |
|---|---|---|---|
| `main` | `openai-codex/gpt-5.4` | `-` | `-` |
| `dev-engineer` | `ollama/qwen2.5-coder:14b` | `/home/damien/openclaw-agents/dev-engineer` | `/home/damien/.openclaw/agents/dev-engineer/agent` |
| `web-builder` | `ollama/qwen2.5-coder:14b` | `/home/damien/openclaw-agents/web-builder` | `/home/damien/.openclaw/agents/web-builder/agent` |
| `data-analyst` | `ollama/qwen2.5:14b` | `/home/damien/openclaw-agents/data-analyst` | `/home/damien/.openclaw/agents/data-analyst/agent` |
| `ai-engineer` | `ollama/qwen2.5:14b` | `/home/damien/openclaw-agents/ai-engineer` | `/home/damien/.openclaw/agents/ai-engineer/agent` |
| `security-engineer` | `ollama/qwen2.5:14b` | `/home/damien/openclaw-agents/security-engineer` | `/home/damien/.openclaw/agents/security-engineer/agent` |
| `devops-engineer` | `ollama/qwen2.5-coder:14b` | `/home/damien/openclaw-agents/devops-engineer` | `/home/damien/.openclaw/agents/devops-engineer/agent` |
| `research-agent` | `ollama/qwen2.5:14b` | `/home/damien/openclaw-agents/research-agent` | `/home/damien/.openclaw/agents/research-agent/agent` |
| `crypto-analyst` | `ollama/qwen2.5:14b` | `/home/damien/openclaw-agents/crypto-analyst` | `/home/damien/.openclaw/agents/crypto-analyst/agent` |
| `backend-architect` | `ollama/qwen2.5-coder:14b` | `/home/damien/openclaw-agents/backend-architect` | `/home/damien/.openclaw/agents/backend-architect/agent` |
| `qa-engineer` | `ollama/qwen2.5-coder:14b` | `/home/damien/openclaw-agents/qa-engineer` | `/home/damien/.openclaw/agents/qa-engineer/agent` |
| `automation-engineer` | `ollama/qwen2.5-coder:14b` | `/home/damien/openclaw-agents/automation-engineer` | `/home/damien/.openclaw/agents/automation-engineer/agent` |
| `product-manager` | `ollama/qwen2.5:14b` | `/home/damien/openclaw-agents/product-manager` | `/home/damien/.openclaw/agents/product-manager/agent` |
| `ui-designer` | `ollama/qwen2.5-coder:14b` | `/home/damien/openclaw-agents/ui-designer` | `/home/damien/.openclaw/agents/ui-designer/agent` |
| `memory-manager` | `ollama/qwen2.5:14b` | `/home/damien/openclaw-agents/memory-manager` | `/home/damien/.openclaw/agents/memory-manager/agent` |
| `system-architect` | `ollama/qwen2.5:14b` | `/home/damien/openclaw-agents/system-architect` | `/home/damien/.openclaw/agents/system-architect/agent` |
| `execution-manager` | `ollama/qwen2.5-coder:14b` | `/home/damien/openclaw-agents/execution-manager` | `/home/damien/.openclaw/agents/execution-manager/agent` |
| `intent-analyzer` | `ollama/qwen2.5:14b` | `/home/damien/openclaw-agents/intent-analyzer` | `/home/damien/.openclaw/agents/intent-analyzer/agent` |
| `strategy-engine` | `ollama/qwen2.5:14b` | `/home/damien/openclaw-agents/strategy-engine` | `/home/damien/.openclaw/agents/strategy-engine/agent` |
| `task-graph-builder` | `ollama/qwen2.5:14b` | `/home/damien/openclaw-agents/task-graph-builder` | `/home/damien/.openclaw/agents/task-graph-builder/agent` |
| `dispatcher` | `ollama/qwen2.5:14b` | `/home/damien/openclaw-agents/dispatcher` | `/home/damien/.openclaw/agents/dispatcher/agent` |
| `validator` | `ollama/qwen2.5:14b` | `/home/damien/openclaw-agents/validator` | `/home/damien/.openclaw/agents/validator/agent` |
| `feedback-loop` | `ollama/qwen2.5:14b` | `/home/damien/openclaw-agents/feedback-loop` | `/home/damien/.openclaw/agents/feedback-loop/agent` |

## Bindings

| Channel | Account | Agent |
|---|---|---|
| `webchat` | `default` | `main` |
| `discord` | `default` | `intent-analyzer` |
| `telegram` | `default` | `backend-architect` |
| `signal` | `default` | `dev-engineer` |
| `slack` | `default` | `web-builder` |

## Orchestration

- **main** → `main`
- **intent** → `intent-analyzer`
- **strategy** → `strategy-engine`
- **graph** → `task-graph-builder`
- **dispatch** → `dispatcher`
- **validation** → `validator`
- **feedback** → `feedback-loop`
- **memory** → `memory-manager`

## Worker pool

- `dev-engineer`
- `web-builder`
- `backend-architect`
- `system-architect`
- `data-analyst`
- `devops-engineer`
- `automation-engineer`
- `security-engineer`
- `qa-engineer`
- `research-agent`
- `product-manager`
- `crypto-analyst`

## Pipeline

1. `intent-analyzer`
2. `strategy-engine`
3. `task-graph-builder`
4. `dispatcher`
5. `validator`
6. `feedback-loop`
7. `memory-manager`

## Règles de routage

| Match | Agent |
|---|---|
| `backend|api|code|script|bug|fix` | `dev-engineer` |
| `site|landing|frontend|css|html` | `web-builder` |
| `architecture|scalable|system design|refonte|backend design` | `backend-architect` |
| `data|analyse|stats|csv|excel|dataset` | `data-analyst` |
| `docker|ci|cd|deploy|infra|server` | `devops-engineer` |
| `automation|cron|bot|workflow|orchestration` | `automation-engineer` |
| `test|qa|validation|bug test|audit` | `qa-engineer` |
| `research|cherche|info|doc|benchmark` | `research-agent` |
| `product|roadmap|feature|spec` | `product-manager` |
| `crypto|token|blockchain|wallet|defi` | `crypto-analyst` |
| `security|auth|jwt|vuln|pentest` | `security-engineer` |

## Règles système

- main orchestre et livre, sans faire le travail spécialisé quand un agent existe.
- intent-analyzer comprend la demande.
- strategy-engine choisit la stratégie.
- task-graph-builder construit les sous-tâches avec agentIds explicites.
- dispatcher distribue au worker-pool.
- validator fait la QA globale.
- feedback-loop gère les itérations correctives.
- memory-manager garde la continuité utile.
- n activer que les pôles utiles selon la demande.
- control est conditionnel et réservé aux tâches critiques.
- transversal est toujours facultatif.

## Channels

### telegram

- **enabled** : `True`
- **dmPolicy** : `pairing`
- **botToken** : `8672…vYwo`
- **groups** : `{'*': {'requireMention': True}}`
- **groupPolicy** : `allowlist`
- **streaming** : `partial`

### discord

- **enabled** : `True`
- **token** : `MTQ4…pBu8`
- **groupPolicy** : `allowlist`
- **streaming** : `off`
- **dmPolicy** : `pairing`
- **guilds** : `{'1487113309009031249': {'requireMention': True, 'users': ['374545703369965568'], 'channels': {'1487113431130706042': {'allow': True}}}, '*': {}}`

## Gateway

- **port** : `18789`
- **mode** : `local`
- **bind** : `loopback`
- **auth** : `{'mode': 'token', 'token': 'db41…205f'}`
- **tailscale** : `{'mode': 'off', 'resetOnExit': False}`
- **http** : `{'endpoints': {'responses': {'enabled': True}}}`

## Skills activées / état

- `1password` : `{'enabled': True}`
- `apple-notes` : `{'enabled': False}`
- `coding-agent` : `{'enabled': True}`
- `mcporter` : `{'enabled': True}`
- `blogwatcher` : `{'enabled': True}`
- `blucli` : `{'enabled': False}`
- `clawhub` : `{'enabled': True}`

## Plugins

- `duckduckgo` : `{'enabled': True}`

