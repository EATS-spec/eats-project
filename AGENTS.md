# Agent Notes (Repo Root)

This repository is a lightweight wrapper around two separate projects:

- `eats-frontend/` — Next.js frontend (Node 20)
- `sanity/` — Sanity Studio CMS (Node 20)

## Day-to-day commands (from repo root)

Use the root `package.json` scripts to run checks without remembering per-project commands:

- `npm run dev` — start both frontend + studio (two processes)
- `npm run lint` — lint both projects
- `npm run type-check` — type-check both projects
- `npm run build` — build both projects
- `npm run check` — lint + type-check + build

You can also run per-project commands:

- `npm run dev:frontend`, `npm run dev:sanity`
- `npm run lint:frontend`, `npm run lint:sanity`

## Local setup

- Install deps per project (no root install needed):
  - `npm --prefix eats-frontend install`
  - `npm --prefix sanity install`

## Repo hygiene

- Prefer minimal, targeted diffs; avoid touching lockfiles unless required.
- Formatting is enforced via Prettier + `.editorconfig`.

