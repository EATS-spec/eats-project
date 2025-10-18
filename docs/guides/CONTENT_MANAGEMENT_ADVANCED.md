# Advanced Content Management Guide

## Overview

This guide explores advanced content management patterns in the EATS ecosystem, leveraging Sanity CMS's powerful features combined with the innovative dual-content system to create a flexible, scalable content platform.

## 🏗️ Schema Architecture

### The Dual Content Model

EATS implements a unique dual-content approach that supports both structured and unstructured content:

```javascript
// sanity/schemaTypes/post.js - Traditional structured content
export default {
  name: 'post',
  type: 'document',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'ingredients', type: 'array', of: [{ type: 'ingredient' }] },
    { name: 'instructions', type: 'array', of: [{ type: 'instruction' }] },
    // ... 30+ individual fields
  ]
}

// sanity/schemaTypes/jsonPost.js - AI-friendly unstructured content
export default {
  name: 'jsonPost',
  type: 'document',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'slug', type: 'slug' },
    { name: 'contentJSON', type: 'text' }, // Complete recipe as JSON
    // Minimal fields for management
  ]
}
```

### Schema Evolution Strategy

```javascript
// sanity/schemas/migrations/schema-versioning.js
export class SchemaVersioning {
  constructor() {
    this.version = '2.0.0'
    this.migrations = new Map()
  }
  
  // Register migration strategies
  registerMigration(fromVersion, toVersion, migrationFn) {
    const key = `${fromVersion}->${toVersion}`
    this.migrations.set(key, migrationFn)
  }
  
  // Safe schema evolution
  async evolveSchema(document, targetVersion) {
    const currentVersion = document._version || '1.0.0'
    
    if (currentVersion === targetVersion) {
      return document
    }
    
    // Find migration path
    const path = this.findMigrationPath(currentVersion, targetVersion)
    
    // Apply migrations sequentially
    let migratedDoc = document
    for (const step of path) {
      const migration = this.migrations.get(step)
      migratedDoc = await migration(migratedDoc)
    }
    
    return {
      ...migratedDoc,
      _version: targetVersion
    }
  }
}

// Example migration
schemaVersioning.registerMigration('1.0.0', '1.1.0', async (doc) => {
  // Add new required fields with defaults
  return {
    ...doc,
    nutritionalInfo: doc.nutritionalInfo || generateDefaultNutrition(doc),
    featured: doc.featured || false,
    tags: doc.tags || extractTags(doc)
  }
})
```

## 📝 Content Creation Workflows

### Multi-Channel Content Entry

```typescript
// lib/content/content-factory.ts
export class ContentFactory {
  // Create from various sources
  async createRecipe(source: ContentSource): Promise<Recipe> {
    switch(source.type) {
      case 'manual':
        return this.createFromStudioInput(source.data)
      
      case 'ai':
        return this.createFromAI(source.prompt)
      
      case 'import':
        return this.createFromImport(source.file)
      
      case 'scrape':
        return this.createFromURL(source.url)
      
      case 'voice':
        return this.createFromVoice(source.audio)
      
      case 'image':
        return this.createFromImage(source.image)
    }
  }
  
  // AI-powered content creation
  async createFromAI(prompt: string): Promise<Recipe> {
    const generated = await this.llm.generateRecipe(prompt)
    
    // Create as jsonPost for flexibility
    const jsonPost = {
      _type: 'jsonPost',
      title: generated.title,
      slug: { current: slugify(generated.title) },
      contentJSON: JSON.stringify(generated),
      // Auto-extract key fields for searchability
      categories: this.extractCategories(generated),
      excerpt: this.generateExcerpt(generated)
    }
    
    return await this.sanityClient.create(jsonPost)
  }
  
  // Voice recipe dictation
  async createFromVoice(audio: Blob): Promise<Recipe> {
    // Transcribe audio
    const transcript = await this.speechToText(audio)
    
    // Parse recipe structure
    const structured = await this.parseRecipeFromText(transcript)
    
    // Allow user to review and edit
    const reviewed = await this.presentForReview(structured)
    
    return await this.sanityClient.create(reviewed)
  }
}
```

