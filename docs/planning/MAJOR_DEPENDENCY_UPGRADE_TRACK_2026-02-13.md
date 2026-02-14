# Major Dependency Upgrade Track (2026-02-13)

## Summary
Production is currently stable after the dependency security batch and health endpoint hardening:
- Frontend and Sanity audits are both at 0 vulnerabilities.
- Production `/api/health` is `200 healthy` with Redis reported as `skipped` when optional.

This document defines a separate, low-risk path for major-version upgrades so production stabilization and feature work can continue without being blocked by framework migrations.

## Scope and Guardrails
- Scope: major-version dependency upgrades only.
- Out of scope: feature development, visual redesigns, and schema/content-model changes not required by dependency upgrades.
- Guardrails:
  - Use isolated branches per batch.
  - Merge only after green local checks and a successful isolated Vercel deploy.
  - Keep rollback simple by merging one batch at a time.

## Current Major Gaps (Snapshot)

### Frontend (`eats-frontend`)
- `next`: 15.5.x -> 16.1.6
- `@next/bundle-analyzer`: 15.5.x -> 16.1.6
- `@next/eslint-plugin-next`: 15.5.x -> 16.1.6
- `react` / `react-dom`: 18.x -> 19.2.x
- `@types/react` / `@types/react-dom`: 18.x -> 19.x
- `@portabletext/react`: 3.x -> 6.x
- `@sanity/client`: 6.x -> 7.x
- `@sanity/image-url`: 1.x -> 2.x
- `zod`: 3.x -> 4.x
- `eslint` / `@eslint/js`: 9.x -> 10.x
- `eslint-plugin-react-hooks`: 5.x -> 7.x

### Sanity (`sanity`)
- `sanity`: 4.22.x -> 5.9.x
- `@sanity/vision`: 4.22.x -> 5.9.x
- `@sanity/eslint-config-studio`: 5.x -> 6.x
- `uuid`: 11.x -> 13.x
- `eslint`: 9.x -> 10.x

## Execution Plan

### Batch A: Frontend Framework Runtime Upgrade
Branch: `deps/major-frontend-next-react`

1. Upgrade runtime/framework set together:
   - `next`, `react`, `react-dom`
   - `@next/bundle-analyzer`, `@next/eslint-plugin-next`
   - `@types/react`, `@types/react-dom`
2. Resolve breaking API changes:
   - Replace deprecated `next lint` workflows with ESLint CLI where needed.
   - Update route-handler or middleware typing differences introduced by Next 16.
   - Validate React 19 compatibility in custom hooks and client components.
3. Validation gate:
   - `npm run lint:frontend`
   - `npm run type-check` (root)
   - `npm --prefix eats-frontend run build`
   - Targeted API/critical UI tests
   - Isolated Vercel production deploy verification (`scripts/verify-deployment.js`)

Exit criteria:
- No regression in authentication, API health route behavior, routing, or main discovery pages.
- Production verification passes 8/8 checks.

### Batch B: Sanity Platform Upgrade
Branch: `deps/major-sanity-v5`

1. Upgrade Studio packages:
   - `sanity`, `@sanity/vision`, `@sanity/eslint-config-studio`
2. Upgrade frontend Sanity SDKs in the same batch:
   - `@sanity/client`, `@sanity/image-url`, `@portabletext/react`
3. Resolve API and typing changes between Sanity 4/6 clients and Sanity 5/7 client stack.
4. Validate Studio and frontend content paths:
   - Studio dev/build
   - Frontend recipe/post/category fetching
   - Preview/draft mode behavior
5. Validation gate:
   - `npm --prefix sanity run check`
   - `npm run lint:frontend`
   - `npm --prefix eats-frontend run type-check`
   - `npm --prefix eats-frontend run build`

Exit criteria:
- Studio runs and builds cleanly.
- Frontend content render paths match pre-upgrade behavior on key pages.

### Batch C: Tooling and Library Majors
Branch: `deps/major-tooling-and-libs`

1. Upgrade tooling majors:
   - `eslint`, `@eslint/js`, `eslint-plugin-react-hooks`
2. Upgrade isolated library majors with focused tests:
   - `zod` 3 -> 4
   - `uuid` 11 -> 13 (Sanity side)
3. Keep framework versions fixed during this batch to avoid mixed-fault debugging.
4. Validation gate:
   - Root `npm run check`
   - Re-run security audit in both projects

Exit criteria:
- Lint and type-check behavior stable.
- No runtime regressions in API validation or ID generation code paths.

## Release and Rollback Strategy
- Deploy one batch at a time.
- Observe production for at least 24 hours between batch releases.
- Roll back by restoring previous production deployment alias if any batch causes regressions.
- Do not stack unresolved batches.

## Required Test Scenarios Per Batch
- Public routes: `/`, `/recipes`, `/search`, `/categories`, `/about`
- Internal health:
  - `/api/health` unauthenticated returns `401`
  - `/api/health` authenticated returns `200` or `206` with expected status payload
- Content/data:
  - Recipe detail page render
  - Category and cuisine pages
  - Sanity query-driven lists
- Build/deploy:
  - Root lint/type-check/build
  - Isolated production deploy and post-deploy verification script

## Defaults and Assumptions
- Node runtime remains at 20.x during this track.
- Major upgrades are split into three PRs aligned to batches A/B/C.
- Any dependency conflict that requires broad refactors is deferred to a follow-up PR in the same batch branch.
