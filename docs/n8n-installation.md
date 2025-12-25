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

## Notes

- Les goldens sont des references, pas des workflows production
- Les workflows reels peuvent evoluer en fonction des APIs