### Content Templates System

```javascript
// sanity/templates/recipe-templates.js
export const recipeTemplates = {
  quickMeal: {
    name: 'Quick Weeknight Dinner',
    fields: {
      totalTime: { max: 30 },
      difficulty: 'easy',
      categories: ['quick', 'dinner'],
      template: {
        ingredients: [
          { quantity: null, unit: null, ingredient: 'Protein' },
          { quantity: null, unit: null, ingredient: 'Vegetable' },
          { quantity: null, unit: null, ingredient: 'Starch' }
        ],
        instructions: [
          { stepTitle: 'Prep', directions: 'Prepare all ingredients' },
          { stepTitle: 'Cook', directions: 'Cook protein and vegetables' },
          { stepTitle: 'Serve', directions: 'Plate and serve' }
        ]
      }
    }
  },
  
  bakedGood: {
    name: 'Baking Recipe',
    fields: {
      categories: ['baking', 'dessert'],
      template: {
        ingredientGroups: [
          {
            groupName: 'Dry Ingredients',
            ingredients: [
              { ingredient: 'flour' },
              { ingredient: 'sugar' },
              { ingredient: 'baking powder' }
            ]
          },
          {
            groupName: 'Wet Ingredients',
            ingredients: [
              { ingredient: 'eggs' },
              { ingredient: 'milk' },
              { ingredient: 'butter' }
            ]
          }
        ]
      }
    }
  }
}

// Template application in Studio
export function applyTemplate(templateName: string): Partial<Recipe> {
  const template = recipeTemplates[templateName]
  
  return {
    ...template.fields,
    _templateUsed: templateName,
    _templateVersion: '1.0.0'
  }
}
```

## 🔄 Content Migration Patterns

### Bulk Content Operations

```javascript
// scripts/bulk-content-operations.js
class BulkContentManager {
  constructor(client) {
    this.client = client
    this.batchSize = 100
  }
  
  // Migrate regular posts to JSON posts
  async migrateToJsonPosts(filter = '*[_type == "post"]') {
    const posts = await this.client.fetch(filter)
    
    const migrations = []
    for (const batch of this.chunk(posts, this.batchSize)) {
      const promises = batch.map(post => this.convertToJsonPost(post))
      migrations.push(...await Promise.all(promises))
    }
    
    // Create transaction
    const transaction = this.client.transaction()
    migrations.forEach(doc => transaction.create(doc))
    
    return await transaction.commit()
  }
  
  // Add missing fields to existing content
  async addMissingFields(fieldDefinitions) {
    const documents = await this.client.fetch('*[!defined(nutritionalInfo)]')
    
    const updates = documents.map(doc => ({
      patch: {
        id: doc._id,
        set: {
          nutritionalInfo: this.generateNutrition(doc),
          lastUpdated: new Date().toISOString()
        }
      }
    }))
    
    return await this.client.transaction(updates).commit()
  }
  
  // Content enrichment with AI
  async enrichContent(documentId: string) {
    const doc = await this.client.getDocument(documentId)
    
    const enrichments = await Promise.all([
      this.generateTags(doc),
      this.generateSEOMetadata(doc),
      this.generateRelatedContent(doc),
      this.analyzeNutrition(doc),
      this.generateVariations(doc)
    ])
    
    return await this.client.patch(documentId)
      .set({
        tags: enrichments[0],
        seo: enrichments[1],
        related: enrichments[2],
        nutritionalInfo: enrichments[3],
        variations: enrichments[4]
      })
      .commit()
  }
}
```

### Field Synchronization

