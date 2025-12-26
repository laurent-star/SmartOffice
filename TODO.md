# TODO — Wrappers (Capabilities)

Objectif: wrappers = capabilities "minces" qui appellent une capability atomique
avec un preset de paramètres (pas de logique métier).

## Emails

- `email.fetch.night`
  - base: `email.fetch`
  - preset: `since=night_start`, `until=morning_end`
- `email.fetch.last`
  - base: `email.fetch`
  - preset: `limit=x`, `order=desc`
- `email.fetch.next`
  - base: `email.fetch`
  - preset: `limit=x`, `order=asc`
- `email.fetch.window`
  - base: `email.fetch`
  - preset: `from=start`, `to=end`

## Calendar events

- `calendar.event.next`
  - base: `calendar.event.fetch`
  - preset: `from=now`, `limit=1`, `order=asc`
- `calendar.event.last`
  - base: `calendar.event.fetch`
  - preset: `to=now`, `limit=1`, `order=desc`
- `calendar.event.window`
  - base: `calendar.event.fetch`
  - preset: `from=start`, `to=end`
- `calendar.event.range`
  - base: `calendar.event.fetch`
  - preset: `from`, `to`, `limit`, `order`

## Documents

- `document.fetch.latest`
  - base: `document.fetch`
  - preset: `limit=1`, `order=desc`
- `document.fetch.window`
  - base: `document.fetch`
  - preset: `from=start`, `to=end`

## CRM / Sales

- `crm.client.fetch.last`
  - base: `crm.client.fetch`
  - preset: `limit=x`, `order=desc`
- `sales.lead.fetch.last`
  - base: `sales.lead.fetch`
  - preset: `limit=x`, `order=desc`

## Tasks

- `task.fetch.next`
  - base: `task.fetch`
  - preset: `from=now`, `limit=x`, `order=asc`
- `task.fetch.last`
  - base: `task.fetch`
  - preset: `to=now`, `limit=x`, `order=desc`

## Notes

- Tous les wrappers doivent rester deterministes.
- Les presets doivent etre documentes dans `docs/capabilities-runtime.md`.
- Si un wrapper est garde, l’atomique doit exister.
