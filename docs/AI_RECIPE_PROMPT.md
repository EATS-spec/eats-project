# AI Recipe Generation Prompt Template

This document provides prompt templates and JSON structure for generating recipes with AI (GPT-4, Claude, etc.) that can be directly imported into Sanity CMS.

## Quick Start

Copy this prompt to generate a recipe:

```
Generate a recipe for [DISH NAME] in JSON format following this structure:

{
  "title": "Recipe Title",
  "description": "Brief description under 300 characters",
  "introduction": "Opening paragraph about the recipe",

  "prepTime": 15,
  "cookTime": 30,
  "servings": "4-6",
  "difficulty": "easy",
  "cuisineType": "Italian",
  "dietaryTags": ["vegetarian"],
  "cost": "moderate",

  "ingredientSections": [
    {
      "sectionTitle": null,
      "items": [
        { "text": "2 cups all-purpose flour", "optional": false },
        { "text": "1 tsp vanilla extract", "optional": true }
      ]
    }
  ],

  "steps": [
    { "instruction": "Preheat oven to 375°F (190°C).", "tip": null },
    { "instruction": "Mix dry ingredients in a bowl.", "tip": "Sift flour for lighter texture" }
  ],

  "tips": ["Can be made ahead"],
  "storageInstructions": "Store in airtight container for up to 5 days",
  "equipmentText": ["mixing bowl", "whisk", "9x13 baking pan"],
  "tags": ["comfort food", "weeknight"],
  "keywords": ["pasta", "quick dinner"],

  "nutrition": {
    "calories": 350,
    "protein": 12,
    "carbs": 45,
    "fat": 14,
    "fiber": 3
  },

  "author": {
    "name": "Chef Name"
  }
}

RULES:
1. Ingredients must be full natural language strings: "2 cups all-purpose flour, sifted"
2. Include quantities, units, and preparation notes in the ingredient text
3. Steps should be clear, actionable instructions
4. All times in minutes as numbers
5. Servings as descriptive string (can be "4-6", "12 cookies", etc.)
```

---

## Complete JSON Schema Reference

### Core Fields (Required)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `title` | string | Recipe name (max 100 chars) | `"Classic Chocolate Chip Cookies"` |
| `ingredientSections` | array | At least one section with items | See below |
| `steps` | array | At least one instruction step | See below |

### Core Fields (Optional)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `description` | string | Brief description (max 300 chars) | `"Chewy cookies with crispy edges"` |
| `introduction` | string | Opening paragraph | `"These cookies remind me of..."` |

### Metadata Fields

| Field | Type | Values | Example |
|-------|------|--------|---------|
| `prepTime` | number | Minutes (0-1440) | `15` |
| `cookTime` | number | Minutes (0-1440) | `30` |
| `totalTime` | number | Minutes (auto-calculated if omitted) | `45` |
| `servings` | string | Flexible format | `"4-6"`, `"12 cookies"` |
| `difficulty` | string | `easy`, `medium`, `hard` | `"medium"` |
| `cuisineType` | string | Any cuisine | `"Italian"`, `"Thai"` |
| `dietaryTags` | array | Diet labels | `["vegetarian", "gluten-free"]` |
| `cost` | string | `budget`, `moderate`, `expensive` | `"budget"` |

### Ingredient Structure

```json
{
  "ingredientSections": [
    {
      "sectionTitle": "For the crust",
      "items": [
        {
          "text": "2 cups all-purpose flour, sifted",
          "optional": false
        },
        {
          "text": "1/2 tsp salt",
          "optional": false
        }
      ]
    },
    {
      "sectionTitle": "For the filling",
      "items": [
        {
          "text": "3 cups fresh blueberries",
          "optional": false
        },
        {
          "text": "Zest of 1 lemon",
          "optional": true
        }
      ]
    }
  ]
}
```

**Key Points:**
- Use `null` for `sectionTitle` if there's only one section
- `text` should be complete natural language: quantity + unit + ingredient + notes
- Mark garnishes or flavor enhancers as `optional: true`

### Instruction Structure

```json
{
  "steps": [
    {
      "instruction": "Preheat the oven to 375°F (190°C) and line a baking sheet with parchment paper.",
      "tip": null
    },
    {
      "instruction": "In a large bowl, whisk together the flour, baking soda, and salt.",
      "tip": "Sifting the flour results in a lighter texture"
    },
    {
      "instruction": "Bake for 12-14 minutes until edges are golden but centers look slightly underdone.",
      "tip": "They will firm up as they cool"
    }
  ]
}
```

