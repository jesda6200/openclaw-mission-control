# Crypto Monitoring SaaS — Monorepo (squelette)

Ce dépôt contient la structure minimale pour un SaaS de monitoring crypto en temps réel.

Structure:
- /backend — API (Node.js + NestJS style starter)
- /frontend — React + Vite frontend
- /infra — Docker Compose + init scripts
- /scripts — migrations, seed et ingestion demo

Quickstart (dev/demo):
1. Installer Docker & docker-compose
2. Copier .env.example → .env et ajuster si nécessaire
3. docker-compose -f infra/docker-compose.yml up --build
4. docker exec -it <db> psql -U postgres -f /docker-entrypoint-initdb.d/01_create_schema.sql
5. cd frontend && npm ci && npm run dev
6. cd backend && npm ci && npm run start:dev

Voir /infra/README.md et /backend/README.md pour plus de détails.
