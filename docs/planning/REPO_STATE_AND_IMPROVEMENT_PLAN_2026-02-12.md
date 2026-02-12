# Repo State Assessment and Improvement Plan (2026-02-12)

## Summary
This document captures the current local state of the workspace and a prioritized **Now / Next / Later** improvement plan focused on **product UX/performance**, with correctness/security blockers handled first.

Assessment baseline:
- Root workspace: `/Users/shern/EATS Sanity CMS - Frontend`
- Includes local uncommitted frontend work and local-ahead sanity commits
- Validation executed on current local state

---

## Current State Snapshot

### Git State
- Root: `main` tracking `origin/main`; `eats-frontend` submodule pointer modified.
- Frontend (`eats-frontend`): 4 unstaged files:
  - `app/(recipes)/post/[slug]/page.tsx`
  - `app/api/ai-chef/route.ts`
  - `app/api/import-recipe/route.ts`
  - `public/sw-enhanced.js`
- Sanity (`sanity`): `main` is ahead of `origin/main` by 5 commits.

### Change Intensity (recent)
Major high-churn frontend commits in last window:
- `7d13db7`: 68 files, +10,562 / -2,566
- `6fc2322`: 37 files, +9,263
- `cf3bed8`: 66 files, +7,787
- `42e0a19`: 18 files, +2,601

Sanity recent:
- `752246c`: 4 files, +2,010 / -2,258 (Sanity 4.22 + React 19)
- `1cb3835`: small schema reference update

### Surface Area Map
- API route files: `81`
- Loading/error route boundaries: `88`
- Component files: `273`
- Library files: `152`
- Test files (`*.test.*` / `__tests__`): `51`

---

## Validation Baseline (executed)

### Workspace Checks
- `npm run lint`: ✅ pass (frontend + sanity)
- `npm run type-check`: ✅ pass (frontend + sanity)
- `npm run build`: ✅ pass (frontend + sanity)

Build notes:
- `next lint` deprecation warning (Next.js 16 migration pending).
- `RESEND_API_KEY is not set` warnings during static generation (non-blocking in local/dev mode).

### Targeted Regression Tests
Executed:
- `components/__tests__/RecipeCard.test.tsx`
- `app/api/search/__tests__/route.test.ts`
- `app/api/favorites/__tests__/route.test.ts`
- `app/api/ratings/__tests__/route.test.ts`
- `app/api/newsletter/__tests__/subscribe.test.ts`
- `app/api/draft/__tests__/enable.test.ts`
- `app/api/draft/__tests__/disable.test.ts`
- `app/api/recipes/__tests__/route.test.ts`
- `app/api/posts/__tests__/all.test.ts`
- `app/api/posts/__tests__/paginated.test.ts`
- `app/api/health/__tests__/route.test.ts`
- `app/api/health/__tests__/sanity.test.ts`
- `app/api/__tests__/revalidate.test.ts`

Result:
- 12 suites passed, 1 failed
- Failing suite: `app/api/newsletter/__tests__/subscribe.test.ts` (7 failed assertions; expected 2xx/429 returning 500)

---

## Confirmed Issues (prioritized)

### P0. Dynamic route context lost through API middleware
- `eats-frontend/lib/api-middleware.ts:61`
- `eats-frontend/lib/api-middleware.ts:65`
- `eats-frontend/lib/api-middleware.ts:105`
- `eats-frontend/app/api/skill-tree/techniques/[id]/unlock/route.ts:22`
- `eats-frontend/app/api/skill-tree/techniques/[id]/unlock/route.ts:30`
- `eats-frontend/app/api/skill-tree/quests/[id]/complete/route.ts:20`
- `eats-frontend/app/api/skill-tree/quests/[id]/complete/route.ts:28`

Problem:
- Middleware signature forwards only `request`, but handlers expect `context` for dynamic params; handlers return `Invalid context`.

Impact:
- Skill-tree unlock and quest-complete endpoint behavior is unreliable/broken.

### P0. XP trust boundary bug (client-controlled quest XP)
- `eats-frontend/app/api/skill-tree/xp/route.ts:542`
- `eats-frontend/app/api/skill-tree/xp/route.ts:564`
- `eats-frontend/app/api/skill-tree/xp/route.ts:570`

