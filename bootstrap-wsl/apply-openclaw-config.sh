#!/usr/bin/env bash
set -euo pipefail

SRC_DIR="$(cd "$(dirname "$0")" && pwd)"
TEMPLATE="$SRC_DIR/openclaw.runtime.template.json"
TARGET="$HOME/.openclaw/openclaw.json"

if grep -q '__SET_DISCORD_BOT_TOKEN__\|__SET_TELEGRAM_BOT_TOKEN__' "$TEMPLATE"; then
  echo "Remplace d'abord les placeholders de secrets dans: $TEMPLATE"
  exit 1
fi

mkdir -p "$HOME/.openclaw"
cp "$TEMPLATE" "$TARGET"

openclaw gateway restart || openclaw gateway start || true
sleep 3
openclaw status || true
openclaw agents || true

echo "Config OpenClaw appliquée: $TARGET"
