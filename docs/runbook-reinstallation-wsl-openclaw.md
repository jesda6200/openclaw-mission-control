# Runbook de réinstallation complète — Windows + WSL + OpenClaw

> **Objectif** : reconstruire cette machine personnelle orientée production légère, depuis zéro jusqu’à un état équivalent à l’existant observé dans le workspace et la configuration locale.
>
> **Principe de ce document** : ne rien inventer. Quand une information n’est pas directement vérifiable ici, elle est marquée **à vérifier** avec une commande de contrôle.

---

## 1. Vue d’ensemble

Ce runbook couvre :

- la base Windows + WSL
- les paquets système Linux nécessaires
- l’installation d’OpenClaw
- la configuration des agents et du routage
- les modèles LLM actuellement configurés
- les modèles locaux réellement présents dans Ollama
- les modèles à tirer pour revenir exactement à la stratégie cible
- les skills installés localement et ceux explicitement activés
- l’installation et l’exploitation de **Mission Control**
- l’authentification GitHub
- une checklist de validation finale
- un récapitulatif fidèle de ce qui a été fait récemment

### État cible vérifié

Les éléments suivants sont **confirmés** sur la machine actuelle :

- OpenClaw installé en version **`2026.3.24`**
- Node.js **`v22.22.1`**
- npm **`10.9.4`**
- Python **`3.12.3`**
- Git **`2.43.0`**
- sqlite3 **`3.45.1`**
- GitHub CLI **`gh 2.45.0`**
- configuration OpenClaw principale : `~/.openclaw/openclaw.json`
- workspace OpenClaw : `/home/damien/.openclaw/workspace`
- agents workspace root : `/home/damien/openclaw-agents`
- routage personnalisé persistant : `/home/damien/.openclaw/workspace/agents-routing.json`
- Mission Control installé dans : `~/.openclaw/openclaw-mission-control`
- service user systemd : `openclaw-dashboard.service`
- Mission Control exposé sur : `http://127.0.0.1:3333`
- GitHub CLI authentifié sur le compte **`jesda6200`**
- repo privé de runbook créé : `jesda6200/openclaw-wsl-runbook`

### Chemin recommandé pour ce document

Chemin proposé et créé :

- `/home/damien/.openclaw/workspace/docs/runbook-reinstallation-wsl-openclaw.md`

---

## 2. Prérequis WSL

## 2.1. Côté Windows

### À installer / activer

- WSL2
- une distribution Linux compatible Ubuntu/Debian
- Windows Terminal recommandé

### Commandes de base côté Windows (PowerShell administrateur)

```powershell
wsl --install
wsl --set-default-version 2
wsl --status
wsl --list --verbose
```

### Ce qu’il faut viser

- **version WSL = 2**
- une distro Linux fonctionnelle
- accès réseau normal depuis WSL
- systemd disponible dans la distro

### Vérifications

Côté Windows :

```powershell
wsl --status
wsl --list --verbose
```

Côté Linux :

```bash
uname -a
ps -p 1 -o comm=
systemctl --user status
```

> **À vérifier** : la procédure exacte utilisée initialement pour activer systemd sous WSL n’est pas documentée ici. Sur Ubuntu récent, vérifier avec :
>
> ```bash
> cat /etc/wsl.conf
> ```
>
> et s’assurer d’avoir au minimum :
>
> ```ini
> [boot]
> systemd=true
> ```

---

## 3. Paquets système de base

## 3.1. Paquets confirmés comme nécessaires

Les éléments suivants sont explicitement requis ou utilisés par l’état actuel :

- `git`
- `node`
- `npm`
- `python3`
- `sqlite3`
- `curl`
- `systemd` / `systemctl --user`
- `gh` (GitHub CLI)
- `ripgrep` (`rg`)
- `go`

`sqlite3` est explicitement mentionné comme requis pour le **usage tracking** de Mission Control.
`ripgrep` est requis pour `session-logs`.
`go` est requis pour reconstruire `wacli` depuis les sources sur Linux.

## 3.2. Installation type sur Ubuntu / Debian WSL

