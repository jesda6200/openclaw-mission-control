#!/usr/bin/env bash
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

sudo apt-get update
sudo apt-get install -y curl git jq build-essential python3 python3-pip sqlite3 ca-certificates

if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

if ! command -v ollama >/dev/null 2>&1; then
  curl -fsSL https://ollama.com/install.sh | sh
fi

npm install -g openclaw

mkdir -p "$HOME/.openclaw"
mkdir -p "$HOME/.openclaw/workspace"

# Modèles retenus pour ce setup
ollama pull qwen2.5:14b || true
ollama pull qwen2.5-coder:14b || true
ollama pull gemma3:27b || true
ollama pull qwen3:14b || true
ollama pull deepseek-coder:33b || true

openclaw gateway start || true
sleep 3
openclaw status || true

echo "Base WSL OpenClaw installée. Étape suivante: éditer bootstrap-wsl/openclaw.runtime.template.json puis lancer apply-openclaw-config.sh"
