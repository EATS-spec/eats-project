# Interactive Features Guide

## Overview

EATS goes beyond static recipe display, offering a suite of interactive features that transform cooking from a solitary task into an engaging, technology-enhanced experience. This guide explores the implementation and extension of these features.

## 🎙️ Voice-Controlled Cooking Mode

### Architecture

The cooking mode combines multiple browser APIs to create a hands-free cooking experience:

```typescript
// components/CookingMode.tsx
export default function CookingMode({ recipe, onExit }) {
  // Core features
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null)
  
  // Wake Lock - Prevents screen from sleeping
  useEffect(() => {
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator) {
        const lock = await navigator.wakeLock.request('screen')
        setWakeLock(lock)
      }
    }
    requestWakeLock()
  }, [])
}
```

### Voice Commands Implementation

```typescript
// hooks/useVoiceCommands.ts
interface VoiceCommandsOptions {
  enabled: boolean
  onNext?: () => void          // "Next step"
  onPrevious?: () => void       // "Go back"
  onStartTimer?: () => void     // "Start timer"
  onStopTimer?: () => void      // "Stop timer"
  onToggleIngredients?: () => void  // "Show ingredients"
  onComplete?: () => void       // "Complete recipe"
}

export function useVoiceCommands(options: VoiceCommandsOptions) {
  const recognition = new (window.SpeechRecognition || 
                          window.webkitSpeechRecognition)()
  
  recognition.continuous = true
  recognition.interimResults = false
  recognition.lang = 'en-US'
  
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase()
    
    // Command matching with fuzzy logic
    const commands = {
      next: ['next', 'continue', 'forward', 'next step'],
      previous: ['back', 'previous', 'go back', 'last step'],
      timer: ['timer', 'start timer', 'set timer'],
      ingredients: ['ingredients', 'show ingredients', 'what do I need']
    }
    
    // Match and execute
    Object.entries(commands).forEach(([action, triggers]) => {
      if (triggers.some(trigger => transcript.includes(trigger))) {
        options[`on${capitalize(action)}`]?.()
      }
    })
  }
}
```

### Advanced Voice Features

```typescript
// Extended voice commands for pro users
const ADVANCED_COMMANDS = {
  // Quantity adjustments
  'double the recipe': () => scaleRecipe(2),
  'half the recipe': () => scaleRecipe(0.5),
  
  // Navigation
  'go to step ([0-9]+)': (stepNumber) => navigateToStep(stepNumber),
  'repeat instruction': () => repeatCurrentStep(),
  
  // Information queries
  'how much (.+)': (ingredient) => readIngredientAmount(ingredient),
  'what temperature': () => readTemperature(),
  'how long': () => readTimeRemaining(),
  
  // Substitutions
  'substitute (.+)': (ingredient) => suggestSubstitution(ingredient),
  
  // Notes
  'add note (.+)': (note) => addCookingNote(note),
  'read notes': () => readAllNotes()
}
```

### Screen Features

```typescript
// Fullscreen & Wake Lock Management
const toggleFullscreen = async () => {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen()
    setIsFullscreen(true)
    
    // Lock orientation for tablets
    if (screen.orientation) {
      await screen.orientation.lock('landscape')
    }
  } else {
    await document.exitFullscreen()
    setIsFullscreen(false)
  }
}

// Prevent accidental exits
const handleExit = () => {
  if (currentStep > 0 && !completedSteps.has(instructions.length - 1)) {
    if (confirm('Are you sure you want to exit? Your progress will be saved.')) {
      saveProgress()
      onExit()
    }
  } else {
    onExit()
  }
}
```

## 📱 Progressive Web App (PWA) Features

### Installation & Offline Support

```typescript
// app/providers/PWAProvider.tsx
export function PWAProvider({ children }) {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  
  useEffect(() => {
    // Capture install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    })
    
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }
  }, [])
  
  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt()
      const result = await installPrompt.userChoice
      if (result.outcome === 'accepted') {
        setIsInstalled(true)
      }
    }
  }
  
  return (
    <PWAContext.Provider value={{ isInstalled, handleInstall }}>
      {children}
    </PWAContext.Provider>
  )
}
```

### Service Worker for Offline Access

```javascript
// public/sw.js
const CACHE_NAME = 'eats-v1'
const urlsToCache = [
  '/',
  '/offline',
  '/manifest.json',
  '/images/recipe-placeholder.svg'
]

// Install - Cache essential files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  )
})

// Fetch - Network first, fall back to cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone)
          })
        }
        return response
      })
      .catch(() => {
        // Offline - serve from cache
        return caches.match(event.request)
          .then(response => response || caches.match('/offline'))
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites())
  }
})
```

### App Shortcuts