**Key Points:**
- Each step should be a single, clear action
- Include temperatures, times, and visual cues
- Use `tip` for pro tips related to that specific step

### Additional Content

```json
{
  "tips": [
    "Can be made ahead and frozen for up to 3 months",
    "Substitute butter with coconut oil for a dairy-free version",
    "Add a sprinkle of flaky sea salt before baking"
  ],
  "storageInstructions": "Store in an airtight container at room temperature for up to 5 days. Freeze baked cookies for up to 3 months.",
  "equipmentText": [
    "stand mixer or hand mixer",
    "baking sheets",
    "parchment paper",
    "wire cooling rack"
  ],
  "tags": [
    "dessert",
    "baking",
    "cookies",
    "make-ahead"
  ],
  "keywords": [
    "chocolate chip cookies",
    "cookie recipe",
    "homemade cookies"
  ]
}
```

### Nutrition

```json
{
  "nutrition": {
    "calories": 180,
    "protein": 2,
    "carbs": 24,
    "fat": 9,
    "fiber": 1,
    "sodium": 95,
    "notes": "Per cookie, based on 24 cookies"
  }
}
```

### Author

```json
{
  "author": {
    "name": "Sarah Mitchell",
    "bio": "Professional pastry chef with 15 years of experience"
  }
}
```

---

## Diet Tag Reference

Use these values for `dietaryTags`:

| Tag | Description |
|-----|-------------|
| `vegetarian` | No meat or fish |
| `vegan` | No animal products |
| `gluten-free` | No gluten-containing ingredients |
| `dairy-free` | No dairy products |
| `keto` | Low carb, high fat |
| `paleo` | Paleo diet compliant |
| `low-carb` | Reduced carbohydrates |
| `nut-free` | No tree nuts or peanuts |
| `soy-free` | No soy products |

---

## Cuisine Type Reference

Common values for `cuisineType`:

- American
- Italian
- Mexican
- Chinese
- Japanese
- Thai
- Indian
- French
- Mediterranean
- Middle Eastern
- Korean
- Vietnamese
- Greek
- Spanish
- Other

---

## Full Example: Complete Recipe

