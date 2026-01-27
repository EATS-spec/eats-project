# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the EATS project ecosystem.

## 📚 Comprehensive Documentation

### Architecture & Design
- [**ECOSYSTEM_ARCHITECTURE.md**](./docs/architecture/ECOSYSTEM_ARCHITECTURE.md) - Full-stack architecture, patterns, and system design
- [**SECURITY_PATTERNS.md**](./docs/architecture/SECURITY_PATTERNS.md) - Authentication, authorization, and security implementations
- [**DEPLOYMENT_STRATEGIES.md**](./docs/architecture/DEPLOYMENT_STRATEGIES.md) - Production deployment patterns and strategies

### Feature Guides
- [**AI_INTEGRATION_GUIDE.md**](./docs/guides/AI_INTEGRATION_GUIDE.md) - AI/LLM integration patterns and workflows
- [**INTERACTIVE_FEATURES.md**](./docs/guides/INTERACTIVE_FEATURES.md) - Voice control, PWA, cooking mode, and more
- [**DATA_VISUALIZATION_GUIDE.md**](./docs/guides/DATA_VISUALIZATION_GUIDE.md) - Force graphs, charts, and visual analytics

### Development
- [**DEVELOPER_WORKFLOWS.md**](./docs/guides/DEVELOPER_WORKFLOWS.md) - Closed-loop development, testing, and debugging
- [**CONTENT_MANAGEMENT_ADVANCED.md**](./docs/guides/CONTENT_MANAGEMENT_ADVANCED.md) - Advanced Sanity CMS patterns

### Future Vision
- [**INNOVATION_ROADMAP.md**](./docs/planning/INNOVATION_ROADMAP.md) - Upcoming features and possibilities

## Project Overview

This is a full-stack food blog application consisting of two interconnected projects:

1. **`eats-frontend/`** - Next.js 15 frontend application (consumer)
2. **`sanity/`** - Sanity CMS backend (content provider)

## Quick Start Commands

### Start Both Projects Locally
```bash
# From root directory
cd eats-frontend && npm run dev &  # Frontend on http://localhost:3000
cd ../sanity && npm run dev        # Sanity Studio on http://localhost:3333
```

### Individual Project Commands
```bash
# Frontend development
cd eats-frontend
npm run dev                  # Start Next.js dev server
npm run build               # Build for production
npm run lint -- --fix       # Fix linting issues
npm run test:critical       # Run critical tests

# Sanity CMS development
cd sanity
npm run dev                 # Start Sanity Studio
npm run deploy             # Deploy to Sanity.io
```

## Architecture & Data Flow

```
┌─────────────────┐         ┌──────────────────┐
│   Sanity CMS    │ ──API──>│  Next.js Frontend│
│  (Content Hub)  │         │   (Presentation) │
└─────────────────┘         └──────────────────┘
       │                            │
   [Schemas]                   [Components]
   - post                      - RecipeCard
   - jsonPost                  - InstructionsCard
   - category                  - CategoriesGrid
   - cinematicHero            - Visualizations
   - siteSettings             - Hero Sections
```

## Content Connection Points

### 1. Sanity Project Configuration
- **Project ID**: `5r8ri1sg` (used in both projects)
- **Dataset**: `production`
- **API Version**: `2023-06-07`

### 2. Schema-to-Frontend Mapping

| Sanity Schema | Frontend Usage | Key Files |
|--------------|----------------|-----------|
| `post` | Recipe pages | `/app/post/[slug]/page.tsx` |
| `jsonPost` | AI-generated recipes | Handled via Post Adapter |
| `category` | Category browsing | `/app/categories/page.tsx` |
| `cinematicHero` | Homepage hero | `/components/hero/CinematicHero.tsx` |
| `ingredient` | Visualizations | `/app/visualizations/ingredients/` |
| `technique` | Technique graphs | `/app/visualizations/techniques/` |
| `siteSettings` | Global config | Fetched in layout components |

### 3. Data Fetching Pattern
```typescript
// Frontend queries Sanity via GROQ
// Location: eats-frontend/lib/queries/

import { sanityClient } from '@/lib/sanityClient'

// Example query structure
const posts = await sanityClient.fetch(groqQuery)
```

## Key Integration Files

### Frontend Side
- `lib/sanityClient.ts` - Sanity client configuration
- `lib/queries/` - GROQ query definitions
- `lib/adapters/post-adapter.ts` - Converts between post types
- `lib/imageBuilder.ts` - Sanity image URL builder
- `lib/sanity.types.ts` - TypeScript types for Sanity data

### Sanity Side
- `sanity.config.ts` - Studio configuration
- `schemaTypes/` - Content model definitions

## Common Development Workflows

### Adding a New Content Type
1. **Define schema in Sanity**:
   ```bash
   cd sanity
   # Create new file in schemaTypes/
   # Add to schemaTypes/index.ts
   npm run dev  # Test in Studio
   ```

2. **Update frontend types**:
   ```bash
   cd eats-frontend
   # Update lib/sanity.types.ts
   # Create new query in lib/queries/
   ```

3. **Create frontend components**:
   ```bash
   # Build components to display new content
   # Add pages/routes as needed
   ```

