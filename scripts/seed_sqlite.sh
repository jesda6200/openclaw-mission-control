#!/usr/bin/env bash
set -euo pipefail

OUT_DB=${1:-data/dev.sqlite}
SCHEMA_FILE="scripts/schema.sql"

mkdir -p "$(dirname "$OUT_DB")"
rm -f "$OUT_DB"

if [ ! -f "$SCHEMA_FILE" ]; then
  cat > "$SCHEMA_FILE" <<'SQL'
-- Example schema for local fallback (adjust to your app)
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER REFERENCES users(id),
  name TEXT,
  qty INTEGER DEFAULT 0
);

SQL
fi

sqlite3 "$OUT_DB" < "$SCHEMA_FILE"

# Insert minimal seed data
sqlite3 "$OUT_DB" <<SQL
BEGIN TRANSACTION;
INSERT INTO users (email, name) VALUES ('alice@example.local','Alice');
INSERT INTO users (email, name) VALUES ('bob@example.local','Bob');
INSERT INTO items (owner_id, name, qty) VALUES (1,'Sample item',10);
COMMIT;
SQL

echo "Created $OUT_DB with schema and seed data."