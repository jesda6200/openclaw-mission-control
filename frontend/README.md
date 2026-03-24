Frontend (squelette)

Prerequis:
- Node.js 18+ and npm

Installation & run (local dev):
1) Installer deps
   npm ci

2) Démarrer en dev
   npm run dev

3) Build
   npm run build

Notes for local dev:
- Le frontend attend l'API backend sur le même hôte (par défaut http://localhost:4000). Si vous lancez backend via docker-compose assurez-vous que le proxy ou CORS est configuré pour permettre l'accès.
- Pour demo rapide: lancer infra/docker-compose.yml puis npm run dev ici.