### Modifying Recipe Fields
1. Update schema in `sanity/schemaTypes/post.ts` or `jsonPost.ts`
2. Deploy Sanity changes: `cd sanity && npm run deploy`
3. Update TypeScript types in `eats-frontend/lib/sanity.types.ts`
4. Adjust Post Adapter if needed: `eats-frontend/lib/adapters/post-adapter.ts`
5. Test with: `cd eats-frontend && npm run test:critical`

### Content Migration
```bash
# For adding fields to existing JSON posts
cd eats-frontend
node scripts/add-missing-fields-to-json-posts.js

# For analyzing content structure
node scripts/analyze-json-posts.js
```

## Environment Variables

### Frontend (.env.local)
```bash
# Required
NEXT_PUBLIC_SANITY_PROJECT_ID=5r8ri1sg
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Optional
SANITY_API_TOKEN=...  # For write operations
UPSTASH_REDIS_REST_URL=...  # Rate limiting
```

### Sanity
Environment is configured in `sanity.config.ts` - no `.env` file needed.

## Deployment

### Deploy Everything
```bash
# Frontend to Vercel
cd eats-frontend
npm run vercel:prod

# Sanity Studio to Sanity.io
cd ../sanity
npm run deploy
```

### Verify Deployment
1. Check frontend: Visit Vercel URL
2. Check Sanity Studio: `https://eats-sanity.sanity.studio/`
3. Test data flow: Create content in Studio → Verify on frontend

## Important Notes

### Post Adapter System
The frontend uses a Post Adapter (`eats-frontend/lib/adapters/post-adapter.ts`) to handle two content types:
- **Regular posts**: Traditional Sanity documents with individual fields
- **JSON posts**: Single JSON field containing entire recipe (AI-friendly format)

Monitor adapter performance at: `http://localhost:3000/dev/adapter-monitor`

### AI Recipe Creation (Quick Workflow)

**Use `/recipe [name]` command** to quickly generate recipes.

**Preferred Schema**: Use `recipe` type (not `jsonPost`) - it's the new AI-friendly format.

**Two Deployment Options**:

1. **Via Sanity Studio** (current):
   - Run `/recipe [name]` to generate the JSON
   - Open Sanity Studio: https://eats-sanity.sanity.studio/
   - Create new Recipe document and paste the values
   - Publish

2. **Direct MCP Creation** (requires Sanity 3.88.0+):
   - First upgrade: `cd sanity && npm install sanity@latest`
   - Deploy schema: `npx sanity schema deploy`
   - Then use `mcp__sanity__create_document` with:
     - `resource`: `{"projectId": "5r8ri1sg", "dataset": "production"}`
     - `workspaceName`: `default`
     - `type`: `recipe`

**Minimal Recipe Template** (for quick AI generation):
```json
{
  "_type": "recipe",
  "title": "Recipe Name",
  "slug": { "_type": "slug", "current": "recipe-name" },
  "description": "Brief description (max 300 chars)",
  "prepTime": 15,
  "cookTime": 30,
  "servings": "4",
  "difficulty": "easy",
  "cuisineType": "American",
  "ingredientSections": [{
    "sectionTitle": null,
    "items": [
      { "text": "2 cups flour", "optional": false }
    ]
  }],
  "steps": [{
    "instruction": "Step 1 instruction here",
    "tip": null
  }],
  "tags": ["tag1", "tag2"],
  "featured": false
}
```

**Full field list**: See `sanity/schemaTypes/recipe.ts`

### Image Handling
All images flow through Sanity's CDN:
```typescript
// Frontend uses imageBuilder
import { urlFor } from '@/lib/imageBuilder'
const imageUrl = urlFor(post.mainImage).width(800).url()
```

### Rate Limiting
API routes are rate-limited (60 req/min default). Configure in:
- `eats-frontend/lib/rate-limit-config.js`

### Content Preview
For live preview of content changes:
1. Make changes in Sanity Studio
2. Frontend uses ISR (Incremental Static Regeneration)
3. Or trigger manual revalidation via API

## Troubleshooting

### Content Not Appearing
1. Check Sanity Studio has published content (not just saved)
2. Verify project ID matches in both projects
3. Clear Next.js cache: `rm -rf eats-frontend/.next`
4. Check GROQ query in Vision tool: http://localhost:3333/vision

### Type Mismatches
1. Ensure `sanity.types.ts` matches actual schema
2. Run `npm run type-check` in frontend
3. Check Post Adapter logs for conversion errors

### Build Failures
1. Check Node version: Should be 20.x (see `.nvmrc`)
2. Verify all environment variables are set (see `.env.example`)
3. Clear Next.js cache if needed: `rm -rf eats-frontend/.next`

## Git & Session Continuity

**CRITICAL**: Every time you commit to git/GitHub, you MUST provide session notes in your response so that a new clean context iteration of Claude Code can pick up where you left off. These notes should include:
- What was accomplished in the session
- Current state of the codebase
- Any pending tasks or next steps
- Important decisions or patterns established
- Known issues or blockers

## Development Tips

- Each project has its own detailed CLAUDE.md for specific guidance
- Frontend showcase available at: http://localhost:3000/showcase
- Sanity Vision tool for testing queries: http://localhost:3333/vision
- Use Post Adapter monitor for debugging content issues
- Keep Sanity schemas and frontend types in sync