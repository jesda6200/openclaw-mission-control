# Crypto Monitoring SaaS — Monorepo (squelette)

Ce dépôt contient la structure minimale pour un SaaS de monitoring crypto en temps réel.

Structure:
- /backend — API (Node.js)
- /frontend — React + Vite frontend
- /infra — Docker Compose + init scripts (TimescaleDB, Redis)
- /scripts — migrations, seed et ingestion demo

Quickstart (dev/demo)

Prerequis:
- Docker & docker-compose (v1.29+ or docker compose plugin)
- Node.js 18+ and npm

1) Copier .env.example → .env et ajuster si nécessaire
   cp infra/env.example .env

2) Lancer les services de base (DB + Redis + backend + frontend) en mode développement
   cd infra
   docker-compose up --build

3) Initialiser la base (exécuter les scripts SQL d'init)
   # dans un terminal local (ou via le container db):
   docker exec -it $(docker-compose ps -q db) psql -U postgres -f /docker-entrypoint-initdb.d/01_create_schema.sql

4) Seed des symboles de demo
   # localement (si vous avez psql) ou depuis le container backend:
   node scripts/seed_symbols.js

5) Démarrer les front & backend en local (optionnel, si vous préférez ne pas utiliser les containers pour dev)
   cd frontend && npm ci && npm run dev
   cd ../backend && npm ci && npm run start:dev

Endpoints utiles (dev):
- Backend: http://localhost:4000/health
- Frontend: http://localhost:5173/

Voir les READMEs spécifiques sous /backend, /frontend et /infra pour plus de détails.

--
Generated: Deliverables and dev run instructions updated.
