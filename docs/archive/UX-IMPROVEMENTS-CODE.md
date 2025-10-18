# UX Improvements - Implementation Code

## 1. Header with Inline Search

```jsx
// components/Header.jsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Menu, X } from 'lucide-react';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="font-bold text-xl">EATS</a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="/" className="hover:text-orange-600 transition-colors">Home</a>
            <a href="/recipes" className="hover:text-orange-600 transition-colors">Recipes</a>
            <a href="/categories" className="hover:text-orange-600 transition-colors">Categories</a>
            <a href="/cuisines" className="hover:text-orange-600 transition-colors">Cuisines</a>
            <a href="/about" className="hover:text-orange-600 transition-colors">About</a>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipes..."
                className="w-64 px-4 py-2 pr-10 border rounded-full focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-600"
              >
                <Search size={20} />
              </button>
            </div>
          </form>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <form onSubmit={handleSearch} className="mb-4">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipes..."
                className="w-full px-4 py-2 border rounded-full"
              />
            </form>
            <nav className="flex flex-col gap-3">
              <a href="/" className="py-2">Home</a>
              <a href="/recipes" className="py-2">Recipes</a>
              <a href="/categories" className="py-2">Categories</a>
              <a href="/cuisines" className="py-2">Cuisines</a>
              <a href="/about" className="py-2">About</a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
```

---

## 2. Enhanced Recipe Card

