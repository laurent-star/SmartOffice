README — Config Tools (Smart Office)

But

Definir les tools utilisables par l'executor et leurs actions attendues.

Schemas

- contracts/tool-definition.schema.json
- contracts/tool-input.schema.json
- contracts/tool-result.schema.json

Contenu

Chaque tool definit :
- id, version, description
- categories (types fonctionnels)
- actions[].name (operation)
- actions[].input (cles attendues dans params)
- actions[].output (cle principale retournee)

Ces definitions alimentent :
- registries/tools.json

Catalogue :
- [docs/tools-catalog.md](docs/tools-catalog.md)
