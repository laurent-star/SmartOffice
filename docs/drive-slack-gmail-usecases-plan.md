# Plan d'implémentation : use cases Drive ↔ Slack ↔ Gmail

## Plan d'action nocturne (itératif, vérifié, effort minimal en prod)
Objectif : préparer des workflows prêts à importer, avec mocks pour toutes les dépendances non disponibles et un seul geste à faire demain matin/soir : connecter Slack + Gmail dans n8n (Drive est déjà prêt) et lancer les smoke tests.

1) **Cadre & alignement (30 min)**
   - Vérifier l'état actuel : `docs/status-auto.md` (inventaire), contenus de `config/tools/*.tool.json` (Drive déjà ok), présence des capacités `summarize_content` / `notify_user`.
   - Sortie : checklist des fichiers manquants + mapping des credentials à connecter demain (Slack, Gmail uniquement).
   - Vérification : aucun diff inattendu sur `node_modules` (reset si besoin), conformité des schémas `formats/*.json` (ajv --validate).

2) **Contrats + schémas prêts (45 min)** — **ordre inverse : contrats → schémas → goldens**
   - **Contrats (d'abord)** :
     - Créer/mettre à jour `config/use-cases/drive_to_slack_notify.usecase.json` (entrées : folder_id, channel_id, emails_fallback; sorties : slack_message_ts, gmail_status).
     - Créer/mettre à jour `config/use-cases/slack_drive_to_gmail.usecase.json` (entrées : commande, doc_id/requête, destinataires; sorties : slack_ack_ts, gmail_message_id).
     - Régénérer `registries/usecases.json` (et `registries/capabilities.json` seulement si nouvelle capacité ajoutée).
     - Vérifications : AJV sur `formats/usecase.json`, contrôle manuel du champ `depends_on` (tools/capabilities) pour garantir qu'aucun credential implicite n'est oublié.
   - **Schémas (ensuite)** : relire `formats/envelope.json`, `step.json`, `tool-input/result.json` et s'assurer qu'ils couvrent les besoins des deux use cases sans ajouter de logique procédurale.

3) **Goldens prêts à importer (1 h)** — **but : zéro dépendance aux credentials**
   - Produire/compléter les 2 workflows golden avec mocks (déclaratif uniquement, compatible workflow executor) :
     - `workflows/golden/drive_to_slack_notify.json` (succès + branche fallback Gmail simulée).
     - `workflows/golden/slack_request_drive_to_gmail.json` (requête Slack simulée → Drive mock → Gmail mock).
   - Injections de données statiques (IDs Drive factices, message Slack simulé, statut Gmail simulé) pour rendre les I/O déterministes; aucune référence credential.
   - Vérifications :
     - Validation `formats/envelope.json` + `step.json` + `tool-input/result.json` via AJV.
     - Import n8n en local avec sandbox/mocks pour s'assurer qu'aucun credential n'est requis et que tous les tools sont fonctionnels hors credentials.
   - Sorties : fichiers golden + note rapide dans `docs/status-auto.md` si inventaire change.

4) **Workflows réels prêts-prod (1 h 30)** — **but : un seul geste credential demain**
   - Dupliquer les goldens vers versions réelles en switchant les nodes mocks par les vrais nodes Drive/Slack/Gmail (Drive déjà crédentielé) ; maintenir un flag `use_mock=false` pour désactiver/activer facilement.
   - Préparer deux exports n8n sans credentials :
     - `workflows/drive_to_slack_notify.json`
     - `workflows/slack_drive_to_gmail.json`
   - Vérifications :
     - Import n8n avec variables d'env vides pour confirmer que seules 2 connexions manquent (Slack, Gmail).
     - Simulation d'erreur Slack pour valider la branche fallback Gmail.
     - Journalisation minimale (log node / set) pour tracer les IDs et erreurs.

5) **Prêt pour bascule prod (30 min)** — **but : « brancher et rouler »**
   - Préparer un runbook ultra-court dans `docs/n8n-installation.md` (section « Bascule rapide Drive/Slack/Gmail ») :
     1) Connecter Slack (scopes : chat:write, commands) et Gmail (send). 2) Importer les deux workflows réels. 3) Renseigner `folder_id`, `channel_id`, `destinataires` dans les variables globales ou credentials. 4) Lancer smoke test (fichier test dans le dossier, slash command de test). 5) Activer les triggers.
   - Vérifications : check-list à cocher (tests OK, aucun secret en clair, dossiers/canaux corrects, fallback Gmail testé).

6) **Boucle d'ajustement asynchrone**
   - Après chaque étape, consigner l'état dans `docs/status-auto.md` + tickets si blocage.
   - Si une étape échoue (ex : validation AJV), corriger puis relancer la vérif avant de passer à l'étape suivante.
   - Possibilité de replanifier : si les workflows réels prennent plus de temps, prioriser la complétion goldens + configs + registries ce soir, puis n8n réel demain avec les credentials.