```json
{
  "title": "Classic Margherita Pizza",
  "description": "Traditional Neapolitan-style pizza with fresh tomatoes, mozzarella, and basil on a perfectly chewy crust.",
  "introduction": "This Margherita pizza honors the classic Italian tradition dating back to 1889 Naples. The key is simplicity: quality ingredients, high heat, and restraint. Don't overload the toppings—let each element shine.",

  "prepTime": 30,
  "cookTime": 15,
  "totalTime": 45,
  "servings": "2 pizzas (4 servings)",
  "difficulty": "medium",
  "cuisineType": "Italian",
  "dietaryTags": ["vegetarian"],
  "cost": "moderate",

  "ingredientSections": [
    {
      "sectionTitle": "For the dough",
      "items": [
        { "text": "3 1/2 cups (450g) bread flour, plus more for dusting", "optional": false },
        { "text": "1 1/2 tsp instant yeast", "optional": false },
        { "text": "1 1/2 tsp fine sea salt", "optional": false },
        { "text": "1 1/4 cups (300ml) warm water", "optional": false },
        { "text": "1 tbsp olive oil", "optional": false }
      ]
    },
    {
      "sectionTitle": "For the topping",
      "items": [
        { "text": "1 can (14oz) San Marzano tomatoes, crushed by hand", "optional": false },
        { "text": "8 oz fresh mozzarella, torn into pieces", "optional": false },
        { "text": "Fresh basil leaves", "optional": false },
        { "text": "2 tbsp extra virgin olive oil", "optional": false },
        { "text": "Flaky sea salt, to finish", "optional": true }
      ]
    }
  ],

  "steps": [
    {
      "instruction": "In a large bowl, combine flour, yeast, and salt. Add warm water and olive oil, stirring until a shaggy dough forms.",
      "tip": "Water should be warm (about 110°F) but not hot—hot water kills yeast"
    },
    {
      "instruction": "Turn dough onto a floured surface and knead for 8-10 minutes until smooth and elastic.",
      "tip": "The dough should bounce back when poked"
    },
    {
      "instruction": "Place dough in an oiled bowl, cover with plastic wrap, and let rise in a warm place for 1-2 hours until doubled.",
      "tip": null
    },
    {
      "instruction": "Preheat oven to its highest setting (500°F/260°C or higher) with a pizza stone or inverted baking sheet inside for at least 30 minutes.",
      "tip": "A properly preheated stone is the secret to restaurant-quality crust"
    },
    {
      "instruction": "Divide dough in half. On a floured surface, stretch each piece into a 12-inch round, leaving edges slightly thicker for the crust.",
      "tip": "Use your knuckles to stretch from the center outward—don't use a rolling pin"
    },
    {
      "instruction": "Spread a thin layer of crushed tomatoes over each round, leaving a 1/2 inch border. Distribute mozzarella evenly.",
      "tip": "Less is more—too much sauce makes the pizza soggy"
    },
    {
      "instruction": "Carefully transfer pizza to the hot stone and bake for 8-12 minutes until crust is golden and cheese is bubbling with charred spots.",
      "tip": null
    },
    {
      "instruction": "Remove from oven, top with fresh basil, drizzle with olive oil, and sprinkle with flaky salt. Slice and serve immediately.",
      "tip": null
    }
  ],

  "tips": [
    "For best results, make the dough a day ahead and let it cold-ferment in the refrigerator for deeper flavor",
    "If you don't have a pizza stone, a cast iron skillet preheated in the oven works well",
    "San Marzano tomatoes are worth seeking out—they're sweeter and less acidic than regular canned tomatoes"
  ],
  "storageInstructions": "Pizza dough can be refrigerated for up to 3 days or frozen for up to 3 months. Baked pizza is best eaten immediately but can be refrigerated and reheated in a hot skillet.",
  "equipmentText": [
    "pizza stone or baking steel",
    "pizza peel or flat baking sheet",
    "large mixing bowl",
    "bench scraper"
  ],
  "tags": [
    "pizza",
    "Italian",
    "vegetarian",
    "weekend project",
    "date night"
  ],
  "keywords": [
    "margherita pizza",
    "homemade pizza",
    "pizza dough",
    "Neapolitan pizza"
  ],

  "nutrition": {
    "calories": 420,
    "protein": 18,
    "carbs": 52,
    "fat": 16,
    "fiber": 3,
    "sodium": 890,
    "notes": "Per serving (1/4 of recipe)"
  },

  "author": {
    "name": "EATS Kitchen",
    "bio": "Recipes tested and perfected in our home kitchen"
  }
}
```

---

## Importing to Sanity

### Using the Validation Library

```typescript
import { validateRecipe, toSanityDocument } from '@/lib/validation/recipe-validator'
import { sanityClient } from '@/lib/sanityClient'

async function importAIRecipe(jsonString: string) {
  // 1. Parse JSON
  const data = JSON.parse(jsonString)

  // 2. Validate
  const result = validateRecipe(data)

  if (!result.success) {
    console.error('Validation errors:', result.error.issues)
    return null
  }

  // 3. Convert to Sanity document
  const doc = toSanityDocument(result.data)

  // 4. Create in Sanity
  return await sanityClient.create(doc)
}
```

### Using the Migration Script

```bash
# Set your Sanity token
export SANITY_TOKEN="your-token-here"

# Create a file with your JSON recipe
echo '{"title": "Test Recipe", ...}' > recipe.json

# Import using the script (coming soon)
node scripts/import-ai-recipe.js recipe.json
```

---

## Tips for Better AI Output

1. **Be specific about the dish**: Include cuisine, cooking method, and any dietary requirements

2. **Ask for adjustments**: "Generate a keto-friendly version" or "Reduce prep time to under 15 minutes"

3. **Request variations**: "Include 3 substitution suggestions in the tips"

4. **Specify serving size**: "Recipe should serve 4-6 as a main dish"

5. **Include context**: "This is for a weeknight dinner" helps AI make appropriate choices

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Ingredients not natural language | Ask AI to format as "2 cups flour, sifted" not structured objects |
| Missing steps | Ask for more detailed instructions |
| Nutritional info seems off | Request recalculation or mark as estimates |
| Too many optional ingredients | Ask AI to focus on essential ingredients |
| Instructions too vague | Ask for specific temperatures, times, and visual cues |