```bash
sudo apt update
sudo apt install -y \
  git \
  curl \
  sqlite3 \
  python3 \
  python3-pip \
  ca-certificates \
  gnupg \
  lsb-release \
  ripgrep \
  golang-go
```

## 3.3. Node.js / npm

La machine actuelle utilise :

- `node v22.22.1`
- `npm 10.9.4`

> **À vérifier** : la méthode exacte d’installation de Node 22 n’est pas documentée ici.
>
> Vérification :
>
> ```bash
> which node
> node -v
> npm -v
> ```

Si tu veux reconstruire à l’identique sans supposer la méthode historique, installe Node 22 via la méthode de ton choix, puis valide :

```bash
node -v
npm -v
```

## 3.4. GitHub CLI

L’état actuel montre `gh version 2.45.0`.

> **À vérifier** : la méthode exacte d’installation historique de `gh` n’est pas documentée ici.
>
> Vérifications :
>
> ```bash
> gh --version
> which gh
> ```

---

## 4. Installation OpenClaw

## 4.1. Installation globale observée

OpenClaw est installé globalement dans le préfixe npm utilisateur :

- préfixe npm global : `/home/damien/.npm-global/lib`
- package installé : `openclaw@2026.3.24`

Packages globaux observés :

- `openclaw@2026.3.24`
- `clawhub@0.9.0`
- `mcporter@0.7.3`
- `@openai/codex@0.116.0`
- `@steipete/oracle@0.9.0`
- `@steipete/summarize@0.12.0`
- `@xdevplatform/xurl@1.0.3`
- `pnpm@10.33.0`
- `zx@8.8.5`
- `axios@1.13.6`
- `jq-cli-wrapper@1.6.1`

## 4.2. Réinstallation type

> **À vérifier** : la commande exacte d’installation initiale d’OpenClaw n’est pas consignée ici.

Vérifier d’abord la config npm globale utilisateur :

```bash
npm config get prefix
npm -g ls --depth=0
```

Si besoin, remettre un préfixe global utilisateur :

```bash
mkdir -p ~/.npm-global
npm config set prefix ~/.npm-global
```

Puis ajouter le binaire global dans le shell si nécessaire :

```bash
echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

Ensuite installer OpenClaw :

```bash
npm install -g openclaw
```

Valider :

```bash
openclaw --version
```

## 4.3. Répertoire de configuration attendu

Après installation/configuration, l’état actuel repose sur :

- `~/.openclaw/openclaw.json`
- `~/.openclaw/agents/`
- `~/.openclaw/workspace/`

Vérifications :

```bash
ls -la ~/.openclaw
find ~/.openclaw -maxdepth 2 -type d | sort
```

## 4.4. Configuration OpenClaw observée

Faits confirmés dans `~/.openclaw/openclaw.json` :

- `lastTouchedVersion`: `2026.3.24`
- mode gateway : `local`
- port gateway : `18789`
- bind gateway : `loopback`
- auth gateway : `token`
- endpoint responses HTTP : activé
- workspace par défaut agents : `/home/damien/.openclaw/workspace`
- profil outils : `coding`
- recherche web : `duckduckgo`

Commandes de vérification :

```bash
python3 -m json.tool ~/.openclaw/openclaw.json | sed -n '1,260p'
```

---

## 5. Agents et routage

## 5.1. Stratégie de modèles actuelle (cible)

La stratégie actuelle demandée et appliquée est :

| Agent | Rôle | Modèle principal local | Fallback cloud |
|---|---|---|---|
| `main` | orchestrateur | `ollama/qwen3:14b` | `openai-codex/gpt-5.4` |
| `dev-engineer` | code / scripts | `ollama/deepseek-coder:33b` | `openai-codex/gpt-5.4` |
| `backend-architect` | architecture | `ollama/deepseek-r1:14b` | `openai-codex/gpt-5.4` |
| `web-builder` | frontend / UI | `ollama/qwen2.5-coder:14b` | `openai-codex/gpt-5.4` |
| `data-analyst` | analyse data | `ollama/deepseek-r1:14b` | `openai-codex/gpt-5.4` |
| `ai-engineer` | IA / ML | `ollama/deepseek-r1:32b` | `openai-codex/gpt-5.4` |
| `security-engineer` | sécurité | `ollama/qwen3:14b` | `openai-codex/gpt-5.4` |
| `devops-engineer` | infra / docker | `ollama/qwen2.5-coder:14b` | `openai-codex/gpt-5.4` |
| `research-agent` | recherche | `ollama/qwen3:14b` | `openai-codex/gpt-5.4` |
| `crypto-analyst` | crypto | `ollama/deepseek-r1:14b` | `openai-codex/gpt-5.4` |
| `qa-engineer` | tests / debug | `ollama/qwen3:8b` | `openai-codex/gpt-5.4` |
| `automation-engineer` | automatisation | `ollama/qwen2.5-coder:14b` | `openai-codex/gpt-5.4` |
| `product-manager` | stratégie produit | `ollama/qwen3:14b` | `openai-codex/gpt-5.4` |
| `ui-designer` | design UI/UX | `ollama/qwen2.5-coder:14b` | `openai-codex/gpt-5.4` |
| `memory-manager` | mémoire / logs | `ollama/qwen3:8b` | `openai-codex/gpt-5.4-mini` |

## 5.2. Providers authentifiés / configurés

Profils d’auth observés :

- `openai-codex:damienlion6200@gmail.com` — provider `openai-codex`, mode `oauth`
- `ollama:default` — provider `ollama`, mode `api_key`

Provider Ollama configuré sur :

- `http://127.0.0.1:11434`

