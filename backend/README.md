# Backend Node V2 production-ready

Backend Express V2 avec auth JWT robuste, rotation des refresh tokens, RBAC simple, validation Zod, sécurité HTTP, logs propres, stockage abstrait et fallback local sans dépendance externe.

## Ce qui est inclus

- API versionnée sous ` /api/v1 `
- Access token + refresh token sécurisé avec **rotation**
- Stockage refresh tokens **persistant** via Postgres ou SQLite
- Fallback automatique **SQLite**, puis **mémoire** si nécessaire
- Middleware sécurité: `helmet`, `cors` strict configurable, `express-rate-limit`
- Validation des payloads avec `zod`
- Gestion d'erreurs centralisée avec format JSON homogène
- RBAC simple: `user` / `admin`
- Logs HTTP et applicatifs via `pino`
- Dockerfile + docker-compose Postgres
- Tests auth complets: happy path, validation, RBAC, token expiré, rotation
- Seed admin automatique au démarrage

## Architecture

```text
backend/
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── env.js
│   │   └── logger.js
│   ├── constants/
│   │   └── roles.js
│   ├── controllers/
│   │   ├── auth-controller.js
│   │   └── health-controller.js
│   ├── db/
│   │   ├── index.js
│   │   ├── memory-adapter.js
│   │   ├── postgres-adapter.js
│   │   └── sqlite-adapter.js
│   ├── middlewares/
│   │   ├── auth.js
│   │   ├── error-handler.js
│   │   ├── rate-limit.js
│   │   ├── request-id.js
│   │   └── validate.js
│   ├── repositories/
│   │   ├── refresh-token-repository.js
│   │   └── user-repository.js
│   ├── routes/
│   │   ├── auth-routes.js
│   │   └── index.js
│   ├── schemas/
│   │   └── auth-schema.js
│   ├── services/
│   │   ├── auth-service.js
│   │   └── token-service.js
│   └── utils/
│       ├── async-handler.js
│       ├── crypto.js
│       └── errors.js
└── test/
    └── auth.test.js
```

## Installation locale

```bash
cd /home/damien/.openclaw/workspace/backend
cp .env.example .env
npm install
```

## Lancement immédiat en local (sans Docker)

### Option 1 — SQLite local recommandée

```bash
cd /home/damien/.openclaw/workspace/backend
cp .env.example .env
npm start
```

Par défaut, `.env.example` utilise SQLite local via `./data/app.sqlite`.

### Option 2 — mémoire pure

```bash
cd /home/damien/.openclaw/workspace/backend
cp .env.example .env
sed -i 's/^DB_CLIENT=.*/DB_CLIENT=memory/' .env
npm start
```

### Option 3 — Postgres local ou Docker

```bash
cd /home/damien/.openclaw/workspace/backend
cp .env.example .env
# dans .env, mettre DB_CLIENT=postgres
npm start
```

Si `DB_CLIENT=postgres` mais que Postgres est indisponible, l'application **fallback automatiquement sur SQLite**.

## Variables d'environnement principales

- `PORT=3000`
- `DB_CLIENT=sqlite|postgres|memory`
- `DATABASE_URL=postgresql://...`
- `SQLITE_FILE=./data/app.sqlite`
- `JWT_ACCESS_SECRET=...`
- `JWT_REFRESH_SECRET=...`
- `JWT_ACCESS_EXPIRES_IN=15m`
- `JWT_REFRESH_EXPIRES_IN=7d`
- `CORS_ORIGIN=http://localhost:3000,http://localhost:5173`
- `RATE_LIMIT_MAX=200`
- `AUTH_RATE_LIMIT_MAX=20`
- `DEFAULT_ADMIN_EMAIL=admin@example.com`
- `DEFAULT_ADMIN_PASSWORD=Admin123!`

## Démarrage Docker

```bash
cd /home/damien/.openclaw/workspace/backend
cp .env.example .env
docker compose up --build
```

## Endpoints

### Health

```bash
curl http://localhost:3000/api/v1/health
```

### Register

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -H 'Origin: http://localhost:3000' \
  -d '{"name":"Damien","email":"damien@example.com","password":"secret1234"}'
```

### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -H 'Origin: http://localhost:3000' \
  -d '{"email":"damien@example.com","password":"secret1234"}'
```

### Refresh

```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H 'Content-Type: application/json' \
  -H 'Origin: http://localhost:3000' \
  -d '{"refreshToken":"VOTRE_REFRESH_TOKEN"}'
```

### Me

```bash
curl http://localhost:3000/api/v1/auth/me \
  -H 'Origin: http://localhost:3000' \
  -H 'Authorization: Bearer VOTRE_ACCESS_TOKEN'
```

### Liste des utilisateurs (admin only)

```bash
curl http://localhost:3000/api/v1/auth/users \
  -H 'Origin: http://localhost:3000' \
  -H 'Authorization: Bearer VOTRE_ACCESS_TOKEN_ADMIN'
```

## Commandes exactes

```bash
cd /home/damien/.openclaw/workspace/backend
npm install
cp .env.example .env
npm start
npm test
npm run test:auth
docker compose up --build
```

## Notes de sécurité

- Changer impérativement les secrets JWT en production
- Les refresh tokens sont stockés **hachés** en base
- Une tentative de réutilisation d'un refresh token révoqué invalide la famille
- CORS est strict: seuls les origins configurés passent
- Rate limit global + auth séparé

## Test rapide manuel

1. lancer `npm start`
2. créer un compte via `/api/v1/auth/register`
3. appeler `/api/v1/auth/login`
4. appeler `/api/v1/auth/me` avec l'access token
5. appeler `/api/v1/auth/refresh`
6. réessayer l'ancien refresh token: il doit être rejeté
7. tester `/api/v1/auth/users` avec un user simple: `403`
8. tester avec l'admin seedé: `200`
