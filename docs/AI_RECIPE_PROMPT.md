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
- Include local file paths for recipe images created during the thread.
- Default to a compact media pack: finished dish, one useful gallery/process image,
  and one step image only when the visual cue helps the cook.
- Include imageSource.url only when using a known, suitable remote image source.
- Keep public fields clean: never put internal workflow labels in captions,
  credits, alt text, sourceCredit, descriptions, or titles.
- Images should look like natural editorial food photography. Avoid illustration,
  CGI, painterly, plastic, or obviously synthetic styling.
- Do not include old post/jsonPost fields.
```

## Simple Workflow

The user should be able to ask in plain language:

```text
Make an EATS recipe for [DISH NAME] and send it to Sanity as a draft.
```

Codex then handles the hidden work: writing the recipe, generating useful images
in the thread when needed, saving those images locally, running checks, and
sending a Sanity draft.

Do not design this as a Sanity AI workflow. Sanity stores, previews, reviews, and
publishes the draft. Codex does the AI work before the draft reaches Sanity.

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
      "activeTimeMinutes": 14,
      "imageSource": {
        "filePath": "output/generated-images/recipe-title-step-2.png",
        "filename": "recipe-title-step-2.png",
        "alt": "Close view of the baked dish showing golden edges",
        "caption": "The center should be just set before cooling."
      }
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

  "whyItWorks": [
    "A short, practical reason this recipe succeeds.",
    "Another practical reason tied to technique or timing."
  ],
  "sourceCredit": null,

  "mainImage": {
    "alt": "Plain-language description of the finished dish",
    "caption": "Short caption describing the finished dish, or leave blank"
  },
  "imageSource": {
    "url": "https://example.com/image.jpg",
    "filePath": "output/generated-images/recipe-title.png",
    "filename": "recipe-title.jpg",
    "credit": "Photo credit, if applicable",
    "license": "License note, if applicable"
  },
  "gallery": [
    {
      "filePath": "output/generated-images/recipe-title-process.png",
      "filename": "recipe-title-process.png",
      "alt": "Ingredients arranged before cooking",
      "caption": "Prep the ingredients before starting the active cooking steps."
    }
  ],

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
- `imageSource.filePath`, `imageSource.url`, or an existing Sanity image asset reference

Useful but not always required:

- `quantity`, `unit`, `ingredientName`, `preparation`
- `timingForStep`, `activeTimeMinutes`
- `gallery` with process or serving images created during the thread
- `steps[].imageSource` when a step benefits from a visual cue
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

Use this file as the recipe contract, not as something the user needs to read
before asking for a recipe. The goal is for Codex to absorb the structure so the
user can stay at the level of the dish idea and editorial direction.

The friendly fields are for people:

- `text`: what a cook reads in the ingredient list.
- `instruction`: what a cook reads in the step list.
- `description`, `introduction`, `tips`: what appears on the site.

The helper fields are for the app:

- `quantity`, `unit`, `ingredientName`, `preparation`: scaling, pantry matching, and shopping lists.
- `timingForStep`, `activeTimeMinutes`: cooking mode and timers.
- `categorySlugs`, `tags`, `keywords`: organization and search.
- `whyItWorks`, `editorialNotes`, `sourceCredit`: optional editorial context.