```json
// public/manifest.json
{
  "shortcuts": [
    {
      "name": "Quick Timer",
      "short_name": "Timer",
      "description": "Start a cooking timer",
      "url": "/timer?quick=true",
      "icons": [{ "src": "/timer-icon.png", "sizes": "96x96" }]
    },
    {
      "name": "Shopping List",
      "short_name": "Shop",
      "description": "View shopping list",
      "url": "/shopping-list",
      "icons": [{ "src": "/shop-icon.png", "sizes": "96x96" }]
    },
    {
      "name": "Voice Search",
      "short_name": "Voice",
      "description": "Search by voice",
      "url": "/search?voice=true",
      "icons": [{ "src": "/voice-icon.png", "sizes": "96x96" }]
    }
  ]
}
```

## 🛒 Smart Shopping List Generator

### Core Implementation

```typescript
// components/features/ShoppingListGenerator.tsx
export function ShoppingListGenerator({ recipes, currentRecipe }) {
  const [shoppingList, setShoppingList] = useState<Ingredient[]>([])
  
  // Intelligent ingredient aggregation
  const aggregateIngredients = (recipes: Recipe[]) => {
    const aggregated = new Map<string, Ingredient>()
    
    recipes.forEach(recipe => {
      recipe.ingredients.forEach(ing => {
        const key = normalizeIngredient(ing.ingredient)
        
        if (aggregated.has(key)) {
          // Smart unit conversion and addition
          const existing = aggregated.get(key)
          const converted = convertToCommonUnit(ing, existing)
          existing.quantity += converted.quantity
        } else {
          aggregated.set(key, { ...ing, recipeIds: [recipe.id] })
        }
      })
    })
    
    return Array.from(aggregated.values())
  }
  
  // Categorize by store section
  const categorizeIngredients = (ingredients: Ingredient[]) => {
    const categories = {
      produce: [],
      dairy: [],
      meat: [],
      pantry: [],
      frozen: [],
      other: []
    }
    
    ingredients.forEach(ing => {
      const category = detectCategory(ing.ingredient)
      categories[category].push(ing)
    })
    
    return categories
  }
}
```

### Advanced Shopping Features

```typescript
// Shopping list with store integration
interface StoreIntegration {
  storeName: string
  aisleMapping: Map<string, number>
  priceData?: Map<string, number>
}

export function SmartShoppingList({ list, store }: Props) {
  // Organize by store layout
  const organizeByAisle = (items: Ingredient[], store: StoreIntegration) => {
    return items.sort((a, b) => {
      const aisleA = store.aisleMapping.get(a.category) || 999
      const aisleB = store.aisleMapping.get(b.category) || 999
      return aisleA - aisleB
    })
  }
  
  // Budget calculation
  const calculateBudget = (items: Ingredient[], prices: Map<string, number>) => {
    return items.reduce((total, item) => {
      const price = prices.get(item.ingredient) || estimatePrice(item)
      return total + (price * item.quantity)
    }, 0)
  }
  
  // Share functionality
  const shareList = async () => {
    const text = formatListAsText(list)
    
    if (navigator.share) {
      await navigator.share({
        title: 'Shopping List',
        text: text,
        url: window.location.href
      })
    } else {
      await copyToClipboard(text)
    }
  }
}
```

## 🍳 Recipe Import/Export System

### Multi-Format Support

```typescript
// components/RecipeImportExport.tsx
export function RecipeImportExport({ post, onImport }) {
  // Export formats
  const exportFormats = {
    json: () => JSON.stringify(formatRecipeForExport(post), null, 2),
    markdown: () => convertToMarkdown(post),
    pdf: () => generatePDF(post),
    csv: () => convertToCSV(post),
    xml: () => convertToXML(post)
  }
  
  // Import with validation
  const handleImport = async (file: File) => {
    const text = await file.text()
    const format = detectFormat(text)
    
    let recipe
    switch(format) {
      case 'json':
        recipe = JSON.parse(text)
        break
      case 'markdown':
        recipe = parseMarkdownRecipe(text)
        break
      case 'url':
        recipe = await scrapeRecipeFromURL(text)
        break
    }
    
    if (validateRecipe(recipe)) {
      onImport(recipe)
    }
  }
}
```

### Web Scraping Integration

```typescript
// lib/recipe-scraper.ts
export async function scrapeRecipeFromURL(url: string): Promise<Recipe> {
  const response = await fetch('/api/scrape', {
    method: 'POST',
    body: JSON.stringify({ url })
  })
  
  const html = await response.text()
  
  // Look for structured data
  const structuredData = extractStructuredData(html)
  if (structuredData) {
    return parseStructuredRecipe(structuredData)
  }
  
  // Fallback to heuristic parsing
  return {
    title: extractTitle(html),
    ingredients: extractIngredients(html),
    instructions: extractInstructions(html),
    // ... more fields
  }
}
```

