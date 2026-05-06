# Service And Dependency Validation

Scope: `eats-frontend` and `sanity`.

Rule used for this pass: keep the public product surface, and only remove or reclassify an item when source, config, scripts, tests, and framework behavior show no production owner.

## Dependency Decisions

### Frontend removals

| Package | Decision | Evidence |
| --- | --- | --- |
| `@heroui/react` | Removed direct production dependency | App source imports explicit `@heroui/*` packages. The only active config owner was the stale aggregate import optimization in `next.config.js`, which was removed. |
| `@remotion/renderer` | Removed direct production dependency | No runtime imports. The recipe video API returns composition metadata and does not render MP4 files in-process. Remotion authoring remains owned by `@remotion/cli` in dev dependencies. |
| `swiper` | Removed direct production dependency | No active app imports. The only reference is an old optimization helper for a missing `RecipeInteractive.tsx` target. |
| `swr` | Removed direct production dependency | No source imports. Current search and recipe data flow is URL/server driven. |
| `yet-another-react-lightbox` | Removed direct production dependency | No source imports. Current gallery surfaces do not use this package. |

### Frontend reclassifications

| Package | Decision | Evidence |
| --- | --- | --- |
| `@remotion/cli` | Moved to dev dependency | Used for local Remotion Studio and video authoring, not for the deployed Next.js runtime. |
| `@swc/core` | Moved to dev dependency | Owned by build/test tooling, especially Jest/SWC usage. Next.js carries its runtime compiler path separately. |
| `@tailwindcss/postcss` | Moved to dev dependency | Owned by `postcss.config.js`; needed for builds, not request-time runtime. |
| `@types/three` | Moved to dev dependency | Type-only package for Three/Cosmos development. |

### Frontend retained

| Package or family | Classification | Owner |
| --- | --- | --- |
| `react`, `react-dom`, `next` | Required | Next.js framework runtime. |
| Explicit `@heroui/*` packages | Required | UI components are imported directly throughout app and feature components. |
| `@remotion/player`, `remotion` | Optional but active | Recipe video preview/player and Remotion composition source. |
| `three`, `@react-three/*`, `react-force-graph-*`, `react-globe.gl`, `react-simple-maps` | Optional but active | Cosmos, visualization, and cuisine/world-map surfaces. |
| `react-is` | Required transitive runtime support | `recharts` imports it from its bundled chart utilities during the admin trends build. Direct app imports do not show this owner, so build verification is the deciding evidence. |
| `@sentry/nextjs`, `@vercel/analytics`, `@vercel/speed-insights` | Optional but active | Monitoring and deployment observability. |
| `@supabase/*` | Required for full product mode | Saved recipes, meal planning, comments, ratings, auth-adjacent persistence, and health checks. |
| `@upstash/*` | Optional but active | Rate limiting, Redis-backed helpers, and health checks; app can degrade in development/minimal mode. |
| `resend`, `@react-email/components` | Optional but active | Contact/newsletter/email flows. |
| `google-trends-api` | Optional but active | Trending/admin trend ingestion surfaces. |
| `jspdf`, `jspdf-autotable` | Optional but active | Recipe print/export tooling. |

### Sanity decisions

| Package | Decision | Evidence |
| --- | --- | --- |
| `react`, `react-dom`, `styled-components` | Required | Sanity Studio framework and peer/runtime requirements. |
| `sanity`, `@sanity/vision` | Required | Studio runtime and Vision plugin in `sanity.config.ts`. |
| `puppeteer` | Moved to dev dependency | Only used by the ad hoc `ux-test-korean-bbq.js` browser test helper. |
| `uuid` | Moved to dev dependency | Only directly imported by recipe data-generation scripts; kept direct so the existing override can pin transitive `uuid`. |

## Service Owners

| Service or secret family | Classification | Owner |
| --- | --- | --- |
| Sanity project/dataset/API version | Required | Recipe content, image URLs, health checks, preview, migrations, and Studio. |
| `SANITY_API_TOKEN` and Studio preview secrets | Optional but active | Draft preview, migrations, diagnostics, and write scripts. Production can serve published content without draft access. |
| Supabase URL/anon/service-role keys | Required for full product mode | Saved recipes, meal planning, collections, ratings, comments, auth helpers, and health checks. Minimal mode intentionally disables these paths. |
| Upstash Redis REST URL/token | Optional but active | Rate limiting and Redis helpers; health checks can be configured to require it. |
| Sentry DSN/org/project/auth token | Optional but active | Runtime error monitoring and source-map upload. |
| Vercel Analytics and Speed Insights | Optional but active | Product analytics and performance telemetry. |
| Resend | Optional but active | Email/newsletter/contact delivery. |
| Anthropic API key | Optional but active | AI Chef API route; route fails closed when the key is missing. |
| USDA API key | Optional but active | Nutrition calculation; USDA client falls back to demo mode where supported. |
| Google Trends | Optional but active | Trending data tasks. |
| Monitoring webhooks | Optional but active | Internal Slack/Discord/email alert route. |
| Revalidation and cron secrets | Required for protected automation | Sanity webhook revalidation, cron/admin routes, cache warmup, and diagnostics. |
| CSP reporting/config | Optional but active | Security header rollout and CSP monitoring surfaces; production CSP remains a separate hardening track. |

## Follow-Ups Not Done In This Pass

- Remove or rewrite stale optimization helper references that describe packages no longer used, such as the old Swiper split helper, if those scripts become part of a maintained build workflow.
- Clean up hardcoded Sanity-token fallback behavior in legacy utility scripts and rotate any token that has ever appeared in source history.
- Review old deployment and performance docs for package names that are now historical rather than current architecture.
