README — Config Use cases (Smart Office)

But

Definir des scenarios metier composes de capabilities.
Chaque use case declare ses inputs et outputs attendus.

Schema

- contracts/usecase.schema.json

Contenu

- inputs : champs requis (input/context/memory)
- outputs : champs produits (memory)
- steps : liste ordonnee de steps (avec `params` obligatoire, meme vide)

Ces definitions alimentent :
- registries/usecases.json