## Principes et périmètre
- Utiliser les outils existants (`config/tools/gmail.tool.json`, `google-drive.tool.json`, `slack.tool.json`, `google-docs.tool.json`, `openai.tool.json`) et les capacités déjà définies (`config/capabilities/summarize_content.capability.json`, `notify_user.capability.json`) comme briques principales.
- Produire des workflows **golden** (référence sans credentials, I/O déterministes) puis les workflows réels prêts à l’import n8n.
- Générer pour chaque use case son fichier `config/use-cases/*.usecase.json`, puis mettre à jour `registries/usecases.json` et, si de nouveaux outils/capacités sont nécessaires, régénérer les registries associées.
- Aucun workflow « use case » procédural : uniquement des descriptions déclaratives compatibles avec le workflow executor ; les tools doivent être utilisables immédiatement hors credentials.
- Valider systématiquement via les schémas `formats/` (AJV) et une smoke test n8n (import + exécution sur sandbox).

## Use case 1 : Publication de document Drive vers Slack avec résumé et notification Gmail de secours
**Objectif** : lorsqu’un fichier est ajouté dans un dossier Drive projet, publier un message Slack avec lien + résumé concis, et envoyer un e-mail Gmail si la publication échoue ou pour notifier les parties prenantes hors Slack.

### Dépendances amont
- **Triggers** : watch Google Drive (fichier ajouté dans un dossier dédié) → événement `file_added`.
- **Outils** :
  - `google-drive` pour récupérer métadonnées et lien partageable.
  - `google-docs` ou `openai` (embedding/text) pour extraire texte et générer un résumé (réutiliser `summarize_content`).
  - `slack` pour publier dans le canal cible.
  - `gmail` pour envoyer l’alerte de secours (ou la notification complémentaire).
- **Capacités** :
  - `summarize_content` (extraction + résumé),
  - `notify_user` (support Slack + e-mail),
  - éventuellement une capacité fine « publier_document » si besoin d’un contrat dédié.

### Flux et artefacts à produire
1. **Golden workflow** : séquence déterministe utilisant des mocks (id de fichier, contenu statique, succès/échec Slack simulé) pour valider la logique (Drive → résumé → Slack → fallback Gmail). Fichier cible : `workflows/golden/drive_to_slack_notify.json`.
2. **Workflow réel n8n** :
   - Trigger Drive → extraction contenu → appel capacité `summarize_content` → publication Slack → branche de fallback vers Gmail en cas d’erreur.
   - Gestion des métadonnées (titre, URL partageable) et contrôle du périmètre (seulement le dossier projet).
   - Export sans credentials.
3. **Config use case** : `config/use-cases/drive_to_slack_notify.usecase.json` décrivant inputs (folder ID, channel Slack, liste mails), outputs (message Slack ID, status envoi Gmail), dépendances (tools/capabilities) et SLA.
4. **Registries** : mise à jour `registries/usecases.json` et, si ajout de capacité dédiée, `registries/capabilities.json`.
5. **QA** : validation AJV sur `formats/usecase.json`, test d’import n8n, smoke test avec sandbox Drive/Slack/Gmail.

## Use case 2 : Demande Slack → récupération Drive → diffusion par Gmail
**Objectif** : depuis Slack (slash command ou bouton), récupérer un document Drive demandé, le vérifier (dossier autorisé) puis l’envoyer par e-mail Gmail aux destinataires spécifiés, avec traçabilité dans Slack.

### Dépendances amont
- **Triggers** : commande Slash ou interaction Slack → événement `document_request`.
- **Outils** :
  - `slack` pour capter la commande et poster le statut retour.
  - `google-drive` pour rechercher et générer un lien partageable ou télécharger le fichier.
  - `gmail` pour envoyer le document aux destinataires.
  - Optionnel : `google-docs` pour convertir/normaliser le format avant envoi.
- **Capacités** :
  - `notify_user` pour le feedback Slack,
  - nouvelle capacité « servir_document_drive » si un contrat spécifique est requis (vérification d’autorisations, formatage du message d’envoi).

### Flux et artefacts à produire
1. **Golden workflow** : mock de requête Slack avec document id prédéfini → récupération Drive simulée → envoi Gmail simulé → retour Slack. Fichier cible : `workflows/golden/slack_request_drive_to_gmail.json`.
2. **Workflow réel n8n** :
   - Trigger Slack (slash/interaction) → validation du dossier autorisé → récupération lien ou fichier → envoi via Gmail → confirmation dans Slack avec statut (succès/échec).
   - Journalisation minimale (thread Slack ou note interne) pour le suivi.
3. **Config use case** : `config/use-cases/slack_drive_to_gmail.usecase.json` décrivant inputs (commande, doc ID ou requête, destinataires), outputs (message Slack, email messageId), et dépendances.
4. **Registries** : ajout à `registries/usecases.json` et éventuelle capacité dédiée à `registries/capabilities.json`.
5. **QA** : validation AJV sur `formats/usecase.json`, import n8n, smoke test avec sandbox Slack/Drive/Gmail.

## Checklist transverses
- **Schémas** : s’assurer que les nouveaux fichiers respectent `formats/usecase.json` et, pour les workflows, la structure `envelope.json` + `step.json` + `tool-input/result.json`.
- **Sécurité** : aucune donnée sensible hardcodée; prévoir des placeholders/credentials n8n séparés.
- **Nommage** : aligner noms de fichiers, IDs d’instance et labels internes avec les conventions existantes (snake_case pour fichiers, kebab-case pour ids de workflow si applicable).
- **Docs** : mettre à jour `docs/golden-workflows.md` et `docs/status-auto.md` si l’inventaire change, et ajouter la marche à suivre dans `docs/n8n-installation.md` pour l’import de ces deux workflows.
