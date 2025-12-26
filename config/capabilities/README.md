README — Config Capabilities (Smart Office)

But

Definir des sequences de steps reutilisables et atomiques.
Chaque capability declare ses inputs et outputs attendus.

Schema

- contracts/capability.schema.json

Contenu

- inputs : champs requis (input/context/memory) — obligatoire
- outputs : champs produits (memory) — obligatoire
- steps : liste ordonnee de steps (avec `params` obligatoire, meme vide)

Ces definitions alimentent :
- registries/capabilities.json

Convention de nommage :
- `domain.resource.action`
- Exemple : `email.message.fetch`