Vérifications :

```bash
python3 -m json.tool ~/.openclaw/openclaw.json | rg -n "openai-codex|ollama|11434|gpt-5.4|qwen3|deepseek"
```

## 5.3. Agents présents

Agents présents dans la configuration actuelle :

- `main`
- `dev-engineer`
- `web-builder`
- `data-analyst`
- `ai-engineer`
- `security-engineer`
- `devops-engineer`
- `research-agent`
- `crypto-analyst`
- `backend-architect`
- `qa-engineer`
- `automation-engineer`
- `product-manager`
- `ui-designer`
- `memory-manager`

Racine des workspaces agents :

- `/home/damien/openclaw-agents`

## 5.4. Routage persistant personnalisé

Un routage persistant existe dans :

- `/home/damien/.openclaw/workspace/agents-routing.json`

Contenu vérifié :

```json
{
  "agents": {
    "routing": [
      { "match": "code|api|backend|script|bug|fix", "agent": "dev-engineer" },
      { "match": "site|landing|frontend|css|html", "agent": "web-builder" },
      { "match": "data|analyse|stats|csv|excel|dataset", "agent": "data-analyst" },
      { "match": "ai|model|llm|prompt|ml", "agent": "ai-engineer" },
      { "match": "security|auth|jwt|vuln|pentest", "agent": "security-engineer" },
      { "match": "docker|ci|cd|deploy|infra|server|install|installation|package|dependency|dependencies|path|service|systemd|env|tooling|skill|skills", "agent": "devops-engineer" },
      { "match": "research|cherche|info|doc", "agent": "research-agent" },
      { "match": "crypto|token|blockchain|wallet|defi", "agent": "crypto-analyst" },
      { "match": "architecture|scalable|system design", "agent": "backend-architect" },
      { "match": "test|qa|validation|bug test", "agent": "qa-engineer" },
      { "match": "automation|cron|bot|script auto", "agent": "automation-engineer" },
      { "match": "product|roadmap|feature|user story", "agent": "product-manager" },
      { "match": "ui|ux|figma|design system", "agent": "ui-designer" }
    ]
  }
}
```

Vérification :

```bash
cat /home/damien/.openclaw/workspace/agents-routing.json
```

---

## 6. Modèles LLM : utilisés maintenant / conseillés

## 6.1. Modèles configurés maintenant

### Par défaut

- primaire global : `ollama/qwen3:14b`
- fallback global : `openai-codex/gpt-5.4`

### Modèles explicitement référencés dans la config actuelle

