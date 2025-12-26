# PLAN — Mapping Onboarding Hardening (single PR)

Objectif
- Finaliser l’expérience d’onboarding “mappings” en verrouillant la qualité via CI + tests,
  en ajoutant des samples JSON versionnés, en rendant le lint utilisable en interactif,
  et en fournissant des checklists par source.

Contrainte
- Tout livrer dans UNE SEULE PR.
- Ne pas casser le mode lint non-interactif existant.
- Pas de secrets/IDs réels dans les samples.

Périmètre des tâches (issues internes)
1) CI lint automatique des mappings
2) Samples JSON pour lint interactif
3) Tests unitaires mapping runtime
4) Lint interactif avec complétion des mappings
5) Checklists d’onboarding par source (Monday/Drive/Slack/Gmail/Google Calendar/Google Docs/Google Sheets/Axonaut/Brevo)

Arborescence cible (proposition)
- scripts/
  - mapping_lint.js                     (existant, à étendre)
  - mapping_lint_interactive.js         (optionnel si séparation utile)
- mappings/
  - <domain>/*.json                     (existant)
- samples/
  - monday/
    - payload.example.json
  - drive/
    - payload.example.json
  - slack/
    - payload.example.json
  - gmail/
    - payload.example.json
  - google-calendar/
    - payload.example.json
  - google-docs/
    - payload.example.json
  - google-sheets/
    - payload.example.json
  - axonaut/
    - payload.example.json
  - brevo/
    - payload.example.json
- docs/
  - onboarding/
    - monday.checklist.md
    - drive.checklist.md
    - slack.checklist.md
    - gmail.checklist.md
    - google-calendar.checklist.md
    - google-docs.checklist.md
    - google-sheets.checklist.md
    - axonaut.checklist.md
    - brevo.checklist.md
    - mappings.md                        (si doc centrale)
- tests/
  - mapping/
    - mapping_runtime.test.js            (ou __tests__/ selon stack)
- .github/workflows/
  - mapping-lint.yml                     (nouveau ou extension CI)

Exigences fonctionnelles détaillées

(1) CI lint automatique des mappings
- Ajouter un workflow GitHub Actions qui :
  - s’exécute sur pull_request (et idéalement push sur main).
  - installe deps (npm ci / pnpm i selon repo).
  - exécute : node scripts/mapping_lint.js --ci
  - itère sur tous les mapping domains trouvés dans /mappings (ou le chemin réel du repo).
- Le mode --ci doit:
  - retourner exit code != 0 si erreurs.
  - produire une sortie lisible (liste des mappings en erreur + raisons).

(2) Samples JSON versionnés
- Ajouter des payloads exemples MINIMAUX mais réalistes pour:
  - Monday
  - Google Drive
  - Slack
  - Gmail
  - Google Calendar
  - Google Docs
  - Google Sheets
  - Axonaut
  - Brevo
- But : permettre un “dry-run” du lint / mapping sur un input connu.
- Aucun identifiant réel : utiliser des valeurs fictives.

(3) Tests unitaires mapping runtime
- Ajouter tests pour:
  - mapPayloadToDomain (ou équivalent)
  - convertisseurs (date/number/bool/string templates)
  - validateurs/détecteurs (champs requis, target inconnue)
- Au minimum:
  - 1 test “happy path” par source
  - 1 test “required missing”
  - 1 test “unknown target”
- Ajouter script npm si manquant: "test" et/ou "test:mapping".

(4) Mode interactif pour combler les champs manquants
- Étendre le CLI lint pour accepter :
  - --interactive (ou -i)
  - quand un champ requis n’est pas mappé :
    - proposer une liste de cibles possibles (issues du domaine)
    - permettre de saisir une correspondance (sourcePath -> targetField)
    - écrire la mise à jour dans le fichier de mapping (ou générer un patch) AVANT de sortir
- Doit fonctionner aussi en non-interactif (comportement actuel conservé).
- En CI, l’interactif doit être désactivé par défaut.

(5) Checklists par source
- Ajouter des checklists Markdown (Monday/Drive/Slack/Gmail/Google Calendar/Google Docs/Google Sheets/Axonaut/Brevo) décrivant:
  - Pré-requis opérateur
  - Champs attendus / IDs / colonnes
  - Conventions de mapping (ex: date formats, enums, null handling)
  - Commandes à exécuter (lint, dry-run)
  - Erreurs fréquentes + correctifs

Acceptance criteria (DoD)
- Une PR unique contenant:
  - workflow CI opérationnel (mapping lint)
  - samples présents et documentés
  - tests unitaires verts en local + CI
  - lint interactif utilisable (manuel) + CI stable
  - docs checklists ajoutées
- README / docs mis à jour pour pointer vers:
  - commandes lint
  - chemin des samples
  - checklists

Guidelines d’implémentation
- Préférer changements incrémentaux et lisibles.
- Pas de refactor massif si non nécessaire.
- Ajouter des logs utiles (sans bruit excessif).
- Respecter conventions du repo (format, lint, test runner).

Plan d’exécution (ordre)
1) Scanner le repo: structure, scripts existants, runner tests, conventions.
2) Ajouter samples + doc minimale.
3) Ajouter tests (et config runner si besoin).
4) Étendre mapping_lint.js : mode --ci + sorties + codes retour.
5) Ajouter workflow GitHub Actions.
6) Ajouter mode --interactive (inquirer/readline) + écriture patch mapping.
7) Ajouter checklists par source.
8) Mise à jour docs centrale + validation finale (lint + tests).

Notes
- Si le repo utilise pnpm/yarn, adapter toutes les commandes CI.
- Si les mappings ne sont pas dans /mappings, détecter et ajuster.
