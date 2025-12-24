README — Utils / Envelope Normalize

But

Normaliser une envelope legacy ou execution vers un format execution
coherent pour l'executor et l'agent.

Utilisation

- Triggers : convertir un payload brut en execution envelope
- Agent : normaliser l'entree avant planification
- Executor : normaliser legacy -> execution

I/O (attendu)

- Input : legacy envelope ou execution envelope
- Output : execution envelope normalisee
