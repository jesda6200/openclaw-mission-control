Livrable: Documentation et scripts pour deux modes d'exécution

Ce dépôt contient désormais :

- RUN_MODES.md — documentation détaillée des deux modes d'exécution (production et fallback/local).
- scripts/ — scripts d'aide pour le mode fallback : seed DB, smoke_local, et utilitaires SQLite.

Objectif : permettre d'exécuter le projet en production (Docker + cloud) ou en mode secours local sans réseau en utilisant une base SQLite et scripts de seed.
