# Developer Workflows Guide

## Overview

This guide documents the sophisticated development workflows implemented in the EATS ecosystem, including the innovative closed-loop development pattern, systematic error resolution, and comprehensive testing strategies.

## 🔄 Closed-Loop Development Workflow

### The Monitored Development Session

The closed-loop workflow provides real-time feedback and automatic fixes during development:

```bash
# Start a monitored session
npm run dev:session

# What happens:
# 1. Starts Next.js dev server
# 2. Monitors console output
# 3. Detects errors in real-time
# 4. Suggests or applies fixes
# 5. Validates fixes automatically
```

### Implementation Details

```javascript
// scripts/dev-session.js
const { spawn } = require('child_process')
const chalk = require('chalk')

class DevSession {
  constructor(options = {}) {
    this.autoFix = options.autoFix || false
    this.logFile = options.logFile || 'dev-session.log'
    this.errorPatterns = new Map([
      [/Module not found/, this.handleModuleNotFound],
      [/console\.log/, this.handleConsoleLogs],
      [/TypeScript error/, this.handleTypeScriptError],
      [/ESLint warning/, this.handleESLintWarning]
    ])
  }
  
  start() {
    this.devProcess = spawn('npm', ['run', 'dev'], {
      stdio: ['inherit', 'pipe', 'pipe']
    })
    
    this.devProcess.stdout.on('data', (data) => {
      const output = data.toString()
      this.log(output)
      this.detectAndHandle(output)
    })
    
    this.devProcess.stderr.on('data', (data) => {
      const error = data.toString()
      this.logError(error)
      this.detectAndHandle(error)
    })
  }
  
  detectAndHandle(output) {
    for (const [pattern, handler] of this.errorPatterns) {
      if (pattern.test(output)) {
        console.log(chalk.yellow('🔍 Detected issue:'), pattern)
        
        if (this.autoFix) {
          console.log(chalk.green('🔧 Applying automatic fix...'))
          handler.call(this, output)
        } else {
          console.log(chalk.blue('💡 Suggested fix:'))
          this.suggestFix(pattern)
        }
      }
    }
  }
  
  async handleModuleNotFound(error) {
    const moduleMatch = error.match(/Cannot find module '(.+)'/)
    if (moduleMatch) {
      const module = moduleMatch[1]
      console.log(chalk.green(`Installing ${module}...`))
      await this.exec(`npm install ${module}`)
      this.restart()
    }
  }
  
  async handleConsoleLogs() {
    console.log(chalk.green('Removing console.logs...'))
    await this.exec('node scripts/remove-console-logs-simple.js')
  }
  
  async handleESLintWarning() {
    console.log(chalk.green('Fixing ESLint issues...'))
    await this.exec('npm run lint -- --fix')
  }
}
```

## 🐛 Error Priority System

### Error Classification and Resolution

```typescript
// lib/dev/error-classifier.ts
export enum ErrorPriority {
  CRITICAL = '🔴',    // Blocks all development
  HIGH = '🟡',        // Blocks feature testing
  MEDIUM = '🟠',      // Should fix before commit
  LOW = '🟢'          // Can defer
}

interface ErrorPattern {
  pattern: RegExp
  priority: ErrorPriority
  category: string
  autoFixCommand?: string
  manualFixSteps?: string[]
}

export const ERROR_PATTERNS: ErrorPattern[] = [
  // Critical Errors
  {
    pattern: /Failed to compile/,
    priority: ErrorPriority.CRITICAL,
    category: 'Build Failure',
    autoFixCommand: 'npm run build:clean'
  },
  {
    pattern: /Module not found: Can't resolve/,
    priority: ErrorPriority.CRITICAL,
    category: 'Missing Dependency',
    autoFixCommand: 'npm install'
  },
  {
    pattern: /SyntaxError:/,
    priority: ErrorPriority.CRITICAL,
    category: 'Syntax Error',
    manualFixSteps: [
      'Check the file mentioned in the error',
      'Look for missing brackets, quotes, or semicolons',
      'Verify JSX tags are properly closed'
    ]
  },
  
  // High Priority
  {
    pattern: /TypeError:/,
    priority: ErrorPriority.HIGH,
    category: 'Type Error',
    manualFixSteps: [
      'Check if variable is undefined',
      'Verify object properties exist',
      'Add null checks or optional chaining'
    ]
  },
  {
    pattern: /Hydration failed/,
    priority: ErrorPriority.HIGH,
    category: 'SSR Mismatch',
    manualFixSteps: [
      'Check for client-only code in SSR components',
      'Use useEffect for client-only operations',
      'Add suppressHydrationWarning if intentional'
    ]
  },
  
  // Medium Priority
  {
    pattern: /console\.(log|debug|info)/,
    priority: ErrorPriority.MEDIUM,
    category: 'Console Statements',
    autoFixCommand: 'node scripts/remove-console-logs-simple.js'
  },
  {
    pattern: /warning.*is defined but never used/,
    priority: ErrorPriority.MEDIUM,
    category: 'Unused Variable',
    autoFixCommand: 'npm run lint -- --fix'
  },
  
  // Low Priority
  {
    pattern: /deprecated/i,
    priority: ErrorPriority.LOW,
    category: 'Deprecation',
    manualFixSteps: ['Track for future update']
  }
]
```