Problem:
- Server calculates quest XP from client-supplied `questXpReward`.

Impact:
- Users can inflate XP by tampering payload values.

### P0. Newsletter subscribe test infrastructure drift
- `eats-frontend/app/api/newsletter/__tests__/subscribe.test.ts:18`
- `eats-frontend/app/api/newsletter/__tests__/subscribe.test.ts:63`
- Runtime evidence references real limiter: `eats-frontend/lib/rate-limit-config.js:68`

Problem:
- Test assumptions/mocks no longer match runtime module resolution behavior.

Impact:
- Test suite gives false signal and blocks reliable refactoring for newsletter flow.

### P1. SSRF protection gap on redirect chains (local WIP)
- `eats-frontend/app/api/import-recipe/route.ts:107`
- `eats-frontend/app/api/import-recipe/route.ts:113`

Problem:
- Host validation is performed pre-fetch, but fetch may follow redirects to private/internal destinations.

Impact:
- Potential SSRF bypass via attacker-controlled redirecting URL.

### P2. Documentation/version drift at root
- `README.md:44` states Sanity Studio v3, but actual package is Sanity `^4.22.0` and React `^19.2.0` (`sanity/package.json:29`, `sanity/package.json:31`).

Impact:
- Onboarding confusion and inaccurate platform expectations.

---

## UX/Performance Observations

### Route weight hotspots (from successful production build)
- `/post/[slug]` first load JS ~`591 kB`
- `/` first load JS ~`547 kB`
- `/search` first load JS ~`540 kB`
- `/categories` first load JS ~`537 kB`
- `/cuisine/[slug]` first load JS ~`531 kB`

Interpretation:
- Primary consumer journeys remain heavy; optimization should target recipe detail, home, and discovery surfaces first.

### Existing UX reliability strengths
- Broad loading/error route coverage exists (88 boundaries), reducing blank/frozen state risk.
- Service worker has explicit navigation network-first strategy in local changes (`public/sw-enhanced.js`).

### Immediate UX/perf risk couplings
- API correctness issues in skill-tree flows directly degrade user experience despite broad UI skeleton/error coverage.
- Broken newsletter tests reduce confidence in user communication pathways and release stability.

---

## Improvement Roadmap (Now / Next / Later)

## Now (0-2 weeks): Stabilize correctness + user trust paths

### N1. Fix middleware contract for dynamic API routes
Scope:
- `eats-frontend/lib/api-middleware.ts`
- dynamic API handlers using `context.params`

Implementation:
1. Update `withApiMiddleware` handler signature to accept optional context and forward it.
2. Ensure wrapped handler supports Next.js route handler shape `(request, context?)`.
3. Remove duplicate in-handler auth checks where middleware already enforces `requireAuth`.

Acceptance criteria:
- `POST /api/skill-tree/techniques/[id]/unlock` resolves valid `id` and no `Invalid context` response.
- `POST /api/skill-tree/quests/[id]/complete` resolves valid `id` and no `Invalid context` response.

Validation:
- Add/adjust route tests for both endpoints with param context.
- Run `npm run type-check` and targeted Jest suites.

### N2. Make quest XP server-authoritative
Scope:
- `eats-frontend/app/api/skill-tree/xp/route.ts`

Implementation:
1. Remove trust in client `questXpReward` for award value.
2. Fetch quest from DB and use DB `xp_reward` only.
3. Keep payload `questId` only; treat supplied reward as invalid/ignored.
4. Add negative test for inflated payload reward.

Acceptance criteria:
- XP result remains equal to DB quest reward regardless of client payload value.
- Tampered reward input cannot increase awarded XP.

Validation:
- New tests for tamper attempts.
- Run targeted skill-tree route tests.

### N3. Repair newsletter subscribe suite and mocking boundaries
Scope:
- `eats-frontend/app/api/newsletter/__tests__/subscribe.test.ts`
- `eats-frontend/jest.config.js`
- relevant mock modules in `eats-frontend/__mocks__/lib/`

