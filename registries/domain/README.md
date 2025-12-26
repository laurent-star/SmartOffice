# Canonical domain definitions

This folder lists lightweight canonical schemas used by mapping files. Each schema captures the required fields and preferred types for Smart Office domains such as client, prospect, project, document and task.

Usage:
- Treat these definitions as the contract for mappings in `registries/mappings/`.
- Keep them minimal and stable; prefer additive changes to avoid breaking existing mappings.
- Align validations in workflows/capabilities with the required flags and enum lists declared here.
