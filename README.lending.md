# Simplified Crypto Lending Platform

Ce document décrit la cible d'architecture et le bootstrap technique pour transformer ce workspace en plateforme de lending crypto type Aave simplifié.

## Stack cible
- **Monorepo** avec `apps/`, `packages/`, `docs/`, `infra/`
- **Backend**: Node.js + REST + JWT + validation Zod
- **DB**: PostgreSQL
- **Auth**: email/password + wallet MetaMask
- **Infra**: Docker Compose obligatoire
- **Frontend attendu**: dashboard web branché sur les contrats API partagés

## Livrables disponibles dans ce workspace
- `docs/architecture/lending-system-design.md`
- `docs/architecture/adr/*`
- `docs/db/lending-schema.sql`
- `docs/api/lending-openapi.yaml`
- `packages/contracts/src/index.ts`
- `packages/config/lending-env.example`
- `infra/lending/docker-compose.yml`
- `scripts/lending/seed_lending.sql`

## Quick start DB only
```bash
cd /home/damien/.openclaw/workspace/infra/lending
docker compose up -d db
```

## Quick start full skeleton
```bash
cd /home/damien/.openclaw/workspace/infra/lending
docker compose up -d
```

> Le service `api` est volontairement un placeholder non destructif pour permettre à `dev-engineer` d'installer l'app réelle dans `apps/api` sans conflit avec le backend existant du workspace.

## Structure recommandée à créer ensuite
```text
apps/
  api/
  web/
packages/
  contracts/
  config/
  domain/
```

## Règles métier MVP
- dépôt simulé dans un pool d'actif
- emprunt simulé soumis au LTV max du collatéral
- health factor affiché dans le dashboard
- prix et taux dynamiques mockés, stockés/servis comme données backend
- pas de liquidation automatique dans le MVP

## Sécurité minimale attendue
- JWT access court + refresh rotatif
- refresh token hashé en base
- nonce wallet à usage unique
- validation stricte des montants et adresses
- endpoints idempotents pour les écritures financières

## Ordre de réalisation conseillé
1. `dev-engineer`: créer `apps/api` en suivant `docs/api` + `docs/db`
2. `web-builder`: consommer `packages/contracts` et `docs/api`
3. `qa-engineer`: bâtir jeux de tests sur les scénarios `register/login/wallet/deposit/borrow/dashboard`
