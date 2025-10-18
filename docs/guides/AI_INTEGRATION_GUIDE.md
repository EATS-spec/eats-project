# AI Integration Guide for EATS

## Overview

The EATS platform is architected with AI integration at its core, featuring a unique dual-content system that seamlessly handles both human-created and AI-generated recipes. This guide explores the current AI capabilities and provides patterns for enhanced AI integration.

## Current AI-Ready Infrastructure

### 1. JSON Post Type - The AI Gateway

The `jsonPost` schema is specifically designed for AI-generated content:

```javascript
// sanity/schemaTypes/jsonPost.js
{
  name: 'jsonPost',
  fields: [
    {
      name: 'contentJSON',
      type: 'text',
      description: 'Paste your pre-formatted JSON directly here'
    }
  ]
}
```

**Why This Design Works for AI**:
- **Single Field Input**: LLMs can generate complete recipes in one JSON response
- **No Field Mapping**: Eliminates the need to parse AI output into multiple fields
- **Validation Built-in**: JSON validation ensures structural integrity
- **Backward Compatible**: Post Adapter handles conversion seamlessly

### 2. Post Adapter - The Intelligence Layer

```typescript
// lib/adapters/post-adapter.ts
export function adaptToPost(doc: unknown): Post | null {
  // Intelligent type detection
  if (doc._type === 'jsonPost') {
    return convertJsonPost(doc)
  }
  // Handles both content types transparently
}
```

The adapter provides:
- **Format Agnostic**: Frontend doesn't need to know content source
- **Error Recovery**: Handles incomplete AI-generated content
- **Performance Monitoring**: Track AI content quality
- **Real-time Analytics**: Monitor at `/dev/adapter-monitor`

## AI Content Generation Workflows

### Workflow 1: Direct LLM to Sanity

```mermaid
graph LR
    A[LLM API] -->|JSON Recipe| B[Your Script]
    B -->|Sanity Client| C[Create jsonPost]
    C --> D[Sanity CMS]
    D --> E[Frontend Display]
```

**Implementation Example**:
```javascript
// scripts/ai-recipe-generator.js
import { Configuration, OpenAIApi } from 'openai'
import { createClient } from '@sanity/client'

const openai = new OpenAIApi(configuration)
const sanityClient = createClient({
  projectId: '5r8ri1sg',
  dataset: 'production',
  token: process.env.SANITY_API_TOKEN
})

async function generateAndStoreRecipe(prompt) {
  // Generate recipe with GPT-4
  const completion = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [{
      role: "system",
      content: "Generate a recipe in JSON format with title, description, ingredients, instructions, etc."
    }, {
      role: "user",
      content: prompt
    }]
  })
  
  const recipeJson = completion.data.choices[0].message.content
  
  // Store in Sanity
  const doc = await sanityClient.create({
    _type: 'jsonPost',
    title: JSON.parse(recipeJson).title,
    slug: { current: slugify(JSON.parse(recipeJson).title) },
    contentJSON: recipeJson
  })
  
  return doc
}
```

### Workflow 2: Bulk AI Content Import

```javascript
// scripts/bulk-ai-import.js
async function bulkGenerateRecipes(themes) {
  const recipes = []
  
  for (const theme of themes) {
    const prompt = `Create a ${theme} recipe suitable for home cooking`
    const recipe = await generateRecipe(prompt)
    recipes.push(recipe)
    
    // Rate limiting
    await sleep(1000)
  }
  
  // Bulk create in Sanity
  const documents = recipes.map(recipe => ({
    _type: 'jsonPost',
    title: recipe.title,
    slug: { current: slugify(recipe.title) },
    contentJSON: JSON.stringify(recipe)
  }))
  
  await sanityClient.create(documents)
}
```

### Workflow 3: Recipe Variations & Adaptations

```typescript
// lib/ai/recipe-variations.ts
export async function generateVariation(
  originalRecipe: Post,
  modification: string
): Promise<Post> {
  const prompt = `
    Original Recipe: ${JSON.stringify(originalRecipe)}
    Modification Request: ${modification}
    
    Generate a modified version of this recipe that ${modification}.
    Maintain the same JSON structure.
  `
  
  const variation = await callLLM(prompt)
  return adaptToPost(variation)
}

// Usage examples:
await generateVariation(recipe, "make it vegan")
await generateVariation(recipe, "reduce to 2 servings")
await generateVariation(recipe, "make it gluten-free")
```

## AI Prompt Engineering for Recipes

### Structured Recipe Prompt Template

```typescript
const RECIPE_GENERATION_PROMPT = `
Generate a detailed recipe in the following JSON structure:

