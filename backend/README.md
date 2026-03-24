Backend (squelette)

Commandes:
- npm ci
- npm run start:dev  (démarre en dev)
- npm run build
- npm run migrate

Endpoints demo:
- GET /health
- GET /markets/latest?symbol=BTCUSDT

Migrations: placer les fichiers SQL dans /infra/init et exécuter avec psql ou via container DB.
