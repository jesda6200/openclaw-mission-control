# NebulaLend Monorepo

Monorepo clean architecture pour une plateforme moderne de lending crypto type Aave simplifié.

## Apps & packages

- `frontend/` — Next.js 14 + Tailwind premium UI
- `backend/` — API Node.js JWT auth prête prod
- `packages/contracts/` — types et contrats partagés frontend/backend
- `infra/` — orchestration Docker

## Quick start

### Local

```bash
npm install
npm run dev:backend
npm run dev:frontend
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3000/api/v1/health` par défaut si lancé seul, ou via Docker selon variables/ports choisies

### Docker

```bash
cd infra
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`

## Frontend stack

- Next.js App Router
- Tailwind CSS
- TypeScript
- MetaMask connect UI
- REST API integration layer

## Backend integration used now

Le frontend consomme déjà:

- `GET /api/v1/health`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

## Suggested next backend endpoints

Pour remplacer les mocks de lending:

- `GET /api/v1/markets`
- `GET /api/v1/portfolio/summary`
- `GET /api/v1/portfolio/activity`
- `POST /api/v1/positions/deposit`
- `POST /api/v1/positions/borrow`

## Production notes

- Le frontend build en mode standalone pour Docker.
- Le backend doit autoriser `CORS_ORIGIN=http://localhost:3000`.
- Les tokens JWT sont reçus côté UI; stockage sécurisé (cookie httpOnly ou BFF) recommandé pour un vrai déploiement prod.