{
  "title": "Recipe Name",
  "description": "Brief description",
  "slug": "url-friendly-slug",
  "categories": ["Category1", "Category2"],
  "cuisineType": "Cuisine",
  "prepTime": 15,
  "cookTime": 30,
  "totalTime": 45,
  "servings": 4,
  "difficulty": "easy|medium|hard",
  "ingredients": [
    {
      "quantity": 2,
      "unit": "cups",
      "ingredient": "ingredient name",
      "notes": "optional notes"
    }
  ],
  "instructions": [
    {
      "stepTitle": "Step 1",
      "directions": "Detailed instructions",
      "tipForStep": "Optional tip",
      "timingForStep": "5 minutes"
    }
  ],
  "nutritionalInfo": {
    "calories": 250,
    "protein": "15g",
    "carbohydrates": "30g",
    "fat": "10g",
    "fiber": "5g"
  },
  "tips": ["Tip 1", "Tip 2"],
  "tags": ["tag1", "tag2"],
  "keywords": ["keyword1", "keyword2"],
  "equipment": ["Equipment needed"],
  "storageInstructions": "How to store"
}

Recipe Requirements:
${requirements}
`
```

### Category-Specific Prompts

```javascript
const PROMPT_TEMPLATES = {
  healthy: `Create a healthy recipe with:
    - Under 500 calories per serving
    - High protein (>20g)
    - Vegetables as main ingredients
    - Minimal processed ingredients`,
    
  quickMeal: `Create a quick recipe with:
    - Total time under 30 minutes
    - Common pantry ingredients
    - Minimal prep work
    - One-pot or one-pan if possible`,
    
  dessert: `Create a dessert recipe with:
    - Clear difficulty level
    - Make-ahead instructions
    - Serving suggestions
    - Storage instructions`,
    
  aiExperimental: `Create an innovative fusion recipe combining:
    - ${cuisine1} and ${cuisine2} elements
    - Unexpected ingredient pairings
    - Modern cooking techniques
    - Instagram-worthy presentation`
}
```

## AI-Powered Features Implementation

### 1. Smart Recipe Search with Embeddings

```typescript
// lib/ai/semantic-search.ts
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'

export async function semanticRecipeSearch(query: string) {
  // Generate embedding for search query
  const embeddings = new OpenAIEmbeddings()
  const queryEmbedding = await embeddings.embedQuery(query)
  
  // Search against pre-computed recipe embeddings
  const results = await searchVectorDatabase(queryEmbedding)
  
  return results.map(r => r.recipe)
}

// Usage: "Find me something cozy for winter"
// Returns: Soups, stews, comfort foods
```

### 2. Intelligent Substitutions

```typescript
// lib/ai/substitutions.ts
export async function getSubstitutions(ingredient: string, context: Recipe) {
  const prompt = `
    Ingredient: ${ingredient}
    Recipe Type: ${context.cuisineType}
    Dietary Restrictions: ${context.dietaryInfo}
    
    Suggest 3 substitutions with:
    1. Same category (best match)
    2. Different but compatible
    3. Creative alternative
    
    Consider flavor profile, texture, and cooking method.
  `
  
  return await generateAIResponse(prompt)
}
```

### 3. Personalized Meal Planning

```typescript
// lib/ai/meal-planning.ts
interface UserPreferences {
  dietaryRestrictions: string[]
  cuisinePreferences: string[]
  cookingSkill: 'beginner' | 'intermediate' | 'advanced'
  timeConstraints: number // minutes available
  servingSize: number
}

export async function generateWeeklyMealPlan(
  preferences: UserPreferences,
  existingRecipes: Post[]
): Promise<MealPlan> {
  const prompt = buildMealPlanPrompt(preferences, existingRecipes)
  const plan = await generateAIResponse(prompt)
  
  // Match AI suggestions to existing recipes
  return matchRecipesToPlan(plan, existingRecipes)
}
```

### 4. Recipe Analysis & Optimization

```typescript
// lib/ai/recipe-analysis.ts
export async function analyzeRecipe(recipe: Post) {
  const analysis = await generateAIResponse(`
    Analyze this recipe and provide:
    1. Nutritional assessment
    2. Difficulty rating with reasoning
    3. Cost estimate (budget-friendly, moderate, expensive)
    4. Time-saving suggestions
    5. Healthier alternatives
    6. Skill techniques used
    
    Recipe: ${JSON.stringify(recipe)}
  `)
  
  return {
    ...analysis,
    improvementSuggestions: analysis.suggestions,
    nutritionScore: calculateNutritionScore(analysis.nutrition)
  }
}
```

## Advanced AI Integration Patterns

### 1. Conversational Recipe Assistant

```typescript
// components/ai/RecipeChat.tsx
export function RecipeChat({ recipe }: { recipe: Post }) {
  const [messages, setMessages] = useState<Message[]>([])
  
  const handleQuestion = async (question: string) => {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        question,
        context: recipe,
        history: messages
      })
    })
    
    const answer = await response.json()
    setMessages([...messages, 
      { role: 'user', content: question },
      { role: 'assistant', content: answer }
    ])
  }
  
  // UI for chat interface
}
```

### 2. Visual Recipe Generation

```typescript
// lib/ai/visual-generation.ts
export async function generateFromImage(imageUrl: string) {
  // Use GPT-4 Vision to analyze food image
  const analysis = await analyzeImage(imageUrl)
  
  // Generate recipe based on visual analysis
  const recipe = await generateRecipe({
    identifiedIngredients: analysis.ingredients,
    cookingMethod: analysis.method,
    cuisine: analysis.cuisine
  })
  
  return recipe
}
```