### Automated Error Resolution

```typescript
// lib/dev/auto-fixer.ts
export class AutoFixer {
  private fixes = new Map<string, () => Promise<boolean>>()
  
  constructor() {
    this.registerFixes()
  }
  
  private registerFixes() {
    // Missing module fix
    this.fixes.set('MODULE_NOT_FOUND', async () => {
      const missingModules = await this.detectMissingModules()
      
      for (const module of missingModules) {
        console.log(`Installing ${module}...`)
        await exec(`npm install ${module}`)
      }
      
      return true
    })
    
    // TypeScript errors fix
    this.fixes.set('TYPESCRIPT_ERROR', async () => {
      const errors = await this.getTypeScriptErrors()
      
      for (const error of errors) {
        if (error.code === 'TS2339') { // Property does not exist
          await this.addTypeDefinition(error)
        } else if (error.code === 'TS7006') { // Parameter implicitly has 'any'
          await this.addAnyType(error)
        }
      }
      
      return true
    })
    
    // Console.log removal
    this.fixes.set('CONSOLE_LOG', async () => {
      await exec('node scripts/remove-console-logs-simple.js')
      return true
    })
    
    // ESLint fixes
    this.fixes.set('ESLINT', async () => {
      await exec('npm run lint -- --fix')
      return true
    })
  }
  
  async applyFix(errorType: string): Promise<boolean> {
    const fix = this.fixes.get(errorType)
    if (!fix) {
      console.log(`No automatic fix available for ${errorType}`)
      return false
    }
    
    try {
      return await fix()
    } catch (error) {
      console.error(`Fix failed: ${error.message}`)
      return false
    }
  }
}
```

## 🧪 Testing Strategies

### Test Pyramid Implementation

```
         E2E Tests (Puppeteer)
              /    \
         Integration Tests
           /        \
      Unit Tests (Jest + RTL)
```

### Unit Testing Patterns

```typescript
// components/__tests__/RecipeCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { RecipeCard } from '../RecipeCard'

describe('RecipeCard', () => {
  const mockRecipe = {
    id: '1',
    title: 'Test Recipe',
    description: 'A test recipe',
    image: '/test.jpg',
    prepTime: 10,
    cookTime: 20,
    difficulty: 'easy'
  }
  
  it('renders recipe information correctly', () => {
    render(<RecipeCard recipe={mockRecipe} />)
    
    expect(screen.getByText('Test Recipe')).toBeInTheDocument()
    expect(screen.getByText('A test recipe')).toBeInTheDocument()
    expect(screen.getByText('30 min total')).toBeInTheDocument()
  })
  
  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<RecipeCard recipe={mockRecipe} onClick={handleClick} />)
    
    fireEvent.click(screen.getByRole('article'))
    expect(handleClick).toHaveBeenCalledWith(mockRecipe.id)
  })
  
  it('applies correct difficulty styling', () => {
    const { container } = render(<RecipeCard recipe={mockRecipe} />)
    
    const badge = container.querySelector('.difficulty-badge')
    expect(badge).toHaveClass('difficulty-easy')
  })
})
```

### Integration Testing

