README — Workflows Utils (Smart Office)

But

Les utils sont des helpers deterministes, sans effets de bord.
Ils factorisent des transformations communes.

Spec de reference : docs/utils-runtime.md

Statut

Aucun workflow utilitaire n'est defini pour le moment.

Regles

- Pas d'appels API externes.
- Pas de mutation d'etat hors payload.
- I/O JSON deterministe.
