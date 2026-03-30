# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

# Cheat sheet : commandes OpenClaw utiles (2026-03-30)

Note : ce fichier est la source de vérité locale pour les commandes OpenClaw que l'on exécute régulièrement. Conserver ici et exécuter après revue.

## Gateway
- openclaw gateway status
- openclaw gateway start
- openclaw gateway stop
- openclaw gateway restart

## Agents (gestion)
- openclaw agents list
- openclaw agents add
- openclaw agents delete <agent>
- openclaw agents bind <agent> <binding>
- openclaw agents bindings
- openclaw agents set-identity <agent> --name <name> --emoji <emoji>
  (no --model option on this CLI version; set model via 'openclaw models' or agent config files)

## Models (gestion globale)
- openclaw models list
- openclaw models status
- openclaw models set <provider/model>
  → Ex: openclaw models set openai/gpt-5-mini
- openclaw models set-image <provider/model>

Alias & fallbacks
- openclaw models aliases list
- openclaw models aliases add <alias> <provider/model>
- openclaw models aliases remove <alias>

- openclaw models fallbacks list
- openclaw models fallbacks add <provider/model>
- openclaw models fallbacks remove <provider/model>
- openclaw models fallbacks clear

- openclaw models image-fallbacks list
- openclaw models image-fallbacks add <provider/model>
- openclaw models image-fallbacks remove <provider/model>
- openclaw models image-fallbacks clear

## Sessions & subagents (via CLI tools / API)
- openclaw sessions_list  (lister les sous-agents / sessions)
- gh / sessions_spawn (via OpenClaw CLI or API) pour lancer des sub-sessions ACP (nous utilisons sessions_spawn depuis le contrôleur)

## GitHub / Repo ops (gh CLI)
- gh repo create <owner/repo> --source=. --remote=origin --push --public|--private
- gh pr create --title "..." --body "..." --head <branch> --base main
- gh pr merge <num> --merge|--squash|--rebase --delete-branch
- gh run list --repo <owner/repo>
- gh run view <run_id> --log --repo <owner/repo>
- gh repo edit <owner/repo> --visibility private|public
- gh api --method PUT /repos/<owner>/<repo>/branches/main/protection --input -

## Best practices (operational)
1) Toujours vérifier `openclaw models status` après modification pour confirmer la valeur active.  
2) Conserver les commandes critiques dans ce fichier (TOOLS.md) et dans `~/.openclaw/openclaw-boot.sh` si tu veux les appliquer automatiquement au démarrage.  
3) Pour modifications de config sensibles : sauvegarder ~/.openclaw/openclaw.json (backup automatique effectué par openclaw models set).
4) Pour les PR & merges : privilégier tests verts + 1 review manuelle si la protection l’exige.

## Faire persistant (recommandé)
- Fichier de référence : /home/damien/.openclaw/workspace/TOOLS.md (ce fichier) — versionné si tu veux (commit).  
- Script de démarrage (optionnel) : ~/.openclaw/openclaw-boot.sh contenant les `openclaw models set` et `openclaw models fallbacks add` que tu veux appliquer automatiquement au boot ; lancer via `openclaw gateway restart` ou via ton init system.

---

Ajoute ici toute commande nouvelle que tu veux rendre persistante. Je peux automatiser l’écriture dans ce fichier (avec ta confirmation) et/ou créer le script `~/.openclaw/openclaw-boot.sh` et l’enregistrer pour le démarrage.