```typescript
// __tests__/integration/recipe-flow.test.ts
import { renderWithProviders } from '@/test-utils'
import { server } from '@/mocks/server'
import { rest } from 'msw'

describe('Recipe Viewing Flow', () => {
  it('loads and displays recipe from API', async () => {
    server.use(
      rest.get('/api/recipes/:id', (req, res, ctx) => {
        return res(ctx.json({
          id: req.params.id,
          title: 'Mocked Recipe',
          // ... more fields
        }))
      })
    )
    
    const { user } = renderWithProviders(<RecipePage id="123" />)
    
    // Wait for loading to complete
    await waitForElementToBeRemoved(() => screen.getByTestId('loading'))
    
    // Verify recipe loaded
    expect(screen.getByText('Mocked Recipe')).toBeInTheDocument()
    
    // Test interaction
    await user.click(screen.getByText('Start Cooking'))
    expect(screen.getByTestId('cooking-mode')).toBeInTheDocument()
  })
})
```

### E2E Testing with Puppeteer

```javascript
// e2e/tests/critical/recipe-viewing.test.js
describe('Recipe Viewing E2E', () => {
  let browser, page
  
  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: process.env.CI === 'true',
      slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0
    })
    page = await browser.newPage()
    
    // Set viewport for consistent testing
    await page.setViewport({ width: 1280, height: 720 })
  })
  
  afterAll(async () => {
    await browser.close()
  })
  
  test('Complete recipe viewing flow', async () => {
    // Navigate to homepage
    await page.goto('http://localhost:3000')
    await page.waitForSelector('[data-testid="recipe-card"]')
    
    // Click first recipe
    await page.click('[data-testid="recipe-card"]:first-child')
    
    // Wait for recipe page
    await page.waitForSelector('[data-testid="recipe-title"]')
    
    // Verify all sections loaded
    const sections = [
      'recipe-ingredients',
      'recipe-instructions',
      'recipe-nutrition',
      'recipe-tips'
    ]
    
    for (const section of sections) {
      const element = await page.$(`[data-testid="${section}"]`)
      expect(element).toBeTruthy()
    }
    
    // Test cooking mode
    await page.click('[data-testid="start-cooking"]')
    await page.waitForSelector('[data-testid="cooking-mode"]')
    
    // Test timer functionality
    await page.click('[data-testid="start-timer"]')
    await page.waitForTimeout(1000)
    
    const timerText = await page.$eval(
      '[data-testid="timer-display"]',
      el => el.textContent
    )
    expect(timerText).toMatch(/\d+:\d+/)
    
    // Take screenshot for visual regression
    await page.screenshot({ 
      path: 'screenshots/recipe-cooking-mode.png',
      fullPage: true
    })
  })
  
  test('Mobile responsiveness', async () => {
    // Test mobile viewport
    await page.setViewport({ width: 375, height: 667 })
    await page.goto('http://localhost:3000/recipes/test-recipe')
    
    // Check mobile menu
    await page.click('[data-testid="mobile-menu-toggle"]')
    await page.waitForSelector('[data-testid="mobile-menu"]')
    
    // Verify touch gestures work
    await page.evaluate(() => {
      const element = document.querySelector('[data-testid="recipe-instructions"]')
      const touch = new Touch({
        identifier: 1,
        target: element,
        clientX: 100,
        clientY: 100
      })
      
      element.dispatchEvent(new TouchEvent('touchstart', {
        touches: [touch],
        targetTouches: [touch],
        changedTouches: [touch]
      }))
    })
  })
})
```

## 🔍 Debugging Workflows

### Debug Helper Commands

```javascript
// scripts/debug-helpers.js
const commands = {
  cache: async () => {
    console.log('🔍 Checking cache status...')
    
    // Check Next.js cache
    const nextCache = await fs.readdir('.next/cache')
    console.log(`Next.js cache: ${nextCache.length} items`)
    
    // Check Redis cache
    const redis = await connectRedis()
    const keys = await redis.keys('*')
    console.log(`Redis cache: ${keys.length} keys`)
    
    // Check browser cache headers
    const response = await fetch('http://localhost:3000')
    console.log('Cache headers:', response.headers.get('cache-control'))
  },
  
  env: async () => {
    console.log('🔍 Environment variables...')
    
    const required = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXT_PUBLIC_SANITY_PROJECT_ID'
    ]
    
    const missing = required.filter(key => !process.env[key])
    
    if (missing.length > 0) {
      console.error('❌ Missing:', missing)
    } else {
      console.log('✅ All required variables present')
    }
    
    // Check for common issues
    if (process.env.DATABASE_URL?.includes('localhost')) {
      console.warn('⚠️ Using localhost database')
    }
  },
  
  perf: async () => {
    console.log('🔍 Performance metrics...')
    
    const metrics = await collectMetrics()
    
    console.table({
      'Build Size': formatBytes(metrics.buildSize),
      'Load Time': `${metrics.loadTime}ms`,
      'First Paint': `${metrics.firstPaint}ms`,
      'TTI': `${metrics.tti}ms`,
      'Bundle Count': metrics.bundleCount
    })
    
    // Identify large modules
    const largeModules = metrics.modules
      .filter(m => m.size > 100000)
      .sort((a, b) => b.size - a.size)
    
    if (largeModules.length > 0) {
      console.log('\n⚠️ Large modules detected:')
      largeModules.forEach(m => {
        console.log(`  ${m.name}: ${formatBytes(m.size)}`)
      })
    }
  }
}
```

