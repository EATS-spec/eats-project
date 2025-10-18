# User Flow Diagrams - EATS Food Blog

## Main User Journey Flows

### 1. Recipe Discovery Flow

```
┌─────────────┐
│   ENTRY     │
│  Homepage   │
└──────┬──────┘
       │
       ├────────────────────────┬────────────────────┬──────────────────┐
       ▼                        ▼                    ▼                  ▼
┌──────────────┐        ┌──────────────┐    ┌──────────────┐   ┌──────────────┐
│Browse Latest │        │Click Category│    │  Use Search  │   │Click Cuisine │
│   Recipes    │        │     Link     │    │     Bar      │   │     Link     │
└──────┬───────┘        └──────┬───────┘    └──────┬───────┘   └──────┬───────┘
       │                        │                    │                  │
       ▼                        ▼                    ▼                  ▼
┌──────────────┐        ┌──────────────┐    ┌──────────────┐   ┌──────────────┐
│Recipe Cards  │        │Category Page │    │Search Results│   │ Cuisine Page │
│    Grid      │        │              │    │              │   │              │
└──────┬───────┘        └──────┬───────┘    └──────┬───────┘   └──────┬───────┘
       │                        │                    │                  │
       └────────────────────────┴────────────────────┴──────────────────┘
                                           │
                                           ▼
                                  ┌──────────────┐
                                  │Select Recipe │
                                  │    Card      │
                                  └──────┬───────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │Recipe Detail │
                                  │     Page     │
                                  └──────────────┘
```

### 2. Recipe Interaction Flow

```
┌──────────────────┐
│Recipe Detail Page│
└────────┬─────────┘
         │
         ├──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
         ▼          ▼          ▼          ▼          ▼          ▼          ▼
  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
  │   Read   │ │  Scale   │ │  Print   │ │   Save   │ │  Share   │ │  Cook    │
  │  Recipe  │ │ Servings │ │  Recipe  │ │Favorites │ │ Social  │ │   Mode   │
  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
                     │           │            │            │            │
                     ▼           ▼            ▼            ▼            ▼
              ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
              │Adjust    │ │Print     │ │Add to    │ │Post to   │ │Step by   │
              │Amounts   │ │Preview   │ │Collection│ │Platform  │ │Step View │
              └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
```

### 3. Search User Flow

```
┌────────────┐
│  Any Page  │
└─────┬──────┘
      │
      ▼
┌────────────────┐        ┌────────────────┐
│Click Search Bar│   OR   │Press "/" Key   │
└────────┬───────┘        └────────┬───────┘
         │                          │
         └──────────┬───────────────┘
                    ▼
         ┌──────────────────┐
         │ Type Query Term  │
         └────────┬─────────┘
                  │
         ┌────────▼─────────┐
         │  Autocomplete    │ (Proposed)
         │  Suggestions     │
         └────────┬─────────┘
                  │
         ┌────────▼─────────┐
         │  Press Enter or  │
         │  Click Search    │
         └────────┬─────────┘
                  │
         ┌────────▼─────────┐
         │ Search Results   │
         │      Page        │
         └────────┬─────────┘
                  │
      ┌───────────┼───────────┬───────────┐
      ▼           ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  Filter  │ │   Sort   │ │  Select  │ │  Refine  │
│ Results  │ │ Results  │ │  Recipe  │ │  Search  │
└──────────┘ └──────────┘ └─────┬────┘ └──────────┘
                                 │
                                 ▼
                         ┌──────────────┐
                         │Recipe Detail │
                         └──────────────┘
```

### 4. Category Navigation Flow

```
┌──────────────┐
│   Homepage   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Categories  │
│     Link     │
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│   Categories Overview    │
│   (50 Category Cards)    │
└──────────┬───────────────┘
           │
    ┌──────┼──────┬──────────┐
    ▼      ▼      ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ Sort   │ │ Filter │ │ Select │ │ Search │
│ Alpha  │ │ by Size│ │Category│ │ Within │
└────────┘ └────────┘ └───┬────┘ └────────┘
                          │
                          ▼
                ┌──────────────────┐
                │ Category Recipes │
                │   (e.g. Dinner)  │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │  Recipe Detail   │
                └──────────────────┘
```

### 5. Mobile User Flow

```
┌─────────────────┐
│  Mobile Landing │
└────────┬────────┘
         │
         ├──────────────┬──────────────┐
         ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│Hamburger Menu│ │Scroll Recipes│ │ Tap Search   │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Slide Menu   │ │ Single Column│ │ Full Screen  │
│  Navigation  │ │  Recipe Grid │ │   Search     │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Select Page  │ │ Tap Recipe   │ │Type & Submit │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       └────────────────┴────────────────┘
                        │
                        ▼
               ┌──────────────────┐
               │   Recipe Page    │
               │  (Mobile View)   │
               └────────┬─────────┘
                        │
         ┌──────────────┼──────────────┐
         ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│Jump to Recipe│ │ Cooking Mode │ │Share Recipe  │
└──────────────┘ └──────────────┘ └──────────────┘
```