Implementation:
1. Align test mocking approach with actual module resolution (explicit mock strategy per dependency).
2. Ensure rate limiter path is deterministic in unit tests.
3. Remove reliance on side effects from real limiter/client creation paths.

Acceptance criteria:
- `app/api/newsletter/__tests__/subscribe.test.ts` passes consistently.
- Tests verify route behavior, not environment-dependent side effects.

Validation:
- Re-run the 13-suite targeted test command above.

### N4. Close SSRF redirect bypass in import endpoint (local WIP)
Scope:
- `eats-frontend/app/api/import-recipe/route.ts`

Implementation:
1. Set `redirect: 'manual'` on initial fetch.
2. Validate every redirect target with `validateImportTarget` before following.
3. Cap redirect hops and return safe 4xx on invalid redirect chain.

Acceptance criteria:
- Redirect from public URL to private/internal address is rejected.
- Standard public redirects still work within hop limits.

Validation:
- Add tests for allowed/blocked redirect scenarios.

---

## Next (2-6 weeks): UX/performance hardening and consistency

### X1. Reduce first-load JS on top traffic routes
Scope:
- `/post/[slug]`, `/`, `/search`, `/categories`, `/cuisine/[slug]`

Implementation:
1. Identify non-critical client bundles and lazy-load below-the-fold features.
2. Move non-interactive components server-side where possible.
3. Revisit shared chunk composition (`next.config.js` splitChunks strategy).

Acceptance criteria:
- Measurable first-load JS reduction on top 5 heavy routes.
- No hydration regressions on those routes.

Validation:
- Compare `next build` route-size output before/after.
- Smoke test hydration-sensitive pages.

### X2. Service worker behavior contract and offline UX verification
Scope:
- `eats-frontend/public/sw-enhanced.js`
- `eats-frontend/app/offline`

Implementation:
1. Document request strategy per resource class.
2. Add functional tests/checklist for navigation offline behavior and recipe page fallback.
3. Enforce cache-size limits consistently after writes.

Acceptance criteria:
- Predictable fallback for offline navigation and cached recipe pages.
- No unbounded growth in dynamic/recipe caches.

### X3. API route governance and consistency pass
Scope:
- high-traffic APIs in `app/api/*`

Implementation:
1. Standardize input validation, auth source, and error envelopes.
2. Explicitly classify each route as public/auth-required/cron/admin.
3. Remove duplicate auth checks when middleware already enforces auth.

Acceptance criteria:
- Consistent response/error conventions across route groups.
- Reduced auth/rate-limit drift between endpoints.

---

## Later (6+ weeks): structural modernization

### L1. Documentation and runbook realignment
Scope:
- root `README.md`
- deployment/setup docs under `docs/` and `eats-frontend/docs/`

Implementation:
1. Align version statements and setup instructions with actual package versions and scripts.
2. Add “source of truth” section for workspace scripts and deployment entrypoints.

Acceptance criteria:
- New contributor setup succeeds without correction loops.

### L2. Test architecture upgrades for critical surfaces
Scope:
- API routes, service worker behavior, auth/rate-limit middleware

Implementation:
1. Add focused tests for dynamic route context handling and trust boundaries.
2. Add regression tests for newsletter and import security edge cases.

Acceptance criteria:
- Critical-path suites fail fast on contract drift.

### L3. Performance budgets and enforcement
Scope:
- top routes and shared chunks

Implementation:
1. Define route-level JS budget thresholds.
2. Add CI checks or report diff gates against build output.

Acceptance criteria:
- New PRs cannot silently regress top-route payloads.

---

## Execution Order and Dependencies
1. N1 middleware fix first (unblocks dynamic route correctness and testability).
2. N2 XP trust-boundary fix second (security integrity).
3. N3 newsletter test repair third (regression confidence).
4. N4 SSRF redirect-chain hardening fourth (security hardening on local WIP path).
5. Then proceed with X1/X2/X3 optimization stream.

---

## Verification Commands (standard)
- `npm run lint`
- `npm run type-check`
- `npm run build`
- Targeted regression suites (same 13-suite command used in this assessment)