### Browser DevTools Integration

```typescript
// lib/dev/devtools-bridge.ts
export class DevToolsBridge {
  constructor() {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      this.setupDevTools()
    }
  }
  
  setupDevTools() {
    // Expose debugging functions to console
    window.__EATS_DEBUG__ = {
      recipes: this.debugRecipes.bind(this),
      cache: this.debugCache.bind(this),
      performance: this.debugPerformance.bind(this),
      state: this.debugState.bind(this),
      network: this.debugNetwork.bind(this)
    }
    
    console.log('%c🍳 EATS Debug Tools Available', 'color: #4ECDC4; font-size: 14px')
    console.log('Access via: __EATS_DEBUG__.<function>')
  }
  
  async debugRecipes() {
    const recipes = await fetch('/api/debug-posts').then(r => r.json())
    console.table(recipes.map(r => ({
      id: r._id,
      title: r.title,
      type: r._type,
      hasContent: !!r.contentJSON,
      categories: r.categories?.length || 0
    })))
  }
  
  async debugCache() {
    const cacheNames = await caches.keys()
    
    for (const name of cacheNames) {
      const cache = await caches.open(name)
      const requests = await cache.keys()
      
      console.group(`Cache: ${name}`)
      console.log(`Items: ${requests.length}`)
      requests.slice(0, 10).forEach(req => {
        console.log(`  ${req.url}`)
      })
      console.groupEnd()
    }
  }
  
  debugPerformance() {
    const entries = performance.getEntriesByType('navigation')[0]
    const paint = performance.getEntriesByType('paint')
    
    console.table({
      'DOM Interactive': `${entries.domInteractive}ms`,
      'DOM Complete': `${entries.domComplete}ms`,
      'Load Complete': `${entries.loadEventEnd}ms`,
      'First Paint': `${paint[0]?.startTime}ms`,
      'First Contentful Paint': `${paint[1]?.startTime}ms`
    })
  }
}
```

## 🚀 Component Development Workflow

### Component Showcase

```typescript
// app/showcase/page.tsx
export default function ComponentShowcase() {
  const [activeComponent, setActiveComponent] = useState('RecipeCard')
  const [props, setProps] = useState({})
  
  const components = {
    RecipeCard: {
      component: RecipeCard,
      defaultProps: {
        recipe: sampleRecipe,
        variant: 'default'
      },
      variants: ['default', 'compact', 'featured'],
      controls: [
        { name: 'showImage', type: 'boolean', default: true },
        { name: 'showTime', type: 'boolean', default: true },
        { name: 'variant', type: 'select', options: ['default', 'compact'] }
      ]
    },
    // ... more components
  }
  
  return (
    <div className="showcase">
      {/* Component selector */}
      <ComponentSelector
        components={Object.keys(components)}
        active={activeComponent}
        onChange={setActiveComponent}
      />
      
      {/* Props controls */}
      <PropsControls
        controls={components[activeComponent].controls}
        values={props}
        onChange={setProps}
      />
      
      {/* Live preview */}
      <Preview>
        {React.createElement(
          components[activeComponent].component,
          { ...components[activeComponent].defaultProps, ...props }
        )}
      </Preview>
      
      {/* Code snippet */}
      <CodeSnippet
        component={activeComponent}
        props={props}
      />
    </div>
  )
}
```

### Hot Module Replacement Optimization

```javascript
// next.config.js
module.exports = {
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Optimize HMR
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules', '**/.git', '**/.next']
      }
      
      // Add custom HMR plugin
      config.plugins.push(
        new webpack.HotModuleReplacementPlugin({
          multiStep: true,
          fullBuildTimeout: 200,
          requestTimeout: 10000
        })
      )
    }
    
    return config
  }
}
```

