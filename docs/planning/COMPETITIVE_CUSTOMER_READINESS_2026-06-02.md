# EATS Competitive Customer Readiness Roadmap

Date: 2026-06-02

## Goal

Make EATS commercially and customer ready end to end by learning from high-performing food and recipe platforms, then applying the strongest patterns in a way that still feels like EATS.

This is not a copy-the-competitors exercise. The useful question is: when NYT Cooking, Serious Eats, Allrecipes, and related food products win customer trust, what jobs are they doing especially well, and where should EATS meet or beat that bar?

## Source Anchors

These are the initial research anchors for the roadmap. Traffic numbers are third-party estimates and should be treated as directional, not exact.

| Source                                                                                                                                    | What it shows                                                                                                                                                                                                                                                 | Product lesson                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| [NYT Cooking App Store listing](https://apps.apple.com/us/app/nyt-cooking-quick-tasty-meals/id911422904)                                  | NYT Cooking emphasizes editor-curated collections, recipe testing, videos, ratings/reviews, saved Recipe Box, grocery lists, Instacart integration, and a searchable database of 20,000+ recipes. The listing shows a 4.9 rating with more than 500K ratings. | Successful recipe products combine trust, archive depth, practical planning tools, and a simple save/shop loop. |
| [Serious Eats About Us](https://www.seriouseats.com/about-us-5120006)                                                                     | Serious Eats explicitly sells the promise "Good Cooks Know How. Great Cooks Know Why." It highlights rigorously tested recipes, science-driven techniques, equipment reviews, cultural context, frequent updates, and reader feedback.                        | Trust is a feature. Recipes should explain why they work, who tested them, and when they were improved.         |
| [Serious Eats Semrush overview](https://www.semrush.com/website/seriouseats.com/overview/)                                                | Semrush estimated 15.01M visits in April 2026, with Google organic as the largest visible traffic source and a mostly mobile audience.                                                                                                                        | Strong food brands are search-led and mobile-heavy; SEO and mobile recipe usability are core product work.      |
| [Allrecipes Semrush overview](https://www.semrush.com/website/allrecipes.com/overview/?source=trending-websites)                          | Semrush estimated 81.27M visits in February 2026, with large organic reach and an overwhelmingly mobile audience.                                                                                                                                             | Scale comes from a broad searchable archive, community proof, and utility that works quickly on phones.         |
| [Allrecipes / MyRecipes FAQ](https://support.myrecipes.com/hc/en-us/articles/30782585750807-Allrecipes-MyRecipes-FAQs) and media material | MyRecipes/Allrecipes position saves, collections, shopping lists, and menu planning as core actions.                                                                                                                                                          | Saving, organizing, shopping, and planning should feel like one connected customer journey, not separate tools. |
| [The Kitchn](https://www.thekitchn.com/) and adjacent food media                                                                          | The Kitchn focuses on practical weeknight cooking, shortcuts, roundups, and planning-friendly content.                                                                                                                                                        | Editorial packaging matters: "what should I cook tonight?" is often more useful than raw recipe volume.         |

## Current EATS Capability Map

EATS already has many of the right building blocks. The gap is less "missing feature" and more "commercial clarity, trust polish, and connected workflows."

| Area                              | Current EATS evidence                                                                                                                                                                                                                                                                                                                                                                      | Readiness level                 | Gap to close                                                                                                                                                                                    |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Recipe detail UX                  | `eats-frontend/app/(recipes)/post/[slug]/page.tsx`, `eats-frontend/components/recipe/RecipeHeroSection.tsx`, and `eats-frontend/components/recipe/RecipePageBody.tsx` include hero imagery, structured data, ratings, cooking mode, jump links, print/share/save actions, related recipes, nutrition, timers, shopping-list tools, meal-plan tools, offline save, and a table of contents. | Strong foundation               | Add a clearer trust layer: tested status, "why this works", last updated/tested, author/tester context, and visible content quality signals.                                                    |
| Search and discovery              | `eats-frontend/app/search/page.tsx`, `eats-frontend/components/search/EnhancedSearch.tsx`, advanced query helpers, pantry search, cuisine/category routes, seasonal, trending, roulette, collections, quick meals, and visualizations.                                                                                                                                                     | Broad but potentially scattered | Make the primary discovery paths obvious: search by need, browse by time/diet/cuisine, cook from pantry, plan the week. Add stronger no-results rescue and visible faceted filters.             |
| Saves, collections, and retention | Favorites, saved page, collections, recent views, recipe notes, compare, taste profile, cooking history, newsletter, and auth flows exist.                                                                                                                                                                                                                                                 | Feature-rich                    | Make the retention loop legible from first visit: save recipe, add to plan/list, get reminders/newsletter, return to saved items.                                                               |
| Meal planning and shopping        | `eats-frontend/app/meal-planner/page.tsx`, `eats-frontend/components/features/MealPlanner.tsx`, shopping list routes, meal plan APIs, and recipe shopping-list cards exist.                                                                                                                                                                                                                | Promising                       | Reduce friction between recipe detail, weekly planner, and shopping list. Recipe addition currently looks manual in the planner; customers should not have to understand internal recipe IDs.   |
| Sanity publishing workflow        | `sanity/schemaTypes/recipe.ts` has AI-friendly recipe fields, grouped ingredients, instructions, equipment, techniques, tags, media, author, SEO, and nutrition.                                                                                                                                                                                                                           | Strong schema base              | Add editorial readiness fields or workflow checks: tested-by, test status, last tested date, image status, source/origin, "why this works", SEO completeness, and launch checklist.             |
| SEO and structured data           | Recipe metadata, canonical paths, `RecipeSchema`, search metadata, and performance config exist.                                                                                                                                                                                                                                                                                           | Good base                       | Run a search-readiness pass: validate JSON-LD, sitemap/robots coverage, Open Graph images, recipe schema completeness, and whether missing images or generic descriptions harm search snippets. |
| Mobile readiness                  | The code has mobile action bars, responsive recipe hero, and mobile section nav. Competitor traffic patterns suggest this matters heavily.                                                                                                                                                                                                                                                 | Needs evidence                  | Run screenshot and interaction QA on phone-width viewports for home, search, recipe detail, meal planner, shopping list, and Sanity authoring if needed.                                        |
| Commercial polish                 | Equipment reviews, affiliate-ready equipment references, newsletter, account flows, monitoring, analytics, and feature flags exist.                                                                                                                                                                                                                                                        | Underconnected                  | Decide the commercial path: premium content, affiliate equipment, newsletter/community, or utility-first planning. Then make the UI point toward that path deliberately.                        |

## Priority Backlog

### P0: Customer Trust and Recipe Quality

Why this matters: NYT Cooking and Serious Eats win because customers believe the recipes will work. EATS should make that confidence visible.

Tasks:

1. Add editorial trust fields to the native Sanity recipe schema:
   - `testedStatus`
   - `testedBy`
   - `lastTestedAt`
   - `whyItWorks`
   - `editorialNotes`
   - optional `sourceCredit`
2. Surface a compact "Kitchen notes" or "Why this works" block on recipe detail pages when the fields exist.
3. Add a CMS-side publish checklist or document badge so incomplete recipes are easy to spot before launch.
4. Add tests for the recipe-page model so missing trust fields never break older content.

### P0: Discovery That Matches Real Customer Intent

Why this matters: Customers rarely browse abstractly. They ask things like "quick dinner", "vegetarian", "use up chicken", "weeknight pasta", or "what can I cook from my pantry?"

Tasks:

1. Audit the main navigation and homepage utility links for the four primary entry points:
   - Search recipes
   - Cook from pantry
   - Plan the week
   - Browse seasonal/quick meals
2. Make search filters visibly useful on the search page: time, diet, cuisine, difficulty, ingredients include/exclude.
3. Improve no-results states with suggested searches, pantry search, and category fallbacks.
4. Ensure recipe cards consistently show the metadata customers use to choose: total time, difficulty, cuisine, diet tags, save action, and whether the image is real.

### P0: Connected Save-Plan-Shop Loop

Why this matters: NYT Cooking, Allrecipes, and MyRecipes all treat saving, grocery lists, and planning as a loop. EATS has the pieces, but the customer should feel one flow.

Tasks:

1. From recipe detail, make "Add to meal plan" and "Add to shopping list" use the current recipe automatically.
2. In meal planner, replace manual recipe ID entry with recipe search/autocomplete.
3. In shopping lists, clearly separate local unsynced lists from account-backed meal-plan lists.
4. Add a first-run empty state that tells a customer exactly what to do next without sounding like documentation.

### P1: Mobile Product QA

Why this matters: Competitor traffic data is strongly mobile-weighted. A recipe product can look good on desktop and still fail where customers actually cook.

Tasks:

1. Run browser screenshots for home, search, recipe detail, meal planner, shopping list, and Sanity Studio at mobile and desktop widths.
2. Check tap targets, sticky bars, recipe hero height, long recipe titles, ingredient layout, print/share actions, and planner grid behavior.
3. Fix any overlapping text, hidden controls, or layouts that require horizontal scrolling.

### P1: SEO and Growth Readiness

Why this matters: Food traffic is search-led. Recipe pages need to be understandable to Google, social previews, and AI/search tools.

Tasks:

1. Validate recipe JSON-LD for representative recipes.
2. Confirm sitemap coverage for recipes, categories, cuisines, and collections.
3. Audit metadata fallbacks for recipes without images or descriptions.
4. Add a lightweight content checklist for slug, title, description, main image alt text, total time, servings, categories, and keywords.

### P2: Commercial Path

Why this matters: "Commercially ready" needs a direction. EATS can be a premium recipe archive, a planning utility, an editorial food brand, an affiliate equipment guide, or some blend, but the product should not leave that implicit forever.

Tasks:

1. Choose the first commercial lane to optimize for:
   - Editorial recipe brand
   - Utility-first meal planning
   - Affiliate equipment and technique guide
   - Newsletter/community growth
2. Add analytics events around the chosen lane.
3. Tighten homepage and recipe-page calls to action around that lane.
4. Create a launch-readiness dashboard with traffic, saves, search zero-results, newsletter signups, and top recipe engagement.

## First Implementation Sequence

Start here because these tasks improve customer confidence without requiring a full product rewrite:

1. Add Sanity trust/readiness fields to `recipe`.
2. Update frontend recipe types/adapters to carry those fields when present.
3. Add a compact trust block to recipe detail pages.
4. Add tests around model generation and backwards compatibility.
5. Run `npm run check` from the wrapper.

The next best implementation after that is the connected save-plan-shop loop, especially replacing manual recipe ID entry in the meal planner with a real recipe picker.

## Operating Rules For This Goal

1. Use competitor research to identify patterns, not to copy wording, layouts, or proprietary content.
2. Prefer improvements that make a first-time customer more confident or reduce the steps to cook something tonight.
3. Treat mobile as the primary cooking surface unless evidence proves otherwise.
4. Every implementation pass should end with local validation and a short customer-facing QA checklist.
5. Keep the roadmap alive: after each shipped improvement, update the readiness map instead of spawning unrelated docs.