- `ollama/qwen3:14b`
- `ollama/qwen3:8b`
- `ollama/qwen2.5-coder:14b`
- `ollama/deepseek-coder:33b`
- `ollama/deepseek-r1:14b`
- `ollama/deepseek-r1:32b`
- `openai-codex/gpt-5.4`
- `openai-codex/gpt-5.4-mini`

## 6.2. Modèles réellement présents dans Ollama

Sortie vérifiée de `ollama list` :

- `llama3:8b`
- `qwen2.5:14b`
- `qwen2.5-coder:14b`
- `gemma3:27b`
- `deepseek-r1:32b`
- `deepseek-coder:33b`
- `codellama:13b`
- `mistral:7b`

## 6.3. Modèles manquants à tirer pour coller exactement à la stratégie cible

Manquants par rapport au mapping demandé :

- `qwen3:14b`
- `qwen3:8b`
- `deepseek-r1:14b`

Commande de remise à niveau recommandée :

```bash
ollama pull qwen3:14b
ollama pull qwen3:8b
ollama pull deepseek-r1:14b
```

Puis vérifier :

```bash
ollama list
```

## 6.4. Conseils pratiques

### Ce qui est immédiatement exploitable sans pull supplémentaire

- `dev-engineer` → OK
- `web-builder` → OK
- `ai-engineer` → OK
- `devops-engineer` → OK

### Ce qui fonctionnera mais demandera fallback cloud tant que les modèles manquants ne sont pas pullés

- `main`
- `backend-architect`
- `data-analyst`
- `security-engineer`
- `research-agent`
- `crypto-analyst`
- `qa-engineer`
- `product-manager`
- `memory-manager`

---

## 7. Skills installés et méthode d’installation

## 7.1. Emplacement des skills locales

Les skills OpenClaw installées localement sont visibles dans :

- `/home/damien/.npm-global/lib/node_modules/openclaw/skills`

Vérification :

```bash
find /home/damien/.npm-global/lib/node_modules/openclaw/skills -maxdepth 2 -name SKILL.md | sort
```

## 7.2. Skills locales importantes pour l’état actuel

Les skills suivantes sont particulièrement importantes dans l’état actuel :

- `blogwatcher`
- `clawhub`
- `xurl`
- `nano-pdf`
- `openai-whisper`
- `summarize`
- `himalaya`
- `obsidian`
- `session-logs`
- `wacli`

## 7.3. Méthode d’installation reconstituée pour les skills clés

### `blogwatcher`

Installé via binaire release Linux dans `~/.local/bin/blogwatcher`.

### `clawhub`

Installé via npm global :

```bash
npm install -g clawhub
```

### `xurl`

Installé via npm global :

```bash
npm install -g @xdevplatform/xurl
```

### `nano-pdf`

Installé via `uv tool install` :

```bash
uv tool install nano-pdf
```

### `openai-whisper`

Installé via `uv tool install` :

```bash
uv tool install openai-whisper
```

### `summarize`

Installé via npm global :

```bash
npm install -g @steipete/summarize
```

### `himalaya`

Installé via binaire Linux release dans `~/.local/bin/himalaya`.

### `obsidian`

Installé via release Linux `notesmd-cli`, exposé comme `obsidian-cli` dans `~/.local/bin/obsidian-cli`.

### `session-logs`

Dépend de :

- `jq`
- `rg`

### `wacli`

Construit depuis les sources avec Go puis installé dans `~/.local/bin/wacli`.

Commande type :

```bash
git clone --depth 1 https://github.com/steipete/wacli.git
cd wacli
go build -tags sqlite_fts5 -o ./dist/wacli ./cmd/wacli
install -Dm755 ./dist/wacli "$HOME/.local/bin/wacli"
```

## 7.4. Skills explicitement activées dans `openclaw.json`

Entrées explicitement visibles dans la config actuelle :

- `1password` → `enabled: true`
- `apple-notes` → `enabled: false`
- `coding-agent` → `enabled: true`
- `mcporter` → `enabled: true`
- `blogwatcher` → `enabled: true`
- `blucli` → `enabled: false`
- `clawhub` → `enabled: true`

