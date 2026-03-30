# Rebuild WSL OpenClaw + Mission Control

Objectif : reconstruire proprement un PC WSL depuis zéro avec les réglages utiles validés jusqu'ici, sans dépendre du bazar du workspace courant.

## Ce bundle contient

- `install-openclaw-wsl.sh` — installation de base WSL + Node + OpenClaw + Ollama
- `apply-openclaw-config.sh` — applique la config runtime OpenClaw à partir d'un template propre
- `install-mission-control.sh` — réinstalle Mission Control proprement
- `openclaw.runtime.template.json` — template de config OpenClaw assaini, sans secrets
- `NOTES.md` — décisions importantes et checklist post-install

## Ce que ce bundle réapplique

- agents OpenClaw orientés `qwen2.5:14b` / `qwen2.5-coder:14b`
- fallbacks nettoyés pour éviter `deepseek-r1:*` sur les agents outillés
- bindings de canaux actuels
- structure d'agents et routage compatibles avec ton setup actuel
- Mission Control local dans `~/.openclaw/openclaw-mission-control`

## Secrets à remettre manuellement

Avant application, remplace dans `openclaw.runtime.template.json` :

- `__SET_DISCORD_BOT_TOKEN__`
- `__SET_TELEGRAM_BOT_TOKEN__`
- `__OPTIONAL_GATEWAY_TOKEN__` si tu veux un token fixe

## Ordre recommandé

1. `bash install-openclaw-wsl.sh`
2. éditer `openclaw.runtime.template.json`
3. `bash apply-openclaw-config.sh`
4. `bash install-mission-control.sh`
5. vérifier avec `openclaw status`
6. tester Discord / Telegram / Mission Control

## Remarque

Ce bundle ne publie rien, ne pousse rien, et ne reprend pas le contenu brouillon du repo workspace. Il sert uniquement de base de reconstruction propre.