```javascript
// scripts/field-synchronization.js
export async function synchronizeFields() {
  const client = getSanityClient()
  
  // Sync categories between post types
  const jsonPosts = await client.fetch(`
    *[_type == "jsonPost"] {
      _id,
      contentJSON
    }
  `)
  
  const updates = []
  
  for (const post of jsonPosts) {
    try {
      const content = JSON.parse(post.contentJSON)
      
      // Extract categories from JSON
      const categories = content.categories || []
      
      // Create category references
      const categoryRefs = await Promise.all(
        categories.map(async (cat) => {
          // Find or create category document
          let categoryDoc = await client.fetch(
            `*[_type == "category" && title == $title][0]`,
            { title: cat }
          )
          
          if (!categoryDoc) {
            categoryDoc = await client.create({
              _type: 'category',
              title: cat,
              slug: { current: slugify(cat) }
            })
          }
          
          return {
            _type: 'reference',
            _ref: categoryDoc._id
          }
        })
      )
      
      updates.push({
        id: post._id,
        categoryRefs: categoryRefs
      })
    } catch (error) {
      console.error(`Failed to sync ${post._id}:`, error)
    }
  }
  
  // Batch update
  const transaction = client.transaction()
  updates.forEach(({ id, categoryRefs }) => {
    transaction.patch(id, { set: { categoryRefs } })
  })
  
  return await transaction.commit()
}
```

## 🎯 Content Validation & Quality

### Multi-Layer Validation

```typescript
// lib/content/validation.ts
export class ContentValidator {
  private validators: Map<string, Validator> = new Map()
  
  constructor() {
    this.registerValidators()
  }
  
  private registerValidators() {
    // Structure validation
    this.validators.set('structure', {
      validate: (doc) => this.validateStructure(doc),
      severity: 'error'
    })
    
    // Content quality
    this.validators.set('quality', {
      validate: (doc) => this.validateQuality(doc),
      severity: 'warning'
    })
    
    // SEO optimization
    this.validators.set('seo', {
      validate: (doc) => this.validateSEO(doc),
      severity: 'info'
    })
    
    // Accessibility
    this.validators.set('accessibility', {
      validate: (doc) => this.validateAccessibility(doc),
      severity: 'warning'
    })
  }
  
  async validateDocument(doc: any): Promise<ValidationResult> {
    const results = await Promise.all(
      Array.from(this.validators.entries()).map(async ([name, validator]) => ({
        name,
        result: await validator.validate(doc),
        severity: validator.severity
      }))
    )
    
    return {
      valid: !results.some(r => r.severity === 'error' && !r.result.valid),
      errors: results.filter(r => r.severity === 'error' && !r.result.valid),
      warnings: results.filter(r => r.severity === 'warning' && !r.result.valid),
      info: results.filter(r => r.severity === 'info'),
      score: this.calculateQualityScore(results)
    }
  }
  
  private async validateQuality(doc: any): Promise<ValidationResult> {
    const checks = []
    
    // Check description length
    if (doc.description?.length < 50) {
      checks.push('Description too short for good SEO')
    }
    
    // Check image quality
    if (!doc.mainImage) {
      checks.push('Missing main image')
    }
    
    // Check instruction clarity
    const instructions = doc.instructions || []
    const unclearSteps = instructions.filter(i => 
      i.directions?.length < 20 || 
      !i.directions?.match(/[.!?]$/)
    )
    
    if (unclearSteps.length > 0) {
      checks.push(`${unclearSteps.length} instructions need more detail`)
    }
    
    // Check nutritional info
    if (!doc.nutritionalInfo) {
      checks.push('Missing nutritional information')
    }
    
    return {
      valid: checks.length === 0,
      issues: checks,
      suggestions: await this.generateSuggestions(doc, checks)
    }
  }
}
```

### Content Scoring System

