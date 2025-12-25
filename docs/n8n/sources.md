# Sources n8n (Smart Office)

## Règles

- La seule source autorisée pour l'extraction des opérations n8n est le dossier `docs/n8n/raw`.
- Les fichiers contenus doivent décrire les opérations officielles pour chaque provider. Toute information manquante ou ambiguë doit entraîner un échec explicite des scripts de génération.
- Aucun autre support (URLs externes, fragments hérités, documentation hors du dépôt) ne doit être utilisé pour générer les opérations.
- Les scripts de validation et de génération doivent échouer si une opération ne peut pas être dérivée de ces sources.
