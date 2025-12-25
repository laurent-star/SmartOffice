README — Registries (Smart Office)

But

Les registries sont des catalogues compiles a partir des configs.
Ils servent de source d'information pour l'executor.

Fichiers

- registries/tools.json
- registries/capabilities.json
- registries/usecases.json
- registries/n8n-official-ops.json
- registries/tool-categories.json

Regles

- Regenerer apres modification des configs
- Doivent rester coherents avec config/*
- Le référentiel n8n-official-ops définit les operations autorisées
- tool-categories.json est généré par scripts/generate_registries.js
- n8n-official-ops.json est une source de vérité manuelle (validée par scripts/validate_n8n_official_ops.js) qui est relue par les générateurs
  pour contrôler les actions des tools et produire les workflows
