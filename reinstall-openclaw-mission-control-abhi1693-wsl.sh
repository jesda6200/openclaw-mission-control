#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="${HOME}/.openclaw/openclaw-mission-control-abhi1693"
PORT="3344"
BACKEND_PORT="8000"
POSTGRES_PORT="5432"
REDIS_PORT="6379"
LOG_DIR="${HOME}/.local/state/openclaw-mission-control-abhi1693"
mkdir -p "$LOG_DIR"

export PATH="$HOME/.local/bin:$PATH"

cd "$REPO_DIR"

cat > .env <<EOF
AUTH_MODE=local
LOCAL_AUTH_TOKEN=$(openssl rand -hex 32)
BACKEND_PORT=${BACKEND_PORT}
FRONTEND_PORT=${PORT}
POSTGRES_PORT=${POSTGRES_PORT}
REDIS_PORT=${REDIS_PORT}
NEXT_PUBLIC_API_URL=http://localhost:${BACKEND_PORT}
EOF

cat > backend/.env <<EOF
AUTH_MODE=local
LOCAL_AUTH_TOKEN=$(grep '^LOCAL_AUTH_TOKEN=' .env | cut -d= -f2-)
BASE_URL=http://localhost:${BACKEND_PORT}
DATABASE_URL=postgresql+psycopg://postgres:postgres@db:5432/mission_control
RQ_REDIS_URL=redis://redis:6379/0
EOF

cat > frontend/.env <<EOF
NEXT_PUBLIC_API_URL=http://localhost:${BACKEND_PORT}
NEXT_PUBLIC_AUTH_MODE=local
EOF

echo '[1/5] Starting db/redis...'
docker compose up -d db redis

for i in {1..60}; do
  if docker compose exec -T db pg_isready -U postgres -d mission_control >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

echo '[2/5] Backend migrations inside container...'
docker compose run --rm backend uv run alembic upgrade head | tee "$LOG_DIR/backend-migrations.log"

echo '[3/5] Build frontend...'
( cd frontend && npm install && npm run build ) | tee "$LOG_DIR/frontend-build.log"

echo '[4/5] Start services...'
docker compose up -d backend frontend webhook-worker
sleep 5

echo '[5/5] Verify...'
curl -fsS "http://127.0.0.1:${PORT}" >/dev/null
curl -fsS "http://127.0.0.1:${BACKEND_PORT}/healthz" >/dev/null
curl -fsS "http://127.0.0.1:${BACKEND_PORT}/api/openclaw/health" >/dev/null || true

echo "OK: frontend http://127.0.0.1:${PORT} backend http://127.0.0.1:${BACKEND_PORT}/healthz"
