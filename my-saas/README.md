# my-saas — Minimal SaaS starter

Structure minimale pour un SaaS nommé `my-saas`.

Stacks:
- Backend: Node + Express
- Frontend: React + Vite
- Schéma: JSON (schema/schema.json)
- Containerisation: Docker (Dockerfiles) + docker-compose

Démarrage local (dev):
- Backend: cd backend && npm install && npm run start
- Frontend: cd frontend && npm install && npm run dev

Construction et conteneurs (prod):
- docker-compose build
- docker-compose up

Fichiers principaux:
- backend/: API Node/Express
- frontend/: App React (Vite)
- schema/schema.json: schéma JSON principal
- docker-compose.yml + Dockerfiles pour backend/frontend