```typescript
// lib/content/scoring.ts
export class ContentScorer {
  scoreRecipe(recipe: Recipe): RecipeScore {
    const scores = {
      completeness: this.scoreCompleteness(recipe),
      clarity: this.scoreClarity(recipe),
      seo: this.scoreSEO(recipe),
      engagement: this.scoreEngagement(recipe),
      uniqueness: this.scoreUniqueness(recipe)
    }
    
    const overall = Object.values(scores).reduce((a, b) => a + b, 0) / 
                   Object.keys(scores).length
    
    return {
      overall: Math.round(overall),
      breakdown: scores,
      grade: this.getGrade(overall),
      improvements: this.suggestImprovements(scores)
    }
  }
  
  private scoreCompleteness(recipe: Recipe): number {
    const requiredFields = [
      'title', 'description', 'ingredients', 'instructions',
      'prepTime', 'cookTime', 'servings', 'difficulty'
    ]
    
    const optionalFields = [
      'nutritionalInfo', 'tips', 'variations', 'storageInstructions',
      'equipment', 'video', 'allergenInfo', 'tags'
    ]
    
    const requiredScore = requiredFields.filter(f => recipe[f]).length / 
                         requiredFields.length * 60
    
    const optionalScore = optionalFields.filter(f => recipe[f]).length / 
                         optionalFields.length * 40
    
    return requiredScore + optionalScore
  }
  
  private scoreClarity(recipe: Recipe): number {
    let score = 100
    
    // Check instruction clarity
    recipe.instructions?.forEach(instruction => {
      if (instruction.directions.length < 30) score -= 5
      if (!instruction.directions.includes(' ')) score -= 10
      if (instruction.tipForStep) score += 2
    })
    
    // Check ingredient specificity
    recipe.ingredients?.forEach(ingredient => {
      if (!ingredient.quantity) score -= 2
      if (!ingredient.unit) score -= 2
      if (ingredient.notes) score += 1
    })
    
    return Math.max(0, Math.min(100, score))
  }
}
```

## 🔍 Advanced Querying

### GROQ Query Optimization

```javascript
// lib/queries/advanced-queries.ts
export const advancedQueries = {
  // Efficient category counts with projection
  categoriesWithCounts: `
    *[_type == "category"] {
      _id,
      title,
      slug,
      "count": count(*[_type in ["post", "jsonPost"] && references(^._id)])
    } | order(count desc)
  `,
  
  // Related recipes with scoring
  relatedRecipes: `
    *[_type in ["post", "jsonPost"] && _id != $currentId] {
      _id,
      title,
      slug,
      "score": (
        count(categories[@] in $currentCategories) * 3 +
        count(tags[@] in $currentTags) * 2 +
        select(cuisineType == $currentCuisine => 5, 0) +
        select(difficulty == $currentDifficulty => 2, 0)
      )
    } | order(score desc) [0...6]
  `,
  
  // Trending recipes with time decay
  trendingRecipes: `
    *[_type in ["post", "jsonPost"]] {
      _id,
      title,
      slug,
      _createdAt,
      "popularity": coalesce(views, 0) + coalesce(saves, 0) * 2 + coalesce(shares, 0) * 3,
      "recency": dateTime(_createdAt) > dateTime(now()) - 60*60*24*30*1000,
      "score": popularity * select(recency => 1.5, 1.0)
    } | order(score desc) [0...10]
  `,
  
  // Smart search with fuzzy matching
  smartSearch: `
    *[_type in ["post", "jsonPost"]] [
      title match $query ||
      description match $query ||
      pt::text(body) match $query ||
      $query in categories[] ||
      $query in tags[]
    ] {
      _id,
      title,
      description,
      "relevance": select(
        title match $query => 10,
        description match $query => 5,
        $query in tags[] => 3,
        1
      )
    } | order(relevance desc)
  `
}
```

### Query Performance Monitoring

