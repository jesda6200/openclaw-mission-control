DEMO checklist — comment montrer le flux de prix en local

Objectif: montrer le flux de prix (insertion -> backend -> frontend chart)

Préparation:
1) Lancer infra: cd infra && docker-compose up --build
2) Initialiser le schema: docker exec -it $(docker-compose ps -q db) psql -U postgres -f /docker-entrypoint-initdb.d/01_create_schema.sql
3) Seed des symbols: node scripts/seed_symbols.js

Démonstration du flux:
A) Inserer une ligne de prix demo via script ingest_consumer_demo.js
   node scripts/ingest_consumer_demo.js
   -> Vérifier dans la DB: psql -U postgres -c "SELECT * FROM prices ORDER BY time DESC LIMIT 5;"

B) Appeler l'endpoint backend pour récupérer les derniers prix
   curl "http://localhost:4000/markets/latest?symbol=BTCUSDT"
   -> S'assurer de la réponse et des timestamps

C) Ouvrir le frontend (http://localhost:5173) et montrer le chart/refresh en temps réel
   - Si le frontend ne montre pas automatiquement, recharger et appeler l'endpoint depuis le navigateur console pour simuler l'arrivée de nouveaux points.

Notes et dépannage rapide:
- Si backend renvoie 500, regarder logs: docker logs <backend-container>
- Si DB not ready: vérifier healthcheck et logs du container db
- Si CORS problème: lancer frontend/local dev server (npm run dev) et backend local

