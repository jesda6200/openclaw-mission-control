# Agents — Modèles principaux et fallbacks (configuration actuelle)

| Agent | Modèle principal | Fallback | Source |
| --- | --- | --- | --- |
| main (default) | openai/gpt-5-nano | None documenté | AGENTS.md |
| dev-engineer | ollama/qwen2.5-coder:14b | None documenté | AGENTS.md |
| web-builder | ollama/qwen2.5-coder:14b | None documenté | AGENTS.md |
| data-analyst | ollama/qwen2.5-coder:14b | None documenté | AGENTS.md |
| ai-engineer | ollama/qwen2.5-coder:14b | None documenté | AGENTS.md |
| security-engineer | ollama/qwen3.5:27b | None documenté | AGENTS.md |
| devops-engineer | ollama/qwen2.5-coder:14b | None documenté | AGENTS.md |
| research-agent | ollama/qwen3.5:27b | None documenté | AGENTS.md |
| crypto-analyst | ollama/qwen3.5:27b | None documenté | AGENTS.md |
| backend-architect | ollama/qwen2.5-coder:14b | None documenté | AGENTS.md |
| qa-engineer | ollama/qwen2.5-coder:14b | None documenté | AGENTS.md |
| automation-engineer | ollama/qwen2.5-coder:14b | None documenté | AGENTS.md |
| product-manager | ollama/qwen3.5:27b | None documenté | AGENTS.md |
| ui-designer | ollama/qwen3:14b | None documenté | AGENTS.md |
| memory-manager | ollama/qwen2.5:7b | None documenté | AGENTS.md |
| system-architect | ollama/qwen3.5:27b | None documenté | AGENTS.md |
| execution-manager | ollama/qwen3:8b | None documenté | AGENTS.md |
| intent-analyzer | ollama/qwen2.5:7b | None documenté | AGENTS.md |
| strategy-engine | ollama/qwen3.5:27b | None documenté | AGENTS.md |
| task-graph-builder | ollama/qwen3:14b | None documenté | AGENTS.md |
| dispatcher | ollama/qwen2.5:7b | None documenté | AGENTS.md |
| validator | ollama/qwen2.5:7b | None documenté | AGENTS.md |
| feedback-loop | ollama/qwen2.5:7b | None documenté | AGENTS.md |

Notes: l’affichage actuel ne liste pas de fallback par agent; les mécanismes globaux de fallback existent dans MEMORY.md et peuvent être déclenchés en cas d’erreurs (par ex. bascule vers des versions plus grandes comme qwen3.5:27b si nécessaire).