## ⏲️ Smart Recipe Timers

### Multi-Timer Management

```typescript
// components/features/RecipeTimer.tsx
export function RecipeTimer({ recipe }) {
  const [timers, setTimers] = useState<Timer[]>([])
  
  // Parse timings from instructions
  useEffect(() => {
    const extractedTimers = recipe.instructions
      .map((inst, index) => {
        const timeMatch = inst.timingForStep?.match(/(\d+)\s*(min|hour)/i)
        if (timeMatch) {
          return {
            id: `step-${index}`,
            name: inst.stepTitle || `Step ${index + 1}`,
            duration: convertToSeconds(timeMatch[1], timeMatch[2]),
            status: 'idle'
          }
        }
      })
      .filter(Boolean)
    
    setTimers(extractedTimers)
  }, [recipe])
  
  // Smart notifications
  const notifyUser = (timer: Timer) => {
    // Browser notification
    if (Notification.permission === 'granted') {
      new Notification(`Timer: ${timer.name}`, {
        body: 'Time is up!',
        icon: '/icon-192.png',
        vibrate: [200, 100, 200],
        actions: [
          { action: 'snooze', title: 'Snooze 5 min' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      })
    }
    
    // Audio alert
    const audio = new Audio('/sounds/timer-done.mp3')
    audio.play()
    
    // Haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200])
    }
  }
}
```

### Parallel Timer Coordination

```typescript
// Complex timer orchestration
export function TimerOrchestrator({ steps }) {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  
  // Calculate optimal timing
  const optimizeTimeline = (steps: Step[]) => {
    const events = []
    let currentTime = 0
    
    steps.forEach(step => {
      // Check if can be done in parallel
      if (step.canParallel && events.length > 0) {
        const lastEvent = events[events.length - 1]
        if (lastEvent.endTime > currentTime + step.duration) {
          // Schedule in parallel
          events.push({
            ...step,
            startTime: currentTime,
            endTime: currentTime + step.duration,
            parallel: true
          })
          return
        }
      }
      
      // Schedule sequentially
      events.push({
        ...step,
        startTime: currentTime,
        endTime: currentTime + step.duration
      })
      currentTime += step.duration
    })
    
    return events
  }
}
```

## 🎯 Gesture-Based Interactions

### Swipe Navigation

```typescript
// hooks/useSwipeGesture.ts
export function useSwipeGesture(onSwipeLeft, onSwipeRight) {
  const touchStart = useRef({ x: 0, y: 0 })
  const touchEnd = useRef({ x: 0, y: 0 })
  
  const handleTouchStart = (e: TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    }
  }
  
  const handleTouchEnd = (e: TouchEvent) => {
    touchEnd.current = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    }
    
    const deltaX = touchEnd.current.x - touchStart.current.x
    const deltaY = touchEnd.current.y - touchStart.current.y
    
    // Horizontal swipe detection
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        onSwipeRight?.()
      } else {
        onSwipeLeft?.()
      }
    }
  }
  
  return { handleTouchStart, handleTouchEnd }
}
```

### Pinch to Scale

```typescript
// Recipe scaling with pinch gesture
export function useRecipeScaling(baseServings: number) {
  const [scale, setScale] = useState(1)
  const initialDistance = useRef(0)
  
  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      
      if (initialDistance.current === 0) {
        initialDistance.current = distance
      } else {
        const newScale = distance / initialDistance.current
        setScale(Math.max(0.5, Math.min(3, newScale)))
      }
    }
  }
  
  return {
    servings: Math.round(baseServings * scale),
    scale,
    handleTouchMove
  }
}
```

## 🔄 Real-Time Collaboration Features

### Cooking Together Mode

