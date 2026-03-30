# Notes de reconstruction

## Décisions validées

### Modèles agents OpenClaw

Utiliser :
- généralistes / orchestration / analyse -> `ollama/qwen2.5:14b`
- code / infra / exécution -> `ollama/qwen2.5-coder:14b`

Éviter pour les agents outillés :
- `ollama/deepseek-r1:32b`
- `ollama/deepseek-r1:14b`

Cause : ces modèles ont déclenché l'erreur Ollama `does not support tools` dans OpenClaw.

## Fallbacks globaux recommandés

1. `ollama/qwen2.5:14b`
2. `ollama/qwen2.5-coder:14b`
3. `ollama/gemma3:27b`
4. `ollama/qwen3:14b`
5. `openai-codex/gpt-5.4`
6. `openai-codex/gpt-5.4-mini`
7. `openai/gpt-5.4-mini`
8. `openai/gpt-5.3-codex`
9. `ollama/deepseek-coder:33b`
10. `ollama/glm-4.7-flash`
11. `ollama/mistral:7b`
12. `ollama/qwen3:8b`
13. `ollama/codellama:13b`

## Mission Control

Repo retenu dans le script propre :
- `https://github.com/jesda6200/openclaw-mission-control`

Cible locale :
- `~/.openclaw/openclaw-mission-control`

Port retenu :
- `3333`

## Vérifications post-install

- `openclaw status`
- `openclaw agents`
- `ollama list`
- `curl http://127.0.0.1:3333`
- `curl http://127.0.0.1:18789/health`

## Point Discord

La config Discord doit rester alignée avec la structure guild -> users -> channels allowlist.
Il faudra remettre le token bot valide avant test.
