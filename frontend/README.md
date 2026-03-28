# Frontend — NebulaLend

Frontend Next.js 14 + Tailwind CSS pour une plateforme de lending crypto type Aave simplifiée.

## Features

- Auth UI email/password branchée sur le backend Node.js (`/api/v1/auth/register`, `/login`, `/me`)
- Connexion wallet MetaMask côté UI
- Dashboard premium responsive
- Vues dépôt / emprunt avec composants réutilisables
- Taux dynamiques mockés prêts à être remplacés par des endpoints marché
- États loading / error / success dans les blocs critiques
- Build Docker standalone

## Run local

```bash
npm install
npm run dev --workspace @lending/frontend
```

App: `http://localhost:3000`

### Variables

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

En dev séparé, pointez cette variable vers le backend Node.js si l’API tourne sur un autre port ou host.

## Backend dependencies

Endpoints actuellement consommés par l’UI:

- `GET /api/v1/health`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me` (prêt, token déjà récupéré côté UI)

Endpoints recommandés pour remplacer les mocks marché/positions:

- `GET /api/v1/markets`
- `GET /api/v1/portfolio/summary`
- `GET /api/v1/portfolio/activity`
- `POST /api/v1/positions/deposit`
- `POST /api/v1/positions/borrow`
```