```typescript
// components/features/CookingTogether.tsx
export function CookingTogether({ recipe, sessionId }) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [sharedState, setSharedState] = useState<SharedCookingState>()
  
  useEffect(() => {
    // WebSocket connection for real-time sync
    const ws = new WebSocket(`wss://api.eats.com/cooking/${sessionId}`)
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      switch(data.type) {
        case 'participant_joined':
          setParticipants(prev => [...prev, data.participant])
          break
        case 'step_completed':
          updateSharedProgress(data.stepId, data.userId)
          break
        case 'timer_started':
          syncTimer(data.timer)
          break
      }
    }
    
    return () => ws.close()
  }, [sessionId])
  
  // Assign tasks to participants
  const assignTasks = () => {
    const tasks = divideRecipeIntoTasks(recipe)
    const assignments = new Map()
    
    participants.forEach((participant, index) => {
      const assignedTasks = tasks.filter((_, i) => i % participants.length === index)
      assignments.set(participant.id, assignedTasks)
    })
    
    return assignments
  }
}
```

## 📸 Visual Recipe Documentation

### Step-by-Step Photo Capture

```typescript
// components/features/RecipePhotoJournal.tsx
export function RecipePhotoJournal({ recipe }) {
  const [photos, setPhotos] = useState<StepPhoto[]>([])
  
  const captureStepPhoto = async (stepIndex: number) => {
    if ('mediaDevices' in navigator) {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      
      const video = document.createElement('video')
      video.srcObject = stream
      await video.play()
      
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext('2d').drawImage(video, 0, 0)
      
      const blob = await canvasToBlob(canvas)
      const url = URL.createObjectURL(blob)
      
      setPhotos(prev => [...prev, {
        stepIndex,
        url,
        timestamp: Date.now(),
        notes: ''
      }])
      
      stream.getTracks().forEach(track => track.stop())
    }
  }
  
  // Generate cooking timelapse
  const createTimelapse = async () => {
    const video = await generateVideo(photos, {
      fps: 2,
      transitionEffect: 'fade',
      includeTimer: true
    })
    
    return video
  }
}
```

## 🎮 Gamification Elements

### Cooking Achievements

```typescript
// lib/gamification/achievements.ts
const ACHIEVEMENTS = {
  firstRecipe: {
    name: 'First Timer',
    description: 'Complete your first recipe',
    icon: '🎉',
    points: 10
  },
  speedDemon: {
    name: 'Speed Demon',
    description: 'Complete a recipe 20% faster than estimated',
    icon: '⚡',
    points: 25
  },
  perfectExecution: {
    name: 'Perfect Execution',
    description: 'Complete all steps without going back',
    icon: '✨',
    points: 15
  },
  weekStreak: {
    name: 'Week Warrior',
    description: 'Cook every day for a week',
    icon: '🔥',
    points: 50
  }
}

export function trackAchievement(userId: string, recipeId: string, metrics: CookingMetrics) {
  const achievements = []
  
  // Check various achievement conditions
  if (metrics.isFirstRecipe) {
    achievements.push(ACHIEVEMENTS.firstRecipe)
  }
  
  if (metrics.actualTime < metrics.estimatedTime * 0.8) {
    achievements.push(ACHIEVEMENTS.speedDemon)
  }
  
  // Store and notify
  achievements.forEach(achievement => {
    unlockAchievement(userId, achievement)
    showAchievementNotification(achievement)
  })
}
```

## Extending Interactive Features

### Adding New Voice Commands

```typescript
// Extend voice command vocabulary
const CUSTOM_COMMANDS = {
  // Shopping integration
  'add (.*) to shopping list': (item) => addToShoppingList(item),
  'order (.*) online': (item) => orderIngredient(item),
  
  // Social features
  'share with (.*)': (person) => shareRecipe(person),
  'call (.*)': (person) => startVideoCall(person),
  
  // Learning mode
  'explain (.*)': (term) => explainCookingTerm(term),
  'why do we (.*)': (action) => explainTechnique(action)
}
```

### Creating Custom Interactions

```typescript
// Plugin system for custom features
interface InteractionPlugin {
  name: string
  initialize: () => void
  handlers: Map<string, Handler>
  cleanup: () => void
}

export function registerPlugin(plugin: InteractionPlugin) {
  plugins.set(plugin.name, plugin)
  plugin.initialize()
}

// Example: Augmented Reality plugin
const arPlugin: InteractionPlugin = {
  name: 'ar-cooking',
  initialize: () => {
    // Setup AR.js or similar
  },
  handlers: new Map([
    ['showAR', () => launchARView()],
    ['measure', (ingredient) => arMeasureIngredient(ingredient)]
  ]),
  cleanup: () => {
    // Cleanup AR resources
  }
}
```

## Performance Considerations

### Optimizing Interactive Features

```typescript
// Debounce expensive operations
const debouncedVoiceProcessing = debounce((transcript) => {
  processVoiceCommand(transcript)
}, 500)

// Lazy load heavy features
const CookingMode = lazy(() => import('./CookingMode'))
const VoiceControl = lazy(() => import('./VoiceControl'))

// Use Web Workers for intensive tasks
const worker = new Worker('/workers/recipe-processor.js')
worker.postMessage({ type: 'optimize', recipe })
```

## Conclusion

The interactive features in EATS transform passive recipe reading into an engaging, multi-sensory cooking experience. By leveraging modern web APIs and thoughtful UX design, these features make cooking more accessible, enjoyable, and successful for users of all skill levels. The modular architecture ensures new features can be added without disrupting existing functionality, making EATS a platform that can evolve with user needs and technological advances.