```typescript
// lib/queries/query-monitor.ts
export class QueryMonitor {
  private metrics: Map<string, QueryMetrics> = new Map()
  
  async executeWithMetrics<T>(
    query: string,
    params?: any
  ): Promise<{ data: T; metrics: QueryMetrics }> {
    const startTime = performance.now()
    const startMemory = process.memoryUsage()
    
    try {
      const data = await this.client.fetch<T>(query, params)
      
      const metrics: QueryMetrics = {
        query: query.substring(0, 100),
        executionTime: performance.now() - startTime,
        resultCount: Array.isArray(data) ? data.length : 1,
        memoryUsed: process.memoryUsage().heapUsed - startMemory.heapUsed,
        timestamp: new Date(),
        cached: false // Will be set by cache layer
      }
      
      this.recordMetrics(query, metrics)
      
      return { data, metrics }
    } catch (error) {
      this.recordError(query, error)
      throw error
    }
  }
  
  getSlowQueries(threshold = 1000): QueryMetrics[] {
    return Array.from(this.metrics.values())
      .filter(m => m.executionTime > threshold)
      .sort((a, b) => b.executionTime - a.executionTime)
  }
  
  suggestOptimizations(query: string): Optimization[] {
    const suggestions = []
    
    // Check for missing projections
    if (!query.includes('{') && query.includes('*[')) {
      suggestions.push({
        type: 'projection',
        message: 'Add projection to limit returned fields',
        example: query.replace(']', '] { _id, title, ... }')
      })
    }
    
    // Check for missing limits
    if (!query.includes('[0...') && !query.includes('[0..')) {
      suggestions.push({
        type: 'limit',
        message: 'Add limit to prevent fetching all documents',
        example: query + ' [0...10]'
      })
    }
    
    // Check for expensive operations
    if (query.includes('count(*)')) {
      suggestions.push({
        type: 'performance',
        message: 'Consider caching count queries',
        severity: 'warning'
      })
    }
    
    return suggestions
  }
}
```

## 🎨 Content Presentation Layer

### Dynamic Content Adaptation

```typescript
// lib/content/content-adapter.ts
export class ContentAdapter {
  // Adapt content for different contexts
  adaptForContext(
    content: Recipe,
    context: PresentationContext
  ): AdaptedContent {
    switch(context.type) {
      case 'card':
        return this.adaptForCard(content)
      
      case 'detail':
        return this.adaptForDetail(content)
      
      case 'print':
        return this.adaptForPrint(content)
      
      case 'voice':
        return this.adaptForVoice(content)
      
      case 'api':
        return this.adaptForAPI(content)
      
      case 'social':
        return this.adaptForSocial(content, context.platform)
    }
  }
  
  private adaptForSocial(
    content: Recipe,
    platform: 'instagram' | 'pinterest' | 'facebook'
  ): SocialContent {
    const adapted = {
      instagram: {
        image: this.generateSquareImage(content.mainImage),
        caption: this.truncate(content.description, 2200),
        hashtags: this.generateHashtags(content, 30),
        altText: this.generateAltText(content)
      },
      pinterest: {
        image: this.generateVerticalImage(content.mainImage),
        title: content.title,
        description: this.truncate(content.description, 500),
        link: this.generateLink(content)
      },
      facebook: {
        title: content.title,
        description: content.description,
        image: content.mainImage,
        cta: 'Get Recipe',
        link: this.generateLink(content)
      }
    }
    
    return adapted[platform]
  }
}
```

## 📊 Content Analytics

### Content Performance Tracking

