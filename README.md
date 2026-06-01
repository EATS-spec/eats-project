# 🍽️ EATS - Modern Recipe & Food Blog Platform

A full-stack, performant recipe and food blog application featuring AI integration, advanced search, PWA capabilities, and a warm editorial cooking experience.

## 🚀 Quick Start

```bash
# Clone and navigate to repository
cd EATS\ Sanity\ CMS\ -\ Frontend

# Install deps (no root install needed)
npm --prefix eats-frontend install
npm --prefix sanity install

# Start both frontend + CMS locally
npm run dev
# Frontend: http://localhost:3000
# CMS Studio: http://localhost:3333
```

## 📁 Project Structure

This repository contains two interconnected applications:

Version source of truth: dependency versions and runtime requirements are defined in
`eats-frontend/package.json` and `sanity/package.json`.

```
/
├── eats-frontend/       # Next.js 16 frontend application
├── sanity/              # Sanity CMS content management
├── docs/                # Project-wide documentation
└── CLAUDE.md            # AI assistant guidance
```

### **[eats-frontend/](./eats-frontend/)** - Next.js Frontend
The consumer-facing web application built with Next.js 16, React 19, and TypeScript.

- **Tech Stack**: Next.js 16, React 19, TypeScript, Tailwind CSS v4, HeroUI
- **Features**: PWA, Advanced Search, Social Features, Cooking Tools
- **Deployment**: Vercel (Production-ready)
- **Documentation**: [eats-frontend/docs/](./eats-frontend/docs/)

### **[sanity/](./sanity/)** - Sanity CMS
The headless CMS providing structured content for recipes, categories, and site settings.

- **CMS**: Sanity Studio v5
- **Content Types**: Recipes, Categories, Authors, Site Settings
- **API**: GROQ queries for flexible data fetching
- **Documentation**: [sanity/README.md](./sanity/README.md)

### **[docs/](./docs/)** - Project Documentation
Comprehensive documentation covering architecture, guides, and planning.

- Architecture & system design
- AI integration guides
- Interactive features (voice, PWA, cooking mode)
- Innovation roadmap & future plans
- **Navigation**: [docs/README.md](./docs/README.md)

---

## 🎯 Key Features

### 🍳 Recipe Management
- Structured ingredient lists with grouping
- Step-by-step instructions with images
- Nutritional information tracking
- Recipe scaling functionality
- Print-optimized views

### 🔍 Advanced Search
- Full-text search across all content
- Filter by diet, cuisine, time, difficulty
- Ingredient inclusion/exclusion
- Real-time search suggestions
- Saved search preferences

### 📱 Progressive Web App (PWA)
- Offline recipe access
- Installable on mobile devices
- Push notifications
- Background sync
- IndexedDB storage

### 👥 Social Features
- User authentication (Google, GitHub)
- Recipe collections & favorites
- Comments & ratings
- Social sharing
- Activity tracking

### ⏱️ Cooking Tools
- Multi-timer support
- Shopping list generator
- Recipe scaling calculator
- Unit conversion
- Voice control (experimental)

### 🎨 Modern Design
- Warm editorial recipe aesthetic
- Dark/light theme support
- Glassmorphism effects
- Smooth animations
- Responsive layouts

---

## 🛠️ Development

### Prerequisites
- Node.js 20.x
- npm or yarn
- Git

### Environment Setup

#### Frontend (.env.local)
```bash
# Required
NEXT_PUBLIC_SANITY_PROJECT_ID=5r8ri1sg
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional
SANITY_API_TOKEN=your-token
SANITY_PREVIEW_SECRET=your-preview-secret # Must match SANITY_STUDIO_PREVIEW_SECRET
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token
REVALIDATION_SECRET=your-revalidation-secret
DEBUG_MODE=false
DEBUG_API_KEY=your-debug-api-key
# When DEBUG_MODE=true, /api/dev/* requires Authorization: Bearer $DEBUG_API_KEY
```

#### Sanity
Configuration is in `sanity.config.ts`. For draft previews, set:

```bash
SANITY_STUDIO_PREVIEW_URL=http://localhost:3000
SANITY_STUDIO_PREVIEW_SECRET=your-preview-secret
```

### Installation

```bash
# Install frontend dependencies
cd eats-frontend
npm install

# Install CMS dependencies
cd ../sanity
npm install
```

### Running Locally

```bash
# From repo root (starts both apps)
npm run dev

# Or run separately:
# Terminal 1: Frontend
cd eats-frontend
npm run dev
# → http://localhost:3000

# Terminal 2: Sanity Studio
cd sanity
npm run dev
# → http://localhost:3333
```

### Common Commands

