# Real Agent Architecture (frozen)

## Frozen production tree
- `main` (orchestrateur)
  - `intent-analyzer`
  - `strategy-engine`
  - `task-graph-builder`
  - `dispatcher`
  - worker-pool:
    - `dev-engineer`
    - `web-builder`
    - `backend-architect`
    - `data-analyst`
    - `devops-engineer`
    - `automation-engineer`
    - `qa-engineer`
    - `research-agent`
  - `validator`
  - `feedback-loop`
  - `memory-manager`

## Frozen role definitions
- `main` → orchestrateur global, responsable de la livraison finale
- `intent-analyzer` → compréhension fine de la demande
- `strategy-engine` → choix de la stratégie globale
- `task-graph-builder` → construction du graphe de tâches
- `dispatcher` → distribution et synchronisation
- `validator` → validation globale / QA de sortie
- `feedback-loop` → corrections itératives
- `memory-manager` → continuité et mémoire utile

## Core rules
1. No fake agent IDs.
2. Every delegation must target an exact real OpenClaw agent.
3. Complex work flows through: intent -> strategy -> graph -> dispatch -> validate -> feedback -> deliver.
4. Specialist implementation stays inside the worker-pool.
5. `main` coordinates; it should not do specialist execution when a worker exists.

## Example flow: create API
1. `intent-analyzer`
2. `strategy-engine`
3. `task-graph-builder`
4. `dispatcher`
5. `backend-architect`
6. `dev-engineer`
7. `qa-engineer`
8. `validator`
9. `feedback-loop` if needed
10. final delivery by `main`