```jsx
// components/RecipeCard.jsx
import { Clock, Users, Star, ChefHat } from 'lucide-react';
import Image from 'next/image';

export default function RecipeCard({ recipe }) {
  return (
    <article className="group cursor-pointer">
      <a href={`/post/${recipe.slug}`} className="block">
        <div className="relative overflow-hidden rounded-lg aspect-[4/3]">
          <Image
            src={recipe.image || '/placeholder-recipe.jpg'}
            alt={recipe.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Quick Info Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-4 left-4 text-white">
              <p className="text-sm">Click to view recipe</p>
            </div>
          </div>

          {/* Difficulty Badge */}
          <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold
            ${recipe.difficulty === 'easy' ? 'bg-green-500 text-white' : ''}
            ${recipe.difficulty === 'medium' ? 'bg-yellow-500 text-white' : ''}
            ${recipe.difficulty === 'hard' ? 'bg-red-500 text-white' : ''}
          `}>
            {recipe.difficulty}
          </span>
        </div>

        <div className="mt-4">
          {/* Categories */}
          <div className="flex gap-2 mb-2">
            {recipe.categories?.slice(0, 2).map(cat => (
              <span key={cat} className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                {cat}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-orange-600 transition-colors">
            {recipe.title}
          </h3>

          {/* Metadata */}
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Clock size={16} />
              {recipe.totalTime || '30 min'}
            </span>
            <span className="flex items-center gap-1">
              <Users size={16} />
              {recipe.servings || '4'} servings
            </span>
            {recipe.rating && (
              <span className="flex items-center gap-1">
                <Star size={16} className="text-yellow-500" />
                {recipe.rating}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {recipe.description}
          </p>
        </div>
      </a>
    </article>
  );
}
```

---

## 3. Breadcrumb Navigation

```jsx
// components/Breadcrumbs.jsx
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="py-3">
      <ol className="flex items-center gap-2 text-sm">
        <li>
          <a href="/" className="flex items-center gap-1 text-gray-600 hover:text-orange-600">
            <Home size={16} />
            <span className="sr-only">Home</span>
          </a>
        </li>

        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <ChevronRight size={16} className="text-gray-400" />
            {index === items.length - 1 ? (
              <span className="text-gray-900 font-medium">{item.label}</span>
            ) : (
              <a href={item.href} className="text-gray-600 hover:text-orange-600">
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Usage in recipe page:
// <Breadcrumbs items={[
//   { label: 'Recipes', href: '/recipes' },
//   { label: 'Dinner', href: '/categories/dinner' },
//   { label: recipe.title }
// ]} />
```

---

## 4. Print-Friendly Recipe View

```jsx
// components/PrintRecipe.jsx
export default function PrintRecipe({ recipe }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <button
        onClick={handlePrint}
        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Print Recipe
      </button>

      {/* Print-only styles */}
      <style jsx global>{`
        @media print {
          /* Hide non-essential elements */
          header, footer, nav, .no-print {
            display: none !important;
          }

          /* Recipe print layout */
          .recipe-content {
            max-width: 100%;
            margin: 0;
            padding: 20px;
            font-size: 12pt;
            line-height: 1.5;
          }

          /* Ensure ingredients and instructions don't break across pages */
          .ingredients-section,
          .instructions-section {
            page-break-inside: avoid;
          }

          /* Format recipe header */
          .recipe-header {
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }

          /* Two-column layout for ingredients */
          .ingredients-list {
            columns: 2;
            column-gap: 30px;
          }

          /* Add checkboxes for ingredients */
          .ingredient-item::before {
            content: "☐ ";
            margin-right: 8px;
          }

          /* Number the instructions */
          .instruction-step {
            margin-bottom: 15px;
            padding-left: 30px;
            position: relative;
          }

          .instruction-step::before {
            content: counter(step) ".";
            counter-increment: step;
            position: absolute;
            left: 0;
            font-weight: bold;
          }
        }
      `}</style>
    </>
  );
}
```

---

## 5. Related Recipes Section

```jsx
// components/RelatedRecipes.jsx
export default function RelatedRecipes({ currentRecipeId, categories }) {
  const [related, setRelated] = useState([]);

  useEffect(() => {
    // Fetch related recipes based on categories
    const fetchRelated = async () => {
      const response = await fetch(`/api/recipes/related?categories=${categories.join(',')}&exclude=${currentRecipeId}`);
      const data = await response.json();
      setRelated(data.recipes);
    };
    fetchRelated();
  }, [currentRecipeId, categories]);

  if (!related.length) return null;

  return (
    <section className="mt-12 py-8 border-t">
      <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {related.slice(0, 3).map(recipe => (
          <a
            key={recipe.id}
            href={`/post/${recipe.slug}`}
            className="group"
          >
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-3">
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <h3 className="font-semibold group-hover:text-orange-600 transition-colors">
              {recipe.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {recipe.totalTime} • {recipe.servings} servings
            </p>
          </a>
        ))}
      </div>

      <div className="text-center mt-6">
        <a
          href={`/categories/${categories[0]}`}
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700"
        >
          View all {categories[0]} recipes
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </section>
  );
}
```

---

## 6. Recipe Scaling Calculator

```jsx
// components/RecipeScaler.jsx
import { useState } from 'react';
import { Calculator, Minus, Plus } from 'lucide-react';

export default function RecipeScaler({ originalServings, ingredients }) {
  const [servings, setServings] = useState(originalServings);
  const scale = servings / originalServings;

  const scaleIngredient = (amount) => {
    // Parse the amount and scale it
    const match = amount.match(/^([\d\.\/\s]+)/);
    if (!match) return amount;

    const numStr = match[1].trim();
    const unit = amount.substring(match[0].length).trim();

    // Handle fractions
    let num;
    if (numStr.includes('/')) {
      const [num1, num2] = numStr.split('/').map(n => parseFloat(n.trim()));
      num = num1 / num2;
    } else {
      num = parseFloat(numStr);
    }

    const scaled = num * scale;
    const rounded = Math.round(scaled * 4) / 4; // Round to nearest quarter

    // Convert back to fraction if needed
    const formatNumber = (n) => {
      if (n % 1 === 0) return n.toString();
      if (n % 0.5 === 0) return n.toString();
      if (n % 0.25 === 0) {
        const fractions = { 0.25: '¼', 0.5: '½', 0.75: '¾' };
        const whole = Math.floor(n);
        const fraction = fractions[n - whole];
        return whole > 0 ? `${whole} ${fraction}` : fraction;
      }
      return n.toFixed(2);
    };

    return `${formatNumber(rounded)} ${unit}`;
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Calculator size={20} />
          Adjust Servings
        </h3>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setServings(Math.max(1, servings - 1))}
            className="w-8 h-8 rounded-full border hover:bg-white flex items-center justify-center"
            aria-label="Decrease servings"
          >
            <Minus size={16} />
          </button>

          <span className="font-semibold text-lg w-12 text-center">
            {servings}
          </span>

          <button
            onClick={() => setServings(servings + 1)}
            className="w-8 h-8 rounded-full border hover:bg-white flex items-center justify-center"
            aria-label="Increase servings"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {scale !== 1 && (
        <div className="text-sm text-gray-600">
          <p>Recipe scaled {scale > 1 ? 'up' : 'down'} by {Math.round(scale * 100)}%</p>
          <p className="mt-1 text-xs">Original: {originalServings} servings</p>
        </div>
      )}

      {/* Show scaled ingredients */}
      {scale !== 1 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm font-medium mb-2">Adjusted Ingredients:</p>
          <ul className="text-sm space-y-1">
            {ingredients.slice(0, 3).map((ing, i) => (
              <li key={i} className="text-gray-600">
                {scaleIngredient(ing.amount)} {ing.name}
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-500 mt-2">All ingredients below have been adjusted</p>
        </div>
      )}
    </div>
  );
}
```

---

## 7. Cooking Mode

```jsx
// components/CookingMode.jsx
import { useState, useEffect } from 'react';
import { ChefHat, Volume2, ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function CookingMode({ recipe }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [wakeLock, setWakeLock] = useState(null);

  useEffect(() => {
    // Request wake lock when cooking mode is active
    if (isActive && 'wakeLock' in navigator) {
      navigator.wakeLock.request('screen')
        .then(lock => setWakeLock(lock))
        .catch(err => console.log('Wake lock error:', err));
    }

    // Release wake lock when cooking mode is inactive
    return () => {
      if (wakeLock) wakeLock.release();
    };
  }, [isActive]);

  const speakStep = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    }
  };

  if (!isActive) {
    return (
      <button
        onClick={() => setIsActive(true)}
        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
      >
        <ChefHat size={20} />
        Enter Cooking Mode
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <header className="bg-orange-500 text-white p-4 flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ChefHat size={24} />
          Cooking Mode
        </h2>
        <button
          onClick={() => setIsActive(false)}
          className="p-2 hover:bg-orange-600 rounded"
          aria-label="Exit cooking mode"
        >
          <X size={24} />
        </button>
      </header>

      {/* Current Step */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <span className="text-6xl font-bold text-orange-500">
              {currentStep + 1}
            </span>
            <span className="text-2xl text-gray-500">
              {' '}of {recipe.instructions.length}
            </span>
          </div>

          <div className="text-2xl md:text-3xl leading-relaxed text-center mb-8">
            {recipe.instructions[currentStep]}
          </div>

          {/* Timer if step has one */}
          {recipe.timers?.[currentStep] && (
            <div className="text-center mb-8">
              <Timer minutes={recipe.timers[currentStep]} />
            </div>
          )}

          {/* Voice button */}
          <div className="text-center">
            <button
              onClick={() => speakStep(recipe.instructions[currentStep])}
              className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              <Volume2 size={20} />
              Read Aloud
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t p-4 flex items-center justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-6 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={24} />
          Previous
        </button>

        <div className="flex gap-2">
          {recipe.instructions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`w-3 h-3 rounded-full ${
                i === currentStep ? 'bg-orange-500' : 'bg-gray-300'
              }`}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentStep(Math.min(recipe.instructions.length - 1, currentStep + 1))}
          disabled={currentStep === recipe.instructions.length - 1}
          className="flex items-center gap-2 px-6 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}

// Timer component
function Timer({ minutes }) {
  const [seconds, setSeconds] = useState(minutes * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (isRunning && seconds > 0) {
      const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
      return () => clearTimeout(timer);
    } else if (seconds === 0) {
      // Play sound or notification
      new Audio('/timer-done.mp3').play();
    }
  }, [isRunning, seconds]);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="inline-flex items-center gap-4 bg-gray-100 rounded-lg p-4">
      <span className="text-3xl font-mono">{formatTime(seconds)}</span>
      <button
        onClick={() => setIsRunning(!isRunning)}
        className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
      >
        {isRunning ? 'Pause' : 'Start'}
      </button>
    </div>
  );
}
```

---

## 8. Jump to Recipe Button

```jsx
// components/JumpToRecipe.jsx
export default function JumpToRecipe() {
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
      <button
        onClick={() => {
          document.getElementById('recipe-content')?.scrollIntoView({ behavior: 'smooth' });
        }}
        className="w-full md:w-auto px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
      >
        Jump to Recipe ↓
      </button>
    </div>
  );
}
```

---

## 9. Back to Top Button

```jsx
// components/BackToTop.jsx
import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 w-12 h-12 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 flex items-center justify-center transition-all hover:scale-110 z-40"
      aria-label="Back to top"
    >
      <ArrowUp size={20} />
    </button>
  );
}
```

---

## 10. Loading Skeleton

```jsx
// components/RecipeCardSkeleton.jsx
export default function RecipeCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded-lg aspect-[4/3]"></div>
      <div className="mt-4">
        <div className="flex gap-2 mb-2">
          <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
          <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="flex gap-4">
          <div className="h-4 w-20 bg-gray-200 rounded"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
        <div className="mt-2">
          <div className="h-4 bg-gray-200 rounded mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );
}

// Usage in grid
export function RecipeGrid({ loading, recipes }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <RecipeCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map(recipe => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}
```

---

## CSS Improvements

```css
/* styles/improvements.css */

/* Smooth scrolling for the entire page */
html {
  scroll-behavior: smooth;
}

/* Better focus indicators for accessibility */
*:focus-visible {
  outline: 2px solid #f97316;
  outline-offset: 2px;
}

/* Improved touch targets for mobile */
@media (max-width: 768px) {
  button, a, .clickable {
    min-height: 48px;
    min-width: 48px;
  }
}

/* Print styles */
@media print {
  .no-print {
    display: none !important;
  }

  body {
    font-size: 12pt;
    line-height: 1.5;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .dark-mode-auto {
    background: #1a1a1a;
    color: #e5e5e5;
  }
}

/* Improved loading states */
.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Better hover states */
.hover-lift {
  transition: transform 0.2s, box-shadow 0.2s;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}
```