## Pain Points in Current Flows

### 1. Search Flow Issues
```
Current:
User → Homepage → Search Button → Search Page → Type Query → Results

Improved:
User → Any Page → Type in Header Search → Instant Results
```

### 2. Recipe Discovery Friction
```
Current:
User → Homepage → Only 12 Recipes → No Load More → Must Navigate Away

Improved:
User → Homepage → Infinite Scroll OR Pagination → Stay on Page
```

### 3. Navigation Back Issues
```
Current:
Recipe Page → ??? (No Breadcrumbs) → Browser Back Button

Improved:
Recipe Page → Breadcrumb Navigation → Category/Homepage
```

## Optimal User Flows (Proposed)

### Quick Recipe Lookup
```
1. Land on any page
2. Press "/" to focus search
3. Type recipe name
4. See instant suggestions
5. Press Enter or click suggestion
6. Arrive at recipe
Time: <10 seconds
```

### Browse by Mood
```
1. Homepage hero "What are you craving?"
2. Click mood/cuisine tag
3. View curated collection
4. Filter by dietary needs
5. Select recipe
6. Save to meal plan
Time: <30 seconds
```

### Cooking Flow
```
1. Open saved recipe
2. Click "Start Cooking"
3. Enter fullscreen mode
4. Voice commands enabled
5. Step-by-step guidance
6. Timers auto-start
7. Screen stays awake
8. Mark complete
Time: Matches recipe time
```

### Social Sharing Flow
```
1. Find great recipe
2. Click share button
3. Choose platform OR copy link
4. Add personal note (optional)
5. Post to platform
6. Track engagement
Time: <15 seconds
```

## Conversion Funnel Analysis

### Current Funnel
```
Homepage Visit        100%  ████████████████████
     ↓
Browse Recipes        65%   █████████████
     ↓
Click Recipe          40%   ████████
     ↓
Read Full Recipe      30%   ██████
     ↓
Take Action           10%   ██
(Print/Save/Cook)
```

### Target Funnel (After UX Improvements)
```
Homepage Visit        100%  ████████████████████
     ↓
Browse Recipes        80%   ████████████████
     ↓
Click Recipe          60%   ████████████
     ↓
Read Full Recipe      50%   ██████████
     ↓
Take Action           30%   ██████
(Print/Save/Cook)
```

## Key Flow Optimizations

### 1. Reduce Clicks
- **Current**: Homepage → Categories → Category → Recipe = 3 clicks
- **Improved**: Homepage → Recipe (via search/filter) = 1 click

### 2. Persistent Elements
- Sticky navigation
- Floating search
- Quick filters
- Recently viewed

### 3. Smart Defaults
- Remember preferences
- Suggest based on time
- Seasonal content
- Location-based cuisine

### 4. Recovery Paths
- Clear error messages
- Helpful 404 pages
- Related suggestions
- Search on no results

## Mobile-Specific Flows

### Voice Search Flow
```
1. Tap microphone icon
2. Say "Show me pasta recipes"
3. View results
4. Say "Filter vegetarian"
5. Tap to select
```

### One-Handed Browsing
```
- Bottom navigation bar
- Thumb-zone CTAs
- Swipe gestures
- Pull to refresh
```

### Offline Mode
```
1. Save recipes while online
2. Access offline
3. Sync when connected
4. Cache images
```

## Success Metrics for Each Flow

### Homepage → Recipe
- **Current**: 3.2 clicks average
- **Target**: 1.8 clicks average
- **Measurement**: Analytics events

### Search → Recipe
- **Current**: 45% success rate
- **Target**: 75% success rate
- **Measurement**: Search analytics

### Recipe → Action
- **Current**: 10% conversion
- **Target**: 30% conversion
- **Measurement**: Event tracking

### Mobile Engagement
- **Current**: 2.1 pages/session
- **Target**: 3.5 pages/session
- **Measurement**: Mobile analytics

## Implementation Priority

### Phase 1: Critical Paths
1. Fix search functionality
2. Add breadcrumb navigation
3. Implement sticky header
4. Add print functionality

### Phase 2: Engagement
1. Related recipes
2. Recipe ratings
3. Save favorites
4. Social sharing

### Phase 3: Advanced
1. Cooking mode
2. Meal planning
3. Shopping lists
4. Voice control

### Phase 4: Personalization
1. User accounts
2. Recommendations
3. History tracking
4. Custom collections