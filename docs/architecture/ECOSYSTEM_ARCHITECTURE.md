# EATS Ecosystem Architecture

## System Overview

The EATS project is a sophisticated full-stack recipe application that demonstrates modern web development patterns, AI-ready content management, and innovative user experiences.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         EATS Architecture                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐         API          ┌──────────────────────┐   │
│  │  Sanity CMS  │ ◄─────────────────►  │   Next.js Frontend   │   │
│  │   (Backend)  │                      │    (Presentation)     │   │
│  └──────┬───────┘                      └───────────┬───────────┘   │
│         │                                           │               │
│    [Content Hub]                              [Features]           │
│    • Schemas                                  • Server Components  │
│    • Studio UI                                • Client Components  │
│    • CDN Images                               • API Routes        │
│    • GROQ API                                 • Middleware        │
│                                               • Edge Functions    │
│                                                                     │
│  ┌──────────────┐                      ┌──────────────────────┐   │
│  │  PostgreSQL  │ ◄─────────────────►  │     Redis Cache      │   │
│  │   Database   │                      │   (Rate Limiting)    │   │
│  └──────────────┘                      └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Core Architectural Patterns

### 1. Hybrid Content Model

The system supports two content paradigms seamlessly:

#### Traditional Content (Regular Posts)
```typescript
// sanity/schemaTypes/post.js
{
  title: 'Recipe Title',
  ingredients: [/* structured array */],
  instructions: [/* step-by-step */],
  // ... individual fields
}
```

#### AI-Optimized Content (JSON Posts)
```typescript
// sanity/schemaTypes/jsonPost.js
{
  title: 'Recipe Title',
  slug: 'recipe-slug',
  contentJSON: '{"complete": "recipe", "in": "single", "json": "field"}'
}
```

**Why This Matters**: This dual approach enables:
- Manual content creation through Sanity Studio's rich UI
- Bulk AI-generated content via JSON paste
- Seamless migration between formats
- Future-proof content strategy

### 2. Post Adapter Pattern

The Post Adapter (`eats-frontend/lib/adapters/post-adapter.ts`) is a sophisticated conversion layer:

```typescript
// Real-time monitoring and conversion
adaptToPost(doc: unknown): Post | null {
  // Intelligent type detection
  // Graceful error handling
  // Performance tracking
  // Logging and analytics
}
```

**Key Features**:
- **Automatic Type Detection**: Identifies content type and converts appropriately
- **Error Recovery**: Handles malformed data without crashing
- **Performance Monitoring**: Track success rates at `/dev/adapter-monitor`
- **Memory Management**: Limited log storage to prevent memory leaks

### 3. Modular Query Architecture

```
lib/queries/
├── base.ts          # Core utilities
├── cache.ts         # Caching layer
├── groq-queries.ts  # GROQ strings
├── posts.ts         # Post operations
├── categories.ts    # Category logic
├── cuisines.ts      # Cuisine queries
└── index.ts         # Public API
```

This structure enables:
- **Query Reusability**: Share GROQ queries across components
- **Performance Optimization**: Built-in caching strategies
- **Type Safety**: Full TypeScript support
- **Maintainability**: Clear separation of concerns

### 4. Component Architecture

```
components/
├── Base Components     # UI primitives
├── Feature Components  # Complex features
├── Visualization      # Data viz
└── Theme Components   # Styled variants
```

**Component Patterns**:
```typescript
// Lazy loading for heavy components
const CookingMode = dynamic(() => import('./CookingMode'), {
  loading: () => <Spinner />,
  ssr: false
})

// Compound components for complex UI
<RecipeCard>
  <RecipeCard.Image />
  <RecipeCard.Title />
  <RecipeCard.Meta />
</RecipeCard>
```

## Data Flow Architecture

### 1. Content Creation Flow
```
Author → Sanity Studio → Sanity API → CDN
                ↓
         Webhook (optional)
                ↓
         Next.js ISR Revalidation
```

### 2. Content Consumption Flow
```
User Request → Next.js Server Component
                      ↓
                 GROQ Query
                      ↓
                Sanity Client
                      ↓
                Cache Check (Redis)
                      ↓
                Data Fetch
                      ↓
                Post Adapter
                      ↓
                React Component
                      ↓
                HTML Response
```

### 3. Interactive Feature Flow
```
User Interaction → Client Component
                        ↓
                  Local State / Context
                        ↓
                  API Route (if needed)
                        ↓
                  Rate Limiter
                        ↓
                  Database / External Service
                        ↓
                  Response
```

## Technology Stack Deep Dive

### Frontend (Next.js 15.3.4)
- **App Router**: Modern routing with layouts
- **Server Components**: Default server-side rendering
- **Client Components**: Interactive features with 'use client'
- **Edge Runtime**: For performance-critical paths
- **Image Optimization**: Automatic with next/image

### CMS (Sanity)
- **Real-time Collaboration**: Multiple editors simultaneously
- **Portable Text**: Rich text with custom components
- **Asset Pipeline**: Automatic image optimization
- **GROQ**: Powerful query language
- **Webhooks**: For cache invalidation

