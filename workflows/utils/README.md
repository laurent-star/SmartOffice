README — Workflows Utils (Smart Office)

But

Les utils sont des helpers deterministes, sans effets de bord.
Ils factorisent des transformations communes.

Spec de reference : docs/utils-runtime.md

Statut

Arborescence proposee (README par util) :

- workflows/utils/envelope-normalize/README.md
- workflows/utils/envelope-validate/README.md
- workflows/utils/step-guards/README.md
- workflows/utils/step-expansion/README.md
- workflows/utils/policy-apply/README.md
- workflows/utils/tool-io-validate/README.md
- workflows/utils/error-mapping/README.md
- workflows/utils/payload-normalize/README.md
- workflows/utils/envelope-build-minimal/README.md

Regles

- Pas d'appels API externes.
- Pas de mutation d'etat hors payload.
- I/O JSON deterministe.

Utilisation des utils

- Appeles depuis triggers, agent ou executor
- Partage de logique commune (validation, mapping, normalisation)