```typescript
// lib/analytics/content-analytics.ts
export class ContentAnalytics {
  async trackContentPerformance(contentId: string): Promise<PerformanceMetrics> {
    const [
      views,
      engagement,
      conversions,
      social
    ] = await Promise.all([
      this.getViewMetrics(contentId),
      this.getEngagementMetrics(contentId),
      this.getConversionMetrics(contentId),
      this.getSocialMetrics(contentId)
    ])
    
    return {
      views: views,
      engagement: {
        avgTimeOnPage: engagement.totalTime / views.total,
        scrollDepth: engagement.avgScrollDepth,
        interactions: engagement.interactions
      },
      conversions: {
        saves: conversions.saves,
        prints: conversions.prints,
        shares: conversions.shares,
        cooksInitiated: conversions.cookingModeStarts
      },
      social: {
        likes: social.likes,
        comments: social.comments,
        shares: social.shares,
        reach: social.estimatedReach
      },
      score: this.calculatePerformanceScore(views, engagement, conversions)
    }
  }
  
  async getContentInsights(contentId: string): Promise<ContentInsights> {
    const performance = await this.trackContentPerformance(contentId)
    
    return {
      performance,
      recommendations: this.generateRecommendations(performance),
      comparisons: await this.compareToSimilar(contentId, performance),
      trends: await this.analyzeTrends(contentId),
      predictions: await this.predictFuturePerformance(performance)
    }
  }
}
```

## 🔐 Content Governance

### Version Control & Rollback

```typescript
// lib/content/version-control.ts
export class ContentVersionControl {
  async createVersion(documentId: string, reason?: string): Promise<Version> {
    const document = await this.client.getDocument(documentId)
    
    const version = {
      _type: 'version',
      documentId: documentId,
      documentType: document._type,
      content: document,
      reason: reason,
      createdAt: new Date().toISOString(),
      createdBy: this.getCurrentUser()
    }
    
    return await this.client.create(version)
  }
  
  async rollback(documentId: string, versionId: string): Promise<any> {
    const version = await this.client.getDocument(versionId)
    
    if (!version || version._type !== 'version') {
      throw new Error('Invalid version ID')
    }
    
    // Create backup of current state
    await this.createVersion(documentId, 'Pre-rollback backup')
    
    // Restore versioned content
    const { _id, _type, _createdAt, _updatedAt, ...content } = version.content
    
    return await this.client
      .patch(documentId)
      .set(content)
      .commit()
  }
  
  async compareVersions(v1: string, v2: string): Promise<Diff[]> {
    const [version1, version2] = await Promise.all([
      this.client.getDocument(v1),
      this.client.getDocument(v2)
    ])
    
    return this.generateDiff(version1.content, version2.content)
  }
}
```

## 🚀 Content Delivery Optimization

### Multi-CDN Strategy

```typescript
// lib/content/cdn-strategy.ts
export class CDNStrategy {
  private cdns = [
    { name: 'sanity', priority: 1, endpoint: 'cdn.sanity.io' },
    { name: 'cloudflare', priority: 2, endpoint: 'cdn.cloudflare.com' },
    { name: 'fastly', priority: 3, endpoint: 'cdn.fastly.net' }
  ]
  
  async getOptimalCDN(userLocation: Location): Promise<CDN> {
    const latencies = await Promise.all(
      this.cdns.map(cdn => this.measureLatency(cdn, userLocation))
    )
    
    return latencies.sort((a, b) => a.latency - b.latency)[0].cdn
  }
  
  async deliverContent(
    content: Content,
    userContext: UserContext
  ): Promise<DeliveredContent> {
    const cdn = await this.getOptimalCDN(userContext.location)
    
    // Optimize based on device
    const optimized = await this.optimizeForDevice(content, userContext.device)
    
    // Apply edge transformations
    const transformed = await this.applyEdgeTransforms(optimized, {
      cdn,
      transforms: [
        { type: 'resize', params: userContext.viewport },
        { type: 'compress', params: { quality: 85 } },
        { type: 'format', params: { format: 'webp' } }
      ]
    })
    
    return {
      content: transformed,
      cdn: cdn.name,
      cacheHeaders: this.generateCacheHeaders(content),
      etag: this.generateETag(transformed)
    }
  }
}
```

## Conclusion

The advanced content management capabilities in EATS demonstrate how traditional CMS features can be enhanced with modern patterns like dual-content systems, AI integration, and sophisticated validation. The architecture ensures content remains flexible, searchable, and performant while supporting both human creators and AI-generated content seamlessly. These patterns can be adapted for any content-rich application requiring sophisticated content management capabilities.