## 📦 Dependency Management

### Dependency Audit Workflow

```bash
# Regular dependency audit
npm run deps:audit

# What it does:
# 1. Security audit
# 2. Outdated check
# 3. Unused dependencies
# 4. Bundle size impact
```

```javascript
// scripts/dependency-audit.js
async function auditDependencies() {
  console.log('🔍 Dependency Audit\n')
  
  // Security vulnerabilities
  const audit = await exec('npm audit --json')
  const vulnerabilities = JSON.parse(audit)
  
  if (vulnerabilities.metadata.vulnerabilities.total > 0) {
    console.log('⚠️ Security vulnerabilities found:')
    console.table(vulnerabilities.metadata.vulnerabilities)
  }
  
  // Outdated packages
  const outdated = await exec('npm outdated --json')
  const packages = JSON.parse(outdated)
  
  console.log('\n📦 Outdated packages:')
  Object.entries(packages).forEach(([name, info]) => {
    if (info.current !== info.latest) {
      console.log(`  ${name}: ${info.current} → ${info.latest}`)
    }
  })
  
  // Unused dependencies
  const unused = await findUnusedDependencies()
  if (unused.length > 0) {
    console.log('\n🗑️ Potentially unused:')
    unused.forEach(dep => console.log(`  - ${dep}`))
  }
  
  // Bundle impact
  const impact = await analyzeBundleImpact()
  console.log('\n📊 Bundle impact:')
  impact
    .sort((a, b) => b.size - a.size)
    .slice(0, 10)
    .forEach(dep => {
      console.log(`  ${dep.name}: ${formatBytes(dep.size)}`)
    })
}
```

## 🔄 Git Workflow Automation

### Pre-commit Hooks

```javascript
// .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run checks in parallel for speed
npm run lint &
npm run type-check &
npm run test:critical &

# Wait for all to complete
wait

# Check for console.logs
node scripts/check-console-logs.js || {
  echo "Console.logs detected. Running auto-fix..."
  node scripts/remove-console-logs-simple.js
  git add -u
}

# Verify no sensitive data
node scripts/check-secrets.js || {
  echo "Potential secrets detected!"
  exit 1
}
```

### Branch Management

```bash
# Feature branch workflow
git checkout -b feature/recipe-sharing

# Auto-format branch name
git config branch.autosetupmerge always
git config branch.autosetuprebase always

# Push with upstream tracking
git push -u origin HEAD

# Create PR with template
gh pr create --template .github/pull_request_template.md
```

## 📊 Performance Monitoring Workflow

### Build Performance Tracking

```javascript
// scripts/track-build-performance.js
class BuildPerformanceTracker {
  async track() {
    const startTime = Date.now()
    
    // Run build
    await exec('npm run build')
    
    const buildTime = Date.now() - startTime
    
    // Analyze results
    const stats = {
      buildTime,
      bundleSize: await this.getBundleSize(),
      chunkCount: await this.getChunkCount(),
      largestChunk: await this.getLargestChunk(),
      timestamp: new Date().toISOString()
    }
    
    // Store for trending
    await this.storeMetrics(stats)
    
    // Alert if regression
    const previous = await this.getPreviousMetrics()
    if (stats.buildTime > previous.buildTime * 1.2) {
      console.warn('⚠️ Build time increased by 20%!')
    }
    
    return stats
  }
}
```

## 🎯 Code Quality Workflows

### Code Review Automation

```typescript
// .github/workflows/code-review.yml
name: Automated Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Code Quality Checks
        run: |
          npm ci
          npm run lint
          npm run type-check
          npm run test:coverage
      
      - name: Comment PR
        uses: actions/github-script@v6
        with:
          script: |
            const coverage = require('./coverage/coverage-summary.json')
            const comment = `
            ## Code Quality Report
            
            ✅ Linting: Passed
            ✅ Type Check: Passed
            📊 Test Coverage: ${coverage.total.lines.pct}%
            `
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            })
```

## Conclusion

The developer workflows in EATS represent a modern, efficient approach to web development. The closed-loop development pattern, systematic error resolution, and comprehensive testing strategies ensure high code quality while maintaining developer productivity. These workflows can be adapted and extended based on team needs, making EATS not just a recipe platform but a showcase of development best practices.