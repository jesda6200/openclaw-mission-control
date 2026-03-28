#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/jesda6200/openclaw-mission-control"
TARGET_DIR="${HOME}/.openclaw/openclaw-mission-control"
SERVICE_FILE="${HOME}/.config/systemd/user/openclaw-dashboard.service"
PORT="3333"
HOST="127.0.0.1"

echo "[1/7] Préparation"
command -v git >/dev/null
command -v node >/dev/null
command -v npm >/dev/null
command -v sqlite3 >/dev/null
mkdir -p "${HOME}/.openclaw"
mkdir -p "${HOME}/.config/systemd/user"

if [ -d "$TARGET_DIR/.git" ]; then
  echo "[2/7] Nettoyage des remotes parasites"
  cd "$TARGET_DIR"
  git remote remove private 2>/dev/null || true
  git remote set-url origin "$REPO_URL"
  git fetch origin --prune
  git checkout main
  git reset --hard origin/main
else
  echo "[2/7] Clonage du dépôt"
  rm -rf "$TARGET_DIR"
  git clone "$REPO_URL" "$TARGET_DIR"
  cd "$TARGET_DIR"
fi

echo "[3/7] Installation des dépendances"
npm ci

echo "[4/7] Build"
npm run build

echo "[5/7] Service systemd"
cat > "$SERVICE_FILE" <<SERVICE
[Unit]
Description=OpenClaw Mission Control Dashboard
After=network.target

[Service]
Type=simple
WorkingDirectory=$TARGET_DIR
ExecStart=/usr/bin/env bash -lc 'cd "$TARGET_DIR" && PORT="$PORT" HOST="$HOST" npm run start -- -H "$HOST" -p "$PORT"'
Restart=always
RestartSec=2
Environment=PORT=$PORT
Environment=HOST=$HOST

[Install]
WantedBy=default.target
SERVICE

systemctl --user daemon-reload
systemctl --user enable --now openclaw-dashboard.service

echo "[6/7] Vérification"
sleep 3
curl -fsS "http://$HOST:$PORT/api/gateway" >/dev/null
curl -fsS "http://$HOST:$PORT/api/config" >/dev/null
curl -fsS "http://$HOST:$PORT/api/skills?action=list" >/dev/null
curl -fsS "http://$HOST:$PORT/api/skills?action=check" >/dev/null

echo "[7/7] OK"
