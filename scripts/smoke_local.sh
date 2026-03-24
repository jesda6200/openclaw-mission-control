#!/usr/bin/env bash
set -euo pipefail

BASE_URL=${1:-http://localhost:3000}
TIMEOUT=${2:-60}

check_port(){
  local url="$1"
  local deadline=$((SECONDS + TIMEOUT))
  while [ $SECONDS -lt $deadline ]; do
    if curl -sSf "$url/healthz" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  return 1
}

if ! check_port "$BASE_URL"; then
  echo "Service did not become healthy within ${TIMEOUT}s"
  exit 2
fi

set +e
OK=0
ERR=0

for path in "/healthz" "/api/v1/status" "/api/v1/items"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$path")
  echo "$path -> HTTP $code"
  if [ "$code" -ge 200 ] && [ "$code" -lt 300 ]; then
    OK=$((OK+1))
  else
    ERR=$((ERR+1))
  fi
done

if [ "$ERR" -eq 0 ]; then
  echo "Smoke tests passed ($OK successful checks)."
  exit 0
else
  echo "Smoke tests failed ($ERR failed)."
  exit 3
fi