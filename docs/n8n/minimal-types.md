# Types minimaux de workflows n8n

Synthèse basée sur les contrats `/contracts`, les golden workflows (`workflows/golden/*`) et les limites de l'Executor. Les contrats distinguent déjà deux familles fortes :
- `workflow-trigger` impose un nœud de déclenchement spécifique (webhook/schedule/event).
- `workflow-tool` gère l'exécution d'une action avec un dispatch dédié.

L'Executor applique déjà le routage séquentiel, les `when/on_error` déclaratifs et la normalisation des enveloppes ; inutile de créer des types supplémentaires pour cela. On conserve donc **2 types obligatoires** et **2 patterns optionnels** pour rester utile sans multiplier les catégories.

## 1. Trigger (déclencheur)
Point d'entrée du workflow. Couvre les variantes webhook, scheduler ou événement externe. Un connecteur "canal" (ex. Slack) peut avoir un trigger dédié avec sa propre authentification.

## 2. Action / Tool
Invocation d'une opération métier (CRUD, notification, appel API). Chaque tool est lié à ses propres credentials et à des schémas d'entrée/sortie distincts de son éventuel trigger (ex. Slack trigger vs. Slack chat.postMessage).

## Patterns optionnels (seulement si besoin)
Les deux patterns suivants servent à **préparer ou sécuriser** les actions quand les contrats ou le payload ne suffisent pas. Ils ne créent pas de nouvelles catégories métier et doivent rester parcimonieux.

### A. Préparation de données
Validation, normalisation ou enrichissement nécessaires pour respecter les contrats (mapping, contrôle de types, nettoyage). À utiliser avant une action ou avant d'émettre une enveloppe depuis un trigger, uniquement si le payload brut ne respecte pas déjà le schéma attendu.

### B. Pilotage du flux
Branchement conditionnel, limitation des appels ou retries explicites **en plus** des politiques `when/on_error` déjà gérées par l'Executor. À réserver aux cas où le workflow doit rendre visible une règle de pilotage (par exemple, couper un flux après N tentatives ou router selon un attribut métier).

---

### Pourquoi ces 2 + 2 ?
- Les contrats et goldens ne requièrent explicitement que la séparation Trigger / Action ; le reste est déjà pris en charge par l'Executor (séquencement, politiques `when/on_error`, enveloppes).
- Les connecteurs peuvent être duals (un trigger et une action pour le même service) avec des authentifications distinctes : les garder dans des types séparés évite la confusion.
- Les patterns optionnels restent disponibles pour la lisibilité et la conformité aux contrats, sans devenir des catégories supplémentaires.
