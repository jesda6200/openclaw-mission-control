Scripts for fallback/local mode

- seed_sqlite.sh <out_db>
  - Creates data/ directory, creates or replaces the SQLite file, applies schema (scripts/schema.sql) and inserts minimal seed data.
  - Usage: ./scripts/seed_sqlite.sh data/dev.sqlite

- smoke_local.sh <base_url> [timeout_seconds]
  - Waits for the app to become healthy, then calls a set of endpoints and checks HTTP codes.
  - Usage: ./scripts/smoke_local.sh http://localhost:3000 60

Notes
- Customize scripts/schema.sql to match your production schema where sensible for tests.
- Scripts are intentionally minimal and POSIX/bash-friendly.