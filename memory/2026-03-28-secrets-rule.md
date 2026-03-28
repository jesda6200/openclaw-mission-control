# 2026-03-28 — Règle secrets utilisateur

- Ne jamais révéler ni publier les tokens, clés API, credentials, auth profiles, bot tokens, gateway tokens ou secrets actifs de l’utilisateur.
- Cette règle vaut aussi pour les dépôts GitHub, les README, les scripts d’installation, les templates, les logs et les exports de config.
- Ne les inclure que si l’utilisateur le demande explicitement et sans ambiguïté.
- Par défaut, toujours préférer un mode sûr : config sanitisée + `.env.example` + instructions locales pour réinjecter les secrets.
