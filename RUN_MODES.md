RUN_MODES — Modes d'exécution

Résumé

Le projet supporte deux modes d'exécution :

1) Mode production
   - Ciblé pour déploiements Docker / cloud (Kubernetes, ECS, App Engine...).
   - Déjà documenté ailleurs (Dockerfile, docker-compose.yml, manifests/). Ici : rappel des commandes usuelles.

2) Mode fallback (local, hors réseau)
   - Pour exécuter l'application localement sans dépendances réseau externes.
   - Utilise SQLite comme stockage local de substitution.
   - Fournit scripts pour seed (peupler) la base et un script smoke_local pour test rapide des endpoints.


1) Mode production — commandes types

- Construire l'image Docker :

  docker build -t myapp:latest .

- Démarrer via docker-compose (exemple) :

  docker-compose up -d --build

- Vérifier logs :

  docker-compose logs -f

- Déployer sur le cloud : suivez les manifests/ et les playbooks fournis par ops/ (ou la CI).

Endpoints de vérification (exemples)
- GET /healthz -> 200 + {"status":"ok"}
- GET /metrics -> Prometheus metrics
- GET /api/v1/status -> 200 + état de l'application


2) Mode fallback — pas à pas pour exécuter localement sans réseau

But: le projet est conçu pour être indépendant—si vous avez besoin d'un mode offline, suivez ces étapes.

Prérequis
- Git
- Node.js (ou runtime du projet) — version indiquée dans package.json
- SQLite3 CLI (optionnel, utile pour inspection)
- Bash (ou PowerShell sur Windows)

Fichiers et scripts ajoutés
- scripts/seed_sqlite.sh — crée la base SQLite et insère données de seed
- scripts/smoke_local.sh — démarre l'app en mode local et appelle endpoints de vérification
- scripts/README.md — expliquant l'usage des scripts

Installer et préparer

1. Installer dépendances :

   npm install

2. Initialiser la base SQLite locale (fichier: data/dev.sqlite) :

   chmod +x scripts/seed_sqlite.sh
   ./scripts/seed_sqlite.sh data/dev.sqlite

Contenu type de seed_sqlite.sh :
- crée le dossier data/
- crée ou écrase data/dev.sqlite
- applique le schéma SQL (scripts/schema.sql)
- insère jeux de données minimal pour tester

Démarrer l'application en mode fallback

1. Variables d'environnement importantes :

   export NODE_ENV=development
   export DATABASE_URL=sqlite://$(pwd)/data/dev.sqlite
   export OFFLINE_FALLBACK=true

2. Lancer l'app localement (exemple Node.js) :

   npm run start:local

Le script start:local doit être défini dans package.json pour utiliser la configuration SQLite locale.

Smoke test local (script fourni)

Rendre exécutable puis exécuter :

  chmod +x scripts/smoke_local.sh
  ./scripts/smoke_local.sh http://localhost:3000

Que fait smoke_local.sh ?
- attend que le port 3000 soit ouvert
- appelle les endpoints : /healthz, /api/v1/status, /api/v1/items (ou endpoints pertinents)
- vérifie codes HTTP et petits checks JSON
- retourne 0 si tout est OK, sinon non-zero

Exemples de commandes de vérification manuelle

- Vérifier la base SQLite :

  sqlite3 data/dev.sqlite "SELECT count(*) FROM users;"

- Curl des endpoints :

  curl -sS http://localhost:3000/healthz | jq
  curl -sS http://localhost:3000/api/v1/status | jq

Notes d'implémentation pour les développeurs

- Abstraction de la DB : l'application doit respecter une variable d'environnement DATABASE_URL et supporter les URI SQLite (sqlite:///path). Si votre ORM n'accepte pas exactement ce format, adaptez la config (ex: type: "sqlite", database: process.env.SQLITE_PATH).

- Mode fallback doit éviter les appels aux services externes (SMTP, SSO, cloud storage). Introduire des adaptateurs locaux (fichiers ou noop) activés par OFFLINE_FALLBACK=true.

- Les seed scripts insèrent des données minimales et non sensibles — utilitaires de test seulement.

Checklist avant commit
- Ajouter scripts dans scripts/
- Mettre à jour package.json start:local si nécessaire
- Documenter changements dans RUN_MODES.md


Support & dépannage

- Si smoke_local.sh échoue, vérifier :
  - l'application a démarré et écoute le port indiqué
  - DATABASE_URL pointe vers le fichier SQLite créé
  - permissions du dossier data/


Fin de RUN_MODES.md
