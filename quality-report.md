# Quality Report — docker-compose runnable smoke check

Summary:
- I reviewed infra/docker-compose.yml and infra/env.example and inspected project scripts used for the smoke test (infra/init/01_create_schema.sql, scripts/ingest_consumer_demo.js).
- I attempted an automated smoke run without external network access but could not start required images (timescale/timescaledb, redis) because pulling those images requires network access. See details and manual alternative steps below.

1) Files coherence (infra/docker-compose.yml and env example)
- docker-compose.yml (infra/docker-compose.yml)
  - Services defined: db (timescale/timescaledb:latest-pg14), redis (redis:7-alpine), backend (build ../backend), frontend (build ../frontend).
  - Environment variables set in compose for backend: DATABASE_URL and REDIS_URL, pointing to db and redis services. Ports exposed: db 5432, redis 6379, backend 4000, frontend 5173.
  - Healthcheck for db uses pg_isready -U postgres (good).
  - depends_on used for backend and frontend (ok but note: depends_on doesn't wait for DB readiness beyond container start; healthchecks help but compose v3 depends_on doesn't support condition: service_healthy unless using v2.4–v3.4 extended syntax). In practise, startup ordering may require retry logic in the backend.

- infra/env.example
  - Provides matching examples for DATABASE_URL, REDIS_URL and PORT and aligns with docker-compose values.

- Missing top-level env.example
  - There is no env.example at repository root. The infra/env.example exists and appears to be the canonical example. Recommend adding a root-level env.example or documenting that infra/env.example is the authoritative one.

Verdict: coherence OK with a few recommendations (below).

2) Smoke verification (automated attempt)
- Goal: start services in development mode, run DB init script, run scripts/ingest_consumer_demo.js, then curl internal endpoint /markets/latest and expect HTTP 200.

Automated run result: NOT PERFORMED (blocked by external network requirement)
- Why: infra/docker-compose.yml references public images (timescale/timescaledb:latest-pg14 and redis:7-alpine). On a clean host these images are not available locally and docker-compose up will attempt to pull them from Docker Hub which requires network access.
- The validation environment for this task prohibited waiting for external network pulls. Because of that, I did not perform an actual docker-compose run.

What I did test locally in-repo:
- Inspected scripts/ingest_consumer_demo.js to confirm it connects to DATABASE_URL and REDIS_URL (works via environment or defaults to localhost). It inserts a demo row into a prices table — consistent with infra/init/01_create_schema.sql.
- Verified infra/init/01_create_schema.sql defines the expected prices table and hypertable creation; compatible with ingest_consumer_demo.js insert statement.

3) Recommended smoke run steps (manual or automated if network allowed)
If you allow network access (or have the images pre-pulled), use these steps to reproduce the smoke test exactly:

A — From repository root
1. cd infra
2. (Optional) Pre-pull images to avoid delays: docker pull timescale/timescaledb:latest-pg14 && docker pull redis:7-alpine
3. Start compose services in background:
   docker compose up -d --build
4. Wait for DB to be ready. You can poll the healthcheck or run:
   docker compose ps
   docker logs <db-container> -f
   or use: docker exec -it <db-container> pg_isready -U postgres
5. Initialize DB schema (two options):
   a) Run SQL inside container: docker exec -i <db-container> psql -U postgres -d postgres -f /path/to/01_create_schema.sql
      - Note: you may need to copy the SQL into the container or mount infra/init into the db service in compose. The current compose does not mount infra/init; so the recommended manual approach is:
         docker cp infra/init/01_create_schema.sql <db-container>:/tmp/01_create_schema.sql
         docker exec -it <db-container> psql -U postgres -d postgres -f /tmp/01_create_schema.sql
   b) Or run psql from host against forwarded port 5432: psql postgres://postgres:postgres@localhost:5432/postgres -f infra/init/01_create_schema.sql

6. Run demo ingest consumer to insert a test price row:
   - Option 1: Run inside backend container: docker compose exec backend node /path/to/scripts/ingest_consumer_demo.js
     (ensure script exists inside image or mount scripts directory into backend service)
   - Option 2: Run locally (requires node installed) with environment variables:
       export DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres
       export REDIS_URL=redis://localhost:6379
       node scripts/ingest_consumer_demo.js

7. Perform an internal curl against backend endpoint:
   curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/markets/latest
   Expect: 200

B — Alternatives to avoid external pulls (offline-friendly)
- Option 1: Use local installed services (Postgres and Redis) on host and run backend locally (node) pointed at those services. Steps:
   - Install PostgreSQL 14+ and Redis locally
   - Create database and user as in env (postgres/postgres)
   - Apply infra/init/01_create_schema.sql
   - Run backend locally: cd backend && npm install && DATABASE_URL=... REDIS_URL=... npm run start:dev
   - Run scripts/ingest_consumer_demo.js locally (as above)
   - Curl /markets/latest on localhost:4000

- Option 2: Vendor required images into local machine in advance (docker save on another machine, docker load here).

4) Warnings and suggested fixes
- Compose health/wait: docker-compose v3 depends_on does not wait for db to be fully ready; consider adding a wait-for script in backend start or use compose v2.4 condition: service_healthy (if your compose version supports it) or use a small entrypoint script that retries DB connection before starting the app.
- Mounting DB init SQL: currently infra/init SQL is not mounted into the db container by compose. Add a volume or a docker-entrypoint-initdb.d mount so the DB container initializes automatically:
  services.db:
    volumes:
      - db_data:/var/lib/postgresql/data
      - ./init:/docker-entrypoint-initdb.d
  This will let Postgres run the SQL on container creation (works for official Postgres, verify for timescaledb image).
- env.example placement: either add root-level env.example or reference infra/env.example clearly in README.
- Image tags: avoid using floating :latest for production. Pin to a specific timescale image tag (e.g., timescale/timescaledb:2.x-pg14) to improve reproducibility.

5) Minimal corrections recommended (patch suggestions)
- Modify infra/docker-compose.yml to mount infra/init into DB so schema initializes automatically (example patch shown in full report file attached as suggestion).
- Add a note in README explaining how to run smoke tests and where env.example is.

6) Files I inspected
- infra/docker-compose.yml
- infra/env.example
- infra/init/01_create_schema.sql
- scripts/ingest_consumer_demo.js
- repository layout (backend/, frontend/, scripts/)

7) Limitations of this check
- I did not start containers because pulling images requires external network. If you can allow image pulls or pre-load images, I can re-run the smoke verification automatically and produce logs and exact exit codes.

If you'd like, I can now:
- A) Attempt an automated smoke test (this will pull images from Docker Hub). I will show the exact docker-compose commands that will be run and request approval if needed.
- B) Generate the suggested docker-compose patch (mount init SQL and add health checks) as a git patch or edit file directly.

---

Appendix — Suggested docker-compose snippet (example) to auto-run DB init and use service health checks:

services:
  db:
    image: timescale/timescaledb:latest-pg14
    environment:
      POSTGRES_PASSWORD: postgres
    volumes:
      - db_data:/var/lib/postgresql/data
      - ./init:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL","pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

Notes: placing SQL files under ./init will let the container initialize schema on first run. Confirm compatibility with the timescaledb image (it is a Postgres variant; it usually supports docker-entrypoint-initdb.d).

---

Report prepared by: quality-validator (subagent)

Timestamp: 2026-03-25 00:16 GMT+1
