# AI Recipe Generation Prompt

Use this as the canonical contract for new EATS recipe content.

New recipes should be created as Sanity `recipe` documents. Do not create new
`post` or `jsonPost` content. Those types are legacy compatibility paths only.

## Quick Prompt

Copy this and replace the bracketed parts:

```text
Generate one EATS recipe payload for [DISH NAME].

Return JSON only. Use the canonical Sanity recipe shape below.

Rules:
- Use lowercase enum values exactly as shown: difficulty, cuisineType, dietaryTags, cost.
- Keep ingredient text human-readable.
- Also fill the AI/helper ingredient fields when you can.
- Fill step timing fields when the step has an obvious time.
- Use categorySlugs instead of category reference IDs.
- Include imageSource.url only if the image URL is known and suitable.
- Do not include old post/jsonPost fields.
```

## Canonical Recipe Payload

```json
{
  "title": "Recipe Title",
  "description": "Brief card and SEO summary under 300 characters",
  "introduction": "Opening paragraph about why this recipe works or when to make it.",
  "categorySlugs": ["dinner", "comfort-food"],

  "prepTime": 15,
  "cookTime": 30,
  "totalTime": 45,
  "servings": "4-6",
  "difficulty": "easy",
  "cuisineType": "italian",
  "dietaryTags": ["vegetarian"],
  "cost": "moderate",

  "ingredientSections": [
    {
      "sectionTitle": null,
      "items": [
        {
          "text": "2 cups all-purpose flour, sifted",
          "quantity": "2",
          "unit": "cups",
          "ingredientName": "all-purpose flour",
          "preparation": "sifted",
          "optional": false
        },
        {
          "text": "1 tsp vanilla extract",
          "quantity": "1",
          "unit": "tsp",
          "ingredientName": "vanilla extract",
          "optional": true
        }
      ]
    }
  ],

  "steps": [
    {
      "instruction": "Preheat the oven to 375 F (190 C).",
      "tip": null,
      "timingForStep": null,
      "activeTimeMinutes": null
    },
    {
      "instruction": "Bake until the edges are golden and the center is set.",
      "tip": "Start checking early if your oven runs hot.",
      "timingForStep": "12-14 minutes",
      "activeTimeMinutes": 14
    }
  ],

  "equipmentText": ["mixing bowl", "whisk", "9x13 baking pan"],
  "tips": ["Can be made ahead."],
  "storageInstructions": "Store in an airtight container for up to 5 days.",
  "tags": ["comfort food", "weeknight"],
  "keywords": ["quick dinner", "easy recipe", "homemade"],

  "nutrition": {
    "calories": 350,
    "protein": 12,
    "carbs": 45,
    "fat": 14,
    "fiber": 3,
    "sodium": 400,
    "notes": "Estimated per serving."
  },

  "testedStatus": "draft",
  "testedBy": null,
  "lastTestedAt": null,
  "whyItWorks": [
    "A short, practical reason this recipe succeeds.",
    "Another practical reason tied to technique or timing."
  ],
  "sourceCredit": null,

  "mainImage": {
    "alt": "Plain-language description of the finished dish",
    "caption": "Optional image credit or caption"
  },
  "imageSource": {
    "url": "https://example.com/image.jpg",
    "filename": "recipe-title.jpg",
    "credit": "Photo credit, if applicable",
    "license": "License note, if applicable"
  },

  "author": {
    "name": "EATS"
  }
}
```

## Field Rules

Required before publishing:

- `title`
- `description`
- `categorySlugs`
- `ingredientSections`
- `steps`
- `mainImage.alt`
- `imageSource.url` or an existing Sanity image asset reference

Useful but not always required:

- `quantity`, `unit`, `ingredientName`, `preparation`
- `timingForStep`, `activeTimeMinutes`
- `equipmentText`
- `whyItWorks`
- `nutrition`

## Enum Values

Use these exact values.

Difficulty:

- `easy`
- `medium`
- `hard`

Cost:

- `budget`
- `moderate`
- `expensive`

Dietary tags:

- `vegetarian`
- `vegan`
- `gluten-free`
- `dairy-free`
- `keto`
- `paleo`
- `low-carb`
- `nut-free`
- `soy-free`

Cuisine:

- `american`
- `italian`
- `mexican`
- `chinese`
- `japanese`
- `thai`
- `indian`
- `french`
- `mediterranean`
- `middleEastern`
- `korean`
- `vietnamese`
- `greek`
- `spanish`
- `other`

Testing status:

- `draft`
- `tested`
- `cross-tested`
- `updated`

## Plain-English Meaning

The friendly fields are for people:

- `text`: what a cook reads in the ingredient list.
- `instruction`: what a cook reads in the step list.
- `description`, `introduction`, `tips`: what appears on the site.

The helper fields are for the app:

- `quantity`, `unit`, `ingredientName`, `preparation`: scaling, pantry matching, and shopping lists.
- `timingForStep`, `activeTimeMinutes`: cooking mode and timers.
- `categorySlugs`, `tags`, `keywords`: organization and search.
- `testedStatus`, `whyItWorks`, `sourceCredit`: trust and editorial context.
