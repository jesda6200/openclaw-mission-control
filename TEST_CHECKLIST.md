# TEST_CHECKLIST

## Automatique disponible maintenant
- [ ] `cd backend && npm test`
- [ ] `cd backend && node --test test/health.test.js`
- [ ] `node scripts/qa/architecture-readiness.mjs`
- [ ] `API_BASE_URL=http://127.0.0.1:3000/api/v1 node scripts/qa/api-auth-smoke.mjs`

## Validation infra / Docker
- [ ] `docker compose -f infra/docker-compose.yml up --build`
- [ ] backend healthy via `/api/v1/health`
- [ ] frontend accessible
- [ ] variables d’environnement documentées et cohérentes

## À valider dès que les features arrivent
- [ ] auth wallet Metamask (challenge, signature, anti-replay)
- [ ] dépôt simulé
- [ ] emprunt simulé
- [ ] remboursement simulé
- [ ] retrait simulé
- [ ] dashboard: cohérence supplied / borrowed / APY / health factor
- [ ] tests e2e navigateur sur frontend final (Next.js + Tailwind)