### 3. Recipe Evolution System

```typescript
// lib/ai/recipe-evolution.ts
export class RecipeEvolution {
  async evolve(
    baseRecipe: Post,
    feedback: UserFeedback[],
    iterations: number = 3
  ): Promise<Post[]> {
    const versions = [baseRecipe]
    
    for (let i = 0; i < iterations; i++) {
      const improvements = await this.analyzeeFeedback(feedback)
      const newVersion = await this.generateImprovedVersion(
        versions[versions.length - 1],
        improvements
      )
      versions.push(newVersion)
    }
    
    return versions
  }
}
```

## AI Content Quality Assurance

### Validation Pipeline

```typescript
// lib/ai/content-validation.ts
export async function validateAIContent(recipe: any): Promise<ValidationResult> {
  const checks = [
    validateStructure(recipe),
    validateIngredientLogic(recipe),
    validateInstructionFlow(recipe),
    validateNutritionRanges(recipe),
    checkForHallucinations(recipe)
  ]
  
  const results = await Promise.all(checks)
  
  return {
    isValid: results.every(r => r.passed),
    issues: results.filter(r => !r.passed),
    qualityScore: calculateQualityScore(results)
  }
}
```

### Hallucination Detection

```typescript
// lib/ai/hallucination-check.ts
const IMPOSSIBLE_COMBINATIONS = [
  ['ice cream', 'deep fry'],
  ['raw chicken', 'serve immediately'],
  // ... more patterns
]

export function checkForHallucinations(recipe: Recipe): ValidationResult {
  const issues = []
  
  // Check cooking times
  if (recipe.cookTime < 5 && recipe.ingredients.includes('raw meat')) {
    issues.push('Insufficient cooking time for meat')
  }
  
  // Check impossible combinations
  for (const [ingredient, method] of IMPOSSIBLE_COMBINATIONS) {
    if (recipe.ingredients.includes(ingredient) && 
        recipe.instructions.includes(method)) {
      issues.push(`Invalid combination: ${ingredient} with ${method}`)
    }
  }
  
  return {
    passed: issues.length === 0,
    issues
  }
}
```

## Monitoring AI Content Performance

### Analytics Dashboard Integration

```typescript
// app/api/ai/analytics/route.ts
export async function GET() {
  const stats = await getAIContentStats()
  
  return Response.json({
    totalAIRecipes: stats.total,
    averageQualityScore: stats.avgQuality,
    userEngagement: {
      views: stats.views,
      saves: stats.saves,
      rating: stats.avgRating
    },
    conversionMetrics: {
      aiToManualEdits: stats.edits,
      regenerationRate: stats.regenerations
    },
    popularCategories: stats.topCategories,
    feedbackSummary: stats.feedback
  })
}
```

## Best Practices for AI Integration

### 1. Content Guidelines
- Always validate AI-generated JSON structure
- Implement retry logic with different prompts
- Store both original and processed versions
- Track generation metadata (model, prompt, timestamp)

### 2. Rate Limiting & Costs
```typescript
// lib/ai/rate-limiter.ts
const limiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60000, // 1 minute
  costTracking: true,
  maxDailyCost: 50.00
})
```

### 3. Caching Strategy
```typescript
// Cache AI responses to reduce API calls
const cacheKey = `ai:recipe:${hashPrompt(prompt)}`
const cached = await redis.get(cacheKey)
if (cached) return cached

const result = await generateRecipe(prompt)
await redis.set(cacheKey, result, 'EX', 86400) // 24 hours
```

### 4. Error Handling
```typescript
try {
  const recipe = await generateAIRecipe(prompt)
  if (!validateRecipe(recipe)) {
    // Fallback to template-based generation
    return generateFromTemplate(requirements)
  }
  return recipe
} catch (error) {
  logger.error('AI generation failed', error)
  // Return curated fallback
  return getFallbackRecipe(requirements)
}
```

## Future AI Capabilities

### Coming Soon
1. **Voice Recipe Creation**: Speak your recipe idea
2. **Image-to-Recipe**: Upload food photo, get recipe
3. **Nutrition Optimization**: AI adjusts for health goals
4. **Flavor Pairing AI**: Suggest ingredient combinations
5. **Cooking Skill Adaptation**: Adjust complexity automatically

### Experimental Features
1. **AR Cooking Guide**: AI-powered augmented reality
2. **Taste Prediction**: ML model for flavor success
3. **Seasonal Adaptation**: Auto-adjust for ingredients
4. **Cultural Fusion**: AI creates authentic fusion recipes
5. **Zero-Waste Recipes**: Use your leftovers intelligently

## Conclusion

The EATS platform's AI integration represents a paradigm shift in recipe content management. By combining traditional CMS capabilities with AI-ready infrastructure, it enables unprecedented scalability and innovation in culinary content creation. The dual-content system ensures that both human creativity and AI efficiency can coexist and complement each other, creating a richer experience for end users.