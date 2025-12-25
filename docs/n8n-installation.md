# Installation n8n — Smart Office

Ce guide decrit l'installation et l'import des workflows Smart Office
(goldens puis reels) dans n8n.

---

## Prerequis

- n8n recent (version stable)
- Acces aux credentials des outils (Slack, Gmail, Drive, etc.)
- Variables d'environnement pour n8n (si necessaire)

---

## Ordre d'import recommande

1) Importer les workflows golden
   - Ils servent de reference minimale
   - Pas de credentials obligatoires

2) Importer les workflows reels
   - tools/
   - triggers/
   - agent/
   - utils/
   - executor/ (si tu utilises la version exportee)

---

## Import dans n8n

1) Ouvrir n8n
2) Menu Workflows > Import from File
3) Importer les JSON depuis :
   - workflows/golden/
   - workflows/tools/
   - workflows/triggers/
   - workflows/agent/
   - workflows/utils/

---

## Credentials

- Associer les credentials a chaque workflow tool
- Garder les credentials hors Git
- Verifier que les nodes utilisent le bon credential name

---

## Verification rapide

- Executer un workflow golden (manuel)
- Executer un tool simple (ex: slack)
- Verifier l'enveloppe en sortie

---

## Bascule rapide Drive/Slack/Gmail

1) Connecter les credentials manquants : Slack (scopes chat:write, commands) et Gmail (send). Drive est deja parametre.
2) Importer les workflows reels : `workflows/drive_to_slack_notify.json` et `workflows/slack_drive_to_gmail.json`.
3) Renseigner `folder_id`, `channel_id` et `destinations` via variables globales ou dans les nodes Set initiaux (`use_mock` a `false`).
4) Lancer un smoke test :
   - Workflow Drive → Slack : declencher un ajout de fichier ou utiliser le trigger manuel avec un fichier de test.
   - Workflow Slack → Gmail : utiliser le slash command de test ou le trigger manuel.
5) Activer les triggers et verifier le fallback Gmail en simulant une erreur Slack (flag `use_mock` ou `continueOnFail`).

---

## Notes

- Les goldens sont des references, pas des workflows production
- Les workflows reels peuvent evoluer en fonction des APIs
