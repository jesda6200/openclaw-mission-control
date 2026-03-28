# QA scripts

## `architecture-readiness.mjs`
Audit léger du repo par rapport à la cible produit demandée.

## `api-auth-smoke.mjs`
Smoke test live contre une API démarrée localement.

Variables:
- `API_BASE_URL` — défaut `http://127.0.0.1:3000/api/v1`
- `API_ORIGIN` — défaut `http://localhost:3000`