> Pour les autres skills, vérifier l’éligibilité réelle avec :

```bash
openclaw skills list --json
```

---

## 8. Mission Control : install/config/service

## 8.1. État actuel confirmé

Mission Control est installé et actif avec les caractéristiques suivantes :

- dépôt de travail : `~/.openclaw/openclaw-mission-control`
- dépôt public utilisé lors de la réinstallation mémorisée : `https://github.com/jesda6200/openclaw-mission-control`
- port : `3333`
- bind : `127.0.0.1`
- service user systemd : `openclaw-dashboard.service`
- type de lancement : `npm run start -- -H 127.0.0.1 -p 3333`

## 8.2. Script de réinstallation disponible

Un script de réinstallation existe déjà :

- `/home/damien/.openclaw/workspace/reinstall-mission-control-propre.sh`

## 8.3. Procédure de réinstallation recommandée

```bash
bash /home/damien/.openclaw/workspace/reinstall-mission-control-propre.sh
```

## 8.4. Correctif fonctionnel mémorisé

Correctifs / constats explicitement mémorisés :

- `sqlite3` requis pour le suivi d’usage
- un **fallback fix** a été appliqué à `GET /api/config`
- objectif du patch : éviter que le dashboard échoue brutalement si le **Gateway RPC** est indisponible au chargement
- une branche privée a été poussée :
  - dépôt : `git@github.com:jesda6200/openclaw-mission-control-private.git`
  - branche : `fix/config-fallback`

## 8.5. Point d’attention encore ouvert

Les logs du service montrent encore ce problème côté écran skills :

- `openclaw skills list --json` → sortie vide dans le flux UI/API
- `openclaw skills check --json` → sortie vide dans le flux UI/API
- conséquence : erreur de parsing JSON dans Mission Control

---

## 9. GitHub / auth / repo privé

## 9.1. État actuel confirmé

GitHub CLI est authentifié avec :

- compte actif : `jesda6200`
- fichier : `/home/damien/.config/gh/hosts.yml`
- protocole git operations : `https`
- scopes observés : `gist`, `read:org`, `repo`, `workflow`

Vérification :

```bash
gh auth status
```

## 9.2. Repo privé Mission Control mémorisé

Les éléments suivants sont confirmés en mémoire :

- dépôt privé : `git@github.com:jesda6200/openclaw-mission-control-private.git`
- branche poussée : `fix/config-fallback`

## 9.3. Repo privé de runbook

Repo créé :

- `jesda6200/openclaw-wsl-runbook`

## 9.4. Préférence utilisateur GitHub

Préférence mémorisée :

- feu vert permanent pour créer un dépôt GitHub privé et publier du contenu **si la demande explicite porte sur une publication GitHub / création de repo / push GitHub**

---

## 10. Validation checklist

### Système

- [ ] WSL2 opérationnel
- [ ] `systemd` actif dans WSL
- [ ] `node -v` retourne `v22.22.1` ou version validée
- [ ] `npm -v` retourne `10.9.4` ou version validée
- [ ] `git --version` OK
- [ ] `python3 --version` OK
- [ ] `sqlite3 --version` OK
- [ ] `gh --version` OK
- [ ] `rg --version` OK
- [ ] `go version` OK

### OpenClaw

- [ ] `openclaw --version` retourne `2026.3.24` ou version cible choisie
- [ ] `~/.openclaw/openclaw.json` existe
- [ ] `~/.openclaw/workspace` existe
- [ ] `~/.openclaw/agents` existe
- [ ] le provider Ollama pointe vers `http://127.0.0.1:11434`
- [ ] le mapping de modèles agents correspond à la stratégie cible

### Modèles

- [ ] `ollama list` contient `deepseek-coder:33b`
- [ ] `ollama list` contient `qwen2.5-coder:14b`
- [ ] `ollama list` contient `deepseek-r1:32b`
- [ ] `ollama list` contient `qwen3:14b`
- [ ] `ollama list` contient `qwen3:8b`
- [ ] `ollama list` contient `deepseek-r1:14b`

### Routage

- [ ] `/home/damien/.openclaw/workspace/agents-routing.json` existe
- [ ] le contenu correspond au mapping attendu

