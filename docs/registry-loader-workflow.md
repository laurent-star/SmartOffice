# Workflow — Registry Loader (`so.trigger.registry-loader`)

## But

Charger les registries Smart Office depuis Google Drive quand elles sont disponibles et
fournir automatiquement un fallback local (`registries/*.json`) lorsque Drive n'est pas
configuré ou renvoie un binaire vide. Le workflow produit une enveloppe d'exécution
prête pour l'Executor avec `payload.registryFiles` et un `payload.options.fallbackRegistry`.

## Entrées

- Variables d'environnement Google Drive (optionnelles) :
  - `REGISTRY_TOOLS_FILE_ID`
  - `REGISTRY_CAPABILITIES_FILE_ID`
  - `REGISTRY_USECASES_FILE_ID`
- Aucune donnée d'entrée n'est requise sur le trigger manuel.

## Étapes principales

1. **Download Tools/Capabilities/Usecases Registry** (`n8n-nodes-base.googleDrive`) —
   chaque node tente le téléchargement via l'ID Drive correspondant si présent et
   continue même en cas d'absence ou d'échec.
2. **Parse Tools/Capabilities/Usecases Registry** (`n8n-nodes-base.code`) —
   parse le contenu téléchargé lorsqu'il existe, sinon laisse le registre à `null`
   pour activer le fallback.
3. **Merge Registries A/B** (`n8n-nodes-base.merge`) — assemble les registres en un
   seul item en conservant tools, capabilities et usecases.
4. **Build Execution Envelope** (`n8n-nodes-base.code`) — construit l'enveloppe avec :
   - `payload.registryFiles` rempli par les JSON Drive ou, à défaut, par les fichiers
     locaux `registries/tools.json`, `registries/capabilities.json`, `registries/usecases.json`.
   - `payload.options.fallbackRegistry` qui véhicule la même copie locale pour
     sécuriser l'Executor si aucun binaire Drive n'est disponible.
   - `payload.memory` minimal (`session_id`, `state`, `stack`).
   - Un `header` complet (`id`, `version`, `timestamp`, `source`, `destination`, `type`).

## Sortie

Une enveloppe d'exécution contenant uniquement les registres et la mémoire par défaut,
sans steps planifiés. Le workflow est destiné à être enchaîné directement avec
l'Executor.
