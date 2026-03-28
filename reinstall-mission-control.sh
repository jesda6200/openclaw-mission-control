#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${1:-https://github.com/robsannaa/openclaw-mission-control.git}"
WORKDIR="${HOME}/.openclaw/openclaw-mission-control"
SERVICE_FILE="${HOME}/.config/systemd/user/openclaw-dashboard.service"
PORT="3333"
HOST="127.0.0.1"

log() { printf '[mission-control] %s\n' "$*"; }

log "Vérification des prérequis"
command -v git >/dev/null
command -v node >/dev/null
command -v npm >/dev/null
command -v sqlite3 >/dev/null

if [ ! -d "${HOME}/.openclaw" ]; then
  mkdir -p "${HOME}/.openclaw"
fi

if [ -d "$WORKDIR/.git" ]; then
  log "Mise à jour du dépôt existant"
  git -C "$WORKDIR" fetch --all --prune
  git -C "$WORKDIR" reset --hard origin/main || git -C "$WORKDIR" reset --hard origin/master
else
  log "Clonage du dépôt"
  rm -rf "$WORKDIR"
  git clone "$REPO_URL" "$WORKDIR"
fi

log "Installation des dépendances"
cd "$WORKDIR"
npm ci

log "Build de production"
npm run build

log "Écriture du service systemd utilisateur"
mkdir -p "${HOME}/.config/systemd/user"
cat > "$SERVICE_FILE" <<EOF
[Unit]
Description=OpenClaw Mission Control Dashboard
After=network.target

[Service]
Type=simple
WorkingDirectory=${WORKDIR}
ExecStart=/usr/bin/env bash -lc 'cd "${WORKDIR}" && PORT="${PORT}" HOST="${HOST}" npm run start -- -H "${HOST}" -p "${PORT}"'
Restart=always
RestartSec=2
Environment=PORT=${PORT}
Environment=HOST=${HOST}

[Install]
WantedBy=default.target
EOF

log "Activation et redémarrage du service"
systemctl --user daemon-reload
systemctl --user enable --now openclaw-dashboard.service
sleep 3

log "Vérification des endpoints"
curl -fsS "http://${HOST}:${PORT}/api/gateway" >/dev/null
curl -fsS "http://${HOST}:${PORT}/api/config" >/dev/null

log "Mission Control est prêt sur http://${HOST}:${PORT}"
