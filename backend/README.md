Backend (squelette)

Prerequis:
- Node.js 18+ and npm
- (Optionnel) Docker for containerized runs

Installation & run (local dev):
1) Installer deps
   npm ci

2) Variables d'environnement
   Set DATABASE_URL (ex: postgres://postgres:postgres@localhost:5432/postgres)
   Set REDIS_URL (ex: redis://localhost:6379)

3) Démarrer en dev
   npm run start:dev

4) Build
   npm run build

Migrations & DB init:
- Placez les fichiers SQL sous /infra/init
- Pour appliquer les migrations lors d'un run local avec Postgres:
  psql -U postgres -f infra/init/01_create_schema.sql

Scripts utiles (présents dans le monorepo):
- scripts/seed_symbols.js — seed minimal des symbols
- scripts/ingest_consumer_demo.js — demo qui pousse une ligne prices dans la DB

Endpoints demo:
- GET /health
- GET /markets/latest?symbol=BTCUSDT

Notes:
- When running via docker-compose the backend image is built from ../backend and env vars are provided in infra/docker-compose.yml