### Database (PostgreSQL + Prisma)
- **User Data**: Authentication, preferences
- **App State**: Collections, favorites
- **Analytics**: Usage tracking
- **Schema Migrations**: Version-controlled with Prisma

### Caching (Redis/Upstash)
- **API Rate Limiting**: 60 req/min default
- **Query Caching**: Reduce Sanity API calls
- **Session Storage**: Fast auth checks
- **Real-time Counters**: View counts, likes

## Performance Architecture

### 1. Bundle Optimization
```javascript
// next.config.js
modularizeImports: {
  '@heroui/react': {
    transform: '@heroui/{{member}}'
  },
  'lucide-react': {
    transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}'
  }
}
```

### 2. Code Splitting Strategy
- **Route-based**: Automatic with App Router
- **Component-based**: Dynamic imports for heavy components
- **Data-based**: Lazy load visualization data

### 3. Image Optimization Pipeline
```typescript
// Sanity CDN transformation
urlFor(image)
  .width(800)
  .height(600)
  .quality(85)
  .format('webp')
  .url()
```

### 4. Caching Layers
1. **Browser Cache**: Static assets
2. **Next.js Cache**: Full route caching
3. **Redis Cache**: API responses
4. **Sanity CDN**: Images and assets
5. **ISR**: Incremental Static Regeneration

## Security Architecture

### 1. Authentication Flow
```
User Login → NextAuth → JWT Generation
                ↓
          Session Cookie
                ↓
          Middleware Check
                ↓
          Protected Route Access
```

### 2. API Protection
- **Rate Limiting**: Token bucket algorithm
- **Input Validation**: Zod schemas
- **CORS**: Configured per route
- **CSP**: Content Security Policy headers

### 3. Environment Security
- **Secret Management**: Environment variables
- **Minimal Mode**: Deploy without auth
- **Token Scoping**: Sanity API permissions

## Scalability Considerations

### Horizontal Scaling
- **Stateless Design**: No server-side session storage
- **Edge Deployment**: Vercel Edge Network
- **CDN Distribution**: Global asset delivery
- **Database Pooling**: Connection management

### Vertical Scaling
- **Lazy Loading**: Components loaded on demand
- **Virtual Scrolling**: For long lists
- **Image Optimization**: Multiple formats and sizes
- **Query Optimization**: Efficient GROQ queries

## Development Experience

### 1. Developer Tools
- **Component Showcase**: `/showcase` for UI development
- **Debug Endpoints**: `/api/debug-*` for troubleshooting
- **Adapter Monitor**: Real-time conversion tracking
- **Performance Dashboard**: Bundle and runtime metrics

### 2. Testing Architecture
```
Testing Pyramid:
       E2E (Puppeteer)
      /              \
    Integration (Jest)
   /                  \
  Unit Tests (Jest + RTL)
```

### 3. CI/CD Pipeline
```
GitHub Push → GitHub Actions → Tests → Build → Vercel Deploy
                                ↓
                          Sanity Deploy
```

## Monitoring & Observability

### 1. Application Monitoring
- **Error Tracking**: Sentry integration
- **Performance**: Vercel Analytics
- **User Behavior**: Custom analytics
- **API Health**: Health check endpoints

### 2. Content Monitoring
- **Adapter Dashboard**: Conversion success rates
- **Query Performance**: GROQ query timing
- **Cache Hit Rates**: Redis statistics
- **CDN Analytics**: Sanity dashboard

## Innovation Points

### 1. Dual Content System
The hybrid approach of regular posts and JSON posts is unique, enabling both traditional CMS workflows and AI-generated content at scale.

### 2. Real-time Adapter Monitoring
The Post Adapter includes built-in monitoring, providing insights into content conversion success rates and error patterns.

### 3. Voice-Controlled Cooking
The cooking mode with voice commands represents a next-generation cooking experience, especially valuable when hands are messy.

### 4. Advanced Visualizations
Interactive 2D/3D graphs for ingredient relationships provide unique insights into flavor combinations and cooking techniques.

### 5. PWA with Offline Support
Full Progressive Web App capabilities allow users to access recipes even without internet connection.

## Best Practices Demonstrated

1. **Separation of Concerns**: Clear boundaries between CMS and frontend
2. **Type Safety**: End-to-end TypeScript
3. **Error Boundaries**: Graceful error handling
4. **Performance First**: Multiple optimization layers
5. **Developer Experience**: Comprehensive tooling
6. **Security by Default**: Multiple protection layers
7. **Scalable Architecture**: Ready for growth
8. **Modern Patterns**: Latest React and Next.js features

## Extension Points

The architecture provides multiple extension points for future features:

1. **Custom Schema Types**: Add new content models in Sanity
2. **API Routes**: Add new backend functionality
3. **Middleware Plugins**: Extend request processing
4. **Component Library**: Add new UI components
5. **Visualization Types**: Create new data visualizations
6. **AI Integration**: Connect to LLM services
7. **Third-party Services**: Integrate external APIs

## Conclusion

The EATS ecosystem represents a modern, scalable, and innovative approach to content-rich applications. Its architecture balances developer experience, performance, and user features while maintaining clean separation of concerns and extensibility for future growth.