### Skills

- [ ] `blogwatcher` présent
- [ ] `clawhub` présent
- [ ] `xurl` présent
- [ ] `nano-pdf` présent
- [ ] `openai-whisper` présent
- [ ] `summarize` présent
- [ ] `himalaya` présent
- [ ] `obsidian` présent
- [ ] `session-logs` présent
- [ ] `wacli` présent

### Mission Control

- [ ] dépôt présent dans `~/.openclaw/openclaw-mission-control`
- [ ] `npm ci` OK
- [ ] `npm run build` OK
- [ ] `openclaw-dashboard.service` installé
- [ ] `systemctl --user status openclaw-dashboard.service` = actif
- [ ] `curl http://127.0.0.1:3333/api/gateway` OK
- [ ] `curl http://127.0.0.1:3333/api/config` OK

### GitHub

- [ ] `gh auth status` OK
- [ ] compte actif `jesda6200`
- [ ] accès au dépôt privé Mission Control vérifié si nécessaire
- [ ] accès au repo `jesda6200/openclaw-wsl-runbook` OK

---

## 11. Recap de cette session

Cette section reprend **uniquement** ce qui est vérifié par fichiers, mémoire ou état système.

## 11.1. Installs / activations réalisées

Installé / rendu opérationnel pendant cette session :

- `blogwatcher`
- `clawhub`
- `xurl`
- `nano-pdf`
- `openai-whisper`
- `summarize`
- `himalaya`
- `obsidian`
- `session-logs`
- `wacli`

## 11.2. Routing mis à jour

Le routage a été enrichi pour faire pointer explicitement les demandes d’installation / dépendances / services / tooling / skills vers `devops-engineer`.

## 11.3. Stratégie de modèles mise à jour

Le mapping agents → modèles a été modifié pour basculer sur une stratégie locale-first Ollama avec fallback cloud OpenAI Codex.

## 11.4. Repo privé créé

Repo privé créé et poussé :

- `jesda6200/openclaw-wsl-runbook`

---

## 12. Commandes utiles de maintenance

## 12.1. Versions et état général

```bash
node -v
npm -v
python3 --version
git --version
sqlite3 --version
gh --version
rg --version
go version
openclaw --version
```

## 12.2. OpenClaw

```bash
ls -la ~/.openclaw
python3 -m json.tool ~/.openclaw/openclaw.json | sed -n '1,320p'
```

## 12.3. Modèles Ollama

```bash
ollama list
ollama pull qwen3:14b
ollama pull qwen3:8b
ollama pull deepseek-r1:14b
```

## 12.4. Skills

```bash
find ~/.npm-global/lib/node_modules/openclaw/skills -maxdepth 2 -name SKILL.md | sort
openclaw skills list --json
openclaw skills check --json
```

## 12.5. Mission Control

```bash
cd ~/.openclaw/openclaw-mission-control
git status
git remote -v
npm ci
npm run build
systemctl --user daemon-reload
systemctl --user restart openclaw-dashboard.service
systemctl --user status openclaw-dashboard.service --no-pager --lines=40
journalctl --user -u openclaw-dashboard.service -n 100 --no-pager
curl -fsS http://127.0.0.1:3333/api/gateway
curl -fsS http://127.0.0.1:3333/api/config
```

## 12.6. GitHub

```bash
gh auth status
gh repo view jesda6200/openclaw-wsl-runbook
cd ~/.openclaw/openclaw-mission-control && git remote -v
ls -la ~/.ssh/id_ed25519_openclaw_mission_control*
ssh -T git@github.com
```

---

## Annexes recommandées

Je recommande d’ajouter ensuite, si tu veux rendre la reconstruction encore plus reproductible :

1. `docs/checklists/rebuild-postinstall-checklist.md`
2. `docs/snippets/openclaw-json-reference.md`
3. `docs/snippets/mission-control-service.md`
4. `docs/snippets/agents-routing.json`
5. `scripts/bootstrap-models.sh`

> **Attention** : ne jamais committer de secrets, tokens, ou clés privées.
