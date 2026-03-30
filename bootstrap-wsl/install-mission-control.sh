#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/jesda6200/openclaw-mission-control"
TARGET_DIR="$HOME/.openclaw/openclaw-mission-control"
SERVICE_FILE="$HOME/.config/systemd/user/openclaw-dashboard.service"
PORT="3333"
HOST="127.0.0.1"

command -v git >/dev/null
command -v node >/dev/null
command -v npm >/dev/null
mkdir -p "$HOME/.openclaw"
mkdir -p "$HOME/.config/systemd/user"

if [ -d "$TARGET_DIR/.git" ]; then
  cd "$TARGET_DIR"
  git remote set-url origin "$REPO_URL"
  git fetch origin --prune
  git checkout main
  git reset --hard origin/main
else
  rm -rf "$TARGET_DIR"
  git clone "$REPO_URL" "$TARGET_DIR"
  cd "$TARGET_DIR"
fi

npm ci
npm run build

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
sleep 3
curl -fsS "http://$HOST:$PORT" >/dev/null

echo "Mission Control OK sur http://$HOST:$PORT"