#### Frontend
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run lint             # Run ESLint
npm run test             # Run tests
npm run test:critical    # Run critical path tests
```

#### Sanity
```bash
npm run dev              # Start Sanity Studio
npm run deploy           # Deploy to Sanity.io
npm run build            # Build Studio
```

---

## 📚 Documentation

### For Developers

**Getting Started**
1. [Setup Guide](./eats-frontend/docs/setup/) - Environment & dependencies
2. [Development Workflow](./eats-frontend/docs/development/) - Daily development process
3. [Architecture Overview](./docs/architecture/ECOSYSTEM_ARCHITECTURE.md) - System design

**Feature Development**
- [AI Integration Guide](./docs/guides/AI_INTEGRATION_GUIDE.md)
- [Interactive Features](./docs/guides/INTERACTIVE_FEATURES.md)
- [Data Visualization](./docs/guides/DATA_VISUALIZATION_GUIDE.md)

**Operations**
- [Deployment Guide](./eats-frontend/docs/deployment/)
- [Testing Strategy](./eats-frontend/docs/testing/)
- [Monitoring Setup](./eats-frontend/docs/monitoring/)

### Quick Links

| I want to... | Go to... |
|-------------|----------|
| Understand the architecture | [ECOSYSTEM_ARCHITECTURE.md](./docs/architecture/ECOSYSTEM_ARCHITECTURE.md) |
| Deploy to production | [eats-frontend/docs/deployment/](./eats-frontend/docs/deployment/) |
| Set up development environment | [eats-frontend/docs/setup/](./eats-frontend/docs/setup/) |
| Add new features | [eats-frontend/docs/development/](./eats-frontend/docs/development/) |
| Optimize performance | [eats-frontend/docs/performance/](./eats-frontend/docs/performance/) |
| Configure security | [eats-frontend/docs/security/](./eats-frontend/docs/security/) |
| Manage content | [sanity/README.md](./sanity/README.md) |
| See future roadmap | [INNOVATION_ROADMAP.md](./docs/planning/INNOVATION_ROADMAP.md) |

### Documentation Navigation
- **[📖 Project Documentation](./docs/README.md)** - Architecture, guides, planning
- **[💻 Frontend Documentation](./eats-frontend/docs/README.md)** - Complete frontend docs
- **[🔧 Frontend Navigation](./eats-frontend/docs/NAVIGATION.md)** - Quick topic finder
- **[🎨 Sanity Documentation](./sanity/README.md)** - CMS setup and schemas

---

## 🚢 Deployment

### Production Deployment

```bash
# Frontend to Vercel
cd eats-frontend
npm run vercel:prod

# Sanity Studio to Sanity.io
cd sanity
npm run deploy
```

### Deployment Checklist
- [ ] Environment variables configured in Vercel
- [ ] Database connected and migrated
- [ ] Sanity Studio deployed
- [ ] Critical tests passing
- [ ] Build succeeds locally
- [ ] No console.log statements in code

See [Deployment Guide](./eats-frontend/docs/deployment/) for detailed instructions.

---

## 🏗️ Architecture

### Data Flow
```
User Request → Next.js → Sanity CMS → Processing → UI Rendering
                ↓                         ↓
            Supabase Auth            Cache Layers
                                         ↓
                                    Service Worker
                                         ↓
                                    IndexedDB
```

### Technology Stack

**Frontend**
- Next.js 16.2.x (App Router)
- React 19.2.x
- TypeScript 6.x
- Tailwind CSS 4.2.x
- HeroUI Components
- Framer Motion

**Backend & Services**
- Sanity CMS v5
- Supabase (Auth + PostgreSQL)
- Upstash Redis (optional)
- Vercel Edge Functions

**Features**
- Service Workers (PWA)
- IndexedDB (Offline Storage)
- Web Audio API (Timers)
- Geolocation API
- Notifications API

---

## 🧪 Testing

```bash
# Run all tests
cd eats-frontend
npm test

# Run critical path tests
npm run test:critical

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

---

## 📊 Performance

### Metrics & Monitoring

- **Performance Dashboards**:
  - `/dev/adapter-monitor` - Post adapter monitoring
  - `/dev/query-monitor` - Query performance tracking
  - `/showcase` - Component showcase

- **Target Metrics**:
  - LCP: < 2.5s
  - FID: < 100ms
  - CLS: < 0.1
  - TTI: < 3.5s

See [Performance Documentation](./eats-frontend/docs/performance/) for optimization strategies.

---

## 🔒 Security

- Content Security Policy (CSP) configuration
- Rate limiting on API routes
- Supabase Auth with session management
- Environment variable validation
- Input sanitization
- XSS protection

See [Security Documentation](./eats-frontend/docs/security/) for detailed security practices.

---

## 🤝 Contributing

### Development Workflow
1. Create feature branch from `main`
2. Make changes and test locally
3. Run `npm run lint` and `npm run type-check`
4. Ensure tests pass with `npm run test:critical`
5. Submit pull request with description

### Code Quality
- Follow TypeScript best practices
- Write tests for new features
- Document complex logic
- Use conventional commit messages
- No `console.log` in production code

---

## 📝 License

This project is proprietary. All rights reserved.

---

## 🔗 Links

- **Production**: [https://eats-frontend.vercel.app](https://eats-frontend.vercel.app)
- **Sanity Studio**: [https://eats-sanity.sanity.studio/](https://eats-sanity.sanity.studio/)
- **Documentation**: [./docs/README.md](./docs/README.md)

---

## 💡 Helpful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Sanity Documentation](https://www.sanity.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [HeroUI Components](https://heroui.com/)

---

## 📞 Support

For questions or issues:
- Check [Documentation](./docs/README.md)
- Review [Troubleshooting Guide](./eats-frontend/docs/monitoring/)
- See [Frontend README](./eats-frontend/README.md) for detailed feature docs

---

*Last Updated: October 2025*
*Version: 2.0.0*
