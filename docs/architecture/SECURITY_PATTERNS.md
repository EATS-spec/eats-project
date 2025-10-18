# Security Patterns Guide

## Overview

This guide documents the comprehensive security architecture implemented in the EATS platform, covering authentication, authorization, data protection, and security best practices for a modern web application.

## 🔐 Authentication Architecture

### NextAuth.js Implementation

```typescript
// lib/auth.ts
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  
  providers: [
    // OAuth providers
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    
    // Email/Password authentication
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        
        if (!user || !user.hashedPassword) {
          throw new Error('Invalid credentials')
        }
        
        // Check account lockout
        if (user.lockoutUntil && user.lockoutUntil > new Date()) {
          throw new Error('Account locked. Try again later.')
        }
        
        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        )
        
        if (!isCorrectPassword) {
          // Increment failed attempts
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedAttempts: user.failedAttempts + 1,
              lockoutUntil: user.failedAttempts >= 4 
                ? new Date(Date.now() + 30 * 60 * 1000) // 30 min lockout
                : null
            }
          })
          throw new Error('Invalid credentials')
        }
        
        // Reset failed attempts on success
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedAttempts: 0,
            lockoutUntil: null,
            lastLogin: new Date()
          }
        })
        
        return user
      }
    })
  ],
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    encryption: true,
  },
  
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = user.role || 'user'
        token.permissions = await getUserPermissions(user.id)
      }
      
      // Refresh token rotation
      if (account?.access_token) {
        token.accessToken = account.access_token
        token.accessTokenExpires = Date.now() + account.expires_in * 1000
      }
      
      // Refresh access token if expired
      if (Date.now() > token.accessTokenExpires) {
        return await refreshAccessToken(token)
      }
      
      return token
    },
    
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.permissions = token.permissions
      }
      
      return session
    }
  },
  
  events: {
    async signIn({ user, account, isNewUser }) {
      // Log authentication events
      await logSecurityEvent({
        type: 'AUTH_SUCCESS',
        userId: user.id,
        provider: account?.provider,
        isNewUser
      })
    },
    
    async signOut({ session, token }) {
      await logSecurityEvent({
        type: 'AUTH_LOGOUT',
        userId: token?.id
      })
    }
  },
  
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  }
}
```

### Session Validation

```typescript
// lib/auth/session-validator.ts
export class SessionValidator {
  private readonly MAX_SESSION_AGE = 30 * 24 * 60 * 60 * 1000 // 30 days
  private readonly IDLE_TIMEOUT = 30 * 60 * 1000 // 30 minutes
  
  async validateSession(token: JWT): Promise<ValidationResult> {
    const checks = [
      this.checkExpiration(token),
      this.checkIdleTime(token),
      this.checkPermissions(token),
      this.checkIPAddress(token),
      this.checkUserAgent(token),
      this.checkRevokedTokens(token)
    ]
    
    const results = await Promise.all(checks)
    const failed = results.filter(r => !r.valid)
    
    if (failed.length > 0) {
      await this.logValidationFailure(token, failed)
      return {
        valid: false,
        errors: failed.map(f => f.error),
        action: this.determineAction(failed)
      }
    }
    
    return { valid: true }
  }
  
  private async checkRevokedTokens(token: JWT): Promise<CheckResult> {
    const isRevoked = await redis.sismember('revoked_tokens', token.jti)
    
    return {
      valid: !isRevoked,
      error: isRevoked ? 'Token has been revoked' : null
    }
  }
  
  private determineAction(failures: CheckResult[]): SecurityAction {
    // Critical failures require immediate logout
    const critical = ['revoked', 'expired', 'tampered']
    
    if (failures.some(f => critical.includes(f.type))) {
      return 'FORCE_LOGOUT'
    }
    
    // Suspicious activity requires re-authentication
    if (failures.some(f => f.type === 'ip_change' || f.type === 'device_change')) {
      return 'REQUIRE_REAUTH'
    }
    
    return 'WARN'
  }
}
```

## 🛡️ Authorization & Access Control

### Role-Based Access Control (RBAC)

```typescript
// lib/auth/rbac.ts
export interface Role {
  name: string
  permissions: Permission[]
  inherits?: Role[]
}

export interface Permission {
  resource: string
  actions: Action[]
  conditions?: Condition[]
}

const roles: Map<string, Role> = new Map([
  ['admin', {
    name: 'admin',
    permissions: [
      { resource: '*', actions: ['*'] } // Full access
    ]
  }],
  
  ['editor', {
    name: 'editor',
    permissions: [
      { resource: 'recipe', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'category', actions: ['create', 'read', 'update'] },
      { resource: 'media', actions: ['create', 'read', 'update', 'delete'] }
    ]
  }],
  
  ['author', {
    name: 'author',
    permissions: [
      { 
        resource: 'recipe',
        actions: ['create', 'read', 'update'],
        conditions: [{ field: 'authorId', operator: 'equals', value: '{{userId}}' }]
      },
      { resource: 'media', actions: ['create', 'read'] }
    ]
  }],
  
  ['user', {
    name: 'user',
    permissions: [
      { resource: 'recipe', actions: ['read'] },
      { resource: 'comment', actions: ['create', 'read', 'update'] },
      { resource: 'favorite', actions: ['create', 'read', 'delete'] }
    ]
  }]
])

export class AccessControl {
  async canAccess(
    user: User,
    resource: string,
    action: Action,
    context?: any
  ): Promise<boolean> {
    const userRole = roles.get(user.role)
    
    if (!userRole) {
      return false
    }
    
    // Check direct permissions
    for (const permission of userRole.permissions) {
      if (this.matchesPermission(permission, resource, action, context)) {
        return true
      }
    }
    
    // Check inherited permissions
    if (userRole.inherits) {
      for (const inheritedRole of userRole.inherits) {
        if (await this.canAccess({ ...user, role: inheritedRole.name }, resource, action, context)) {
          return true
        }
      }
    }
    
    return false
  }
  
  private matchesPermission(
    permission: Permission,
    resource: string,
    action: Action,
    context: any
  ): boolean {
    // Check resource match
    if (permission.resource !== '*' && permission.resource !== resource) {
      return false
    }
    
    // Check action match
    if (!permission.actions.includes('*') && !permission.actions.includes(action)) {
      return false
    }
    
    // Check conditions
    if (permission.conditions) {
      return permission.conditions.every(condition => 
        this.evaluateCondition(condition, context)
      )
    }
    
    return true
  }
}
```

### API Route Protection

```typescript
// lib/middleware/auth.ts
export function withAuth(
  handler: NextApiHandler,
  options?: AuthOptions
): NextApiHandler {
  return async (req, res) => {
    const session = await getServerSession(req, res, authOptions)
    
    if (!session) {
      return res.status(401).json({
        error: 'Authentication required'
      })
    }
    
    // Check role requirements
    if (options?.requiredRole) {
      if (!hasRole(session.user, options.requiredRole)) {
        return res.status(403).json({
          error: 'Insufficient permissions'
        })
      }
    }
    
    // Check specific permissions
    if (options?.requiredPermission) {
      const accessControl = new AccessControl()
      const canAccess = await accessControl.canAccess(
        session.user,
        options.requiredPermission.resource,
        options.requiredPermission.action,
        { req, user: session.user }
      )
      
      if (!canAccess) {
        await logSecurityEvent({
          type: 'UNAUTHORIZED_ACCESS_ATTEMPT',
          userId: session.user.id,
          resource: options.requiredPermission.resource,
          action: options.requiredPermission.action
        })
        
        return res.status(403).json({
          error: 'Access denied'
        })
      }
    }
    
    // Add user to request
    req.user = session.user
    
    return handler(req, res)
  }
}

// Usage
export default withAuth(
  async (req, res) => {
    // Protected handler
  },
  {
    requiredRole: 'editor',
    requiredPermission: {
      resource: 'recipe',
      action: 'update'
    }
  }
)
```

## 🔒 Rate Limiting

### Token Bucket Implementation

```typescript
// lib/rate-limit/index.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Different rate limits for different operations
const rateLimits = {
  api: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(60, '1 m'), // 60 requests per minute
    analytics: true
  }),
  
  auth: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 attempts per 15 minutes
    analytics: true
  }),
  
  search: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(30, '1 m'), // 30 searches per minute
    analytics: true
  }),
  
  write: new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 writes per hour
    analytics: true
  })
}

export async function rateLimit(
  identifier: string,
  type: keyof typeof rateLimits = 'api'
): Promise<RateLimitResult> {
  const limiter = rateLimits[type]
  const result = await limiter.limit(identifier)
  
  if (!result.success) {
    // Log rate limit violation
    await logSecurityEvent({
      type: 'RATE_LIMIT_EXCEEDED',
      identifier,
      limitType: type,
      remaining: result.remaining,
      reset: result.reset
    })
  }
  
  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
    headers: {
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.reset).toISOString(),
      'Retry-After': result.success ? undefined : 
        Math.floor((result.reset - Date.now()) / 1000).toString()
    }
  }
}
```

### Middleware Integration

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip rate limiting for static assets
  if (pathname.startsWith('/_next/') || pathname.startsWith('/static/')) {
    return NextResponse.next()
  }
  
  // Determine rate limit type
  const rateLimitType = determineRateLimitType(pathname)
  
  // Get client identifier
  const identifier = getClientIdentifier(request)
  
  // Apply rate limiting
  const { success, headers } = await rateLimit(identifier, rateLimitType)
  
  if (!success) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers
    })
  }
  
  // Continue with request
  const response = NextResponse.next()
  
  // Add rate limit headers
  Object.entries(headers).forEach(([key, value]) => {
    if (value) response.headers.set(key, value)
  })
  
  return response
}

function getClientIdentifier(request: NextRequest): string {
  // Try to get authenticated user ID
  const token = request.cookies.get('next-auth.session-token')
  if (token) {
    const session = await decode(token.value)
    if (session?.sub) {
      return `user:${session.sub}`
    }
  }
  
  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 
             request.headers.get('x-real-ip') || 
             'unknown'
  
  return `ip:${ip}`
}
```

## 🛡️ Input Validation & Sanitization

### Schema-Based Validation

```typescript
// lib/validation/schemas.ts
import { z } from 'zod'

export const recipeSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-'&]+$/, 'Title contains invalid characters'),
    
  description: z.string()
    .max(500, 'Description too long')
    .transform(str => sanitizeHtml(str, { allowedTags: [] })),
    
  ingredients: z.array(z.object({
    quantity: z.number().positive().optional(),
    unit: z.enum(['cup', 'tbsp', 'tsp', 'oz', 'lb', 'g', 'kg', 'ml', 'l']).optional(),
    ingredient: z.string()
      .min(2)
      .max(50)
      .transform(str => sanitizeText(str))
  })).min(1, 'At least one ingredient required'),
  
  instructions: z.array(z.object({
    stepTitle: z.string().optional(),
    directions: z.string()
      .min(10, 'Instructions too short')
      .transform(str => sanitizeHtml(str, {
        allowedTags: ['b', 'i', 'em', 'strong'],
        allowedAttributes: {}
      }))
  })).min(1, 'At least one instruction required'),
  
  prepTime: z.number().int().positive().max(1440), // Max 24 hours
  cookTime: z.number().int().positive().max(2880), // Max 48 hours
  servings: z.number().int().positive().max(100)
})

// SQL injection prevention
export function sanitizeForSQL(input: string): string {
  return input
    .replace(/['";\\]/g, '') // Remove dangerous characters
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove multi-line comments
    .replace(/\*\//g, '')
    .substring(0, 1000) // Limit length
}

// XSS prevention
export function sanitizeForHTML(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;'
  }
  
  return input.replace(/[&<>"'\/]/g, char => map[char])
}
```

### API Validation Middleware

```typescript
// lib/middleware/validation.ts
export function withValidation<T>(
  schema: z.ZodSchema<T>
): (handler: NextApiHandler) => NextApiHandler {
  return (handler) => async (req, res) => {
    try {
      // Validate request body
      const validated = await schema.parseAsync(req.body)
      
      // Replace body with validated data
      req.body = validated
      
      return handler(req, res)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        })
      }
      
      return res.status(500).json({
        error: 'Internal server error'
      })
    }
  }
}

// Usage
export default withValidation(recipeSchema)(
  async (req, res) => {
    // req.body is now validated and typed
    const recipe = req.body
    // ...
  }
)
```

## 🔐 Content Security Policy (CSP)

### Dynamic CSP Generation

```typescript
// lib/csp.ts
export function generateCSP(nonce: string): string {
  const directives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      'https:',
      "'unsafe-inline'" // Fallback for older browsers
    ],
    'style-src': [
      "'self'",
      `'nonce-${nonce}'`,
      'https://fonts.googleapis.com',
      "'unsafe-inline'" // Required for some CSS-in-JS
    ],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https://cdn.sanity.io',
      'https://*.cloudinary.com'
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com'
    ],
    'connect-src': [
      "'self'",
      'https://api.sanity.io',
      'https://*.vercel.app',
      'wss://*.sanity.io' // WebSocket for real-time
    ],
    'media-src': ["'self'", 'blob:'],
    'object-src': ["'none'"],
    'frame-src': ["'self'", 'https://www.youtube.com'],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': [],
    'report-uri': ['/api/csp-report']
  }
  
  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ')
}

// CSP violation reporting
export async function handleCSPReport(req: NextApiRequest, res: NextApiResponse) {
  const report = req.body?.['csp-report']
  
  if (report) {
    // Log CSP violation
    await logSecurityEvent({
      type: 'CSP_VIOLATION',
      documentUri: report['document-uri'],
      violatedDirective: report['violated-directive'],
      blockedUri: report['blocked-uri'],
      sourceFile: report['source-file'],
      lineNumber: report['line-number']
    })
    
    // Alert on suspicious violations
    if (isSuspiciousViolation(report)) {
      await alertSecurityTeam(report)
    }
  }
  
  res.status(204).end()
}
```

## 🔑 Secrets Management

### Environment Variable Validation

```typescript
// lib/config/env.ts
import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // Authentication
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  
  // OAuth
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  
  // Sanity
  NEXT_PUBLIC_SANITY_PROJECT_ID: z.string(),
  NEXT_PUBLIC_SANITY_DATASET: z.string(),
  SANITY_API_TOKEN: z.string().optional(),
  
  // Redis
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // Monitoring
  SENTRY_DSN: z.string().url().optional(),
  
  // Feature flags
  NEXT_PUBLIC_MINIMAL_MODE: z.enum(['true', 'false']).optional()
})

export function validateEnv() {
  try {
    const env = envSchema.parse(process.env)
    
    // Additional security checks
    if (env.NEXTAUTH_SECRET.length < 32) {
      throw new Error('NEXTAUTH_SECRET must be at least 32 characters')
    }
    
    if (process.env.NODE_ENV === 'production') {
      if (!env.SANITY_API_TOKEN) {
        console.warn('Missing SANITY_API_TOKEN in production')
      }
      
      if (!env.UPSTASH_REDIS_REST_URL) {
        console.warn('Rate limiting disabled: Missing Redis configuration')
      }
    }
    
    return env
  } catch (error) {
    console.error('Environment validation failed:', error)
    process.exit(1)
  }
}

// Validate on startup
export const env = validateEnv()
```

### Secure Token Storage

```typescript
// lib/security/token-manager.ts
import crypto from 'crypto'

export class TokenManager {
  private readonly algorithm = 'aes-256-gcm'
  private readonly key: Buffer
  
  constructor() {
    // Derive key from secret
    this.key = crypto.scryptSync(
      process.env.NEXTAUTH_SECRET!,
      'salt',
      32
    )
  }
  
  encrypt(text: string): EncryptedData {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv)
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    }
  }
  
  decrypt(data: EncryptedData): string {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(data.iv, 'hex')
    )
    
    decipher.setAuthTag(Buffer.from(data.authTag, 'hex'))
    
    let decrypted = decipher.update(data.encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }
  
  async storeToken(userId: string, token: string, type: TokenType) {
    const encrypted = this.encrypt(token)
    
    await prisma.secureToken.create({
      data: {
        userId,
        type,
        encryptedValue: encrypted.encrypted,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        expiresAt: new Date(Date.now() + TOKEN_EXPIRY[type])
      }
    })
  }
  
  async retrieveToken(userId: string, type: TokenType): Promise<string | null> {
    const record = await prisma.secureToken.findFirst({
      where: {
        userId,
        type,
        expiresAt: { gt: new Date() }
      }
    })
    
    if (!record) return null
    
    return this.decrypt({
      encrypted: record.encryptedValue,
      iv: record.iv,
      authTag: record.authTag
    })
  }
}
```

## 🚨 Security Monitoring

### Security Event Logging

```typescript
// lib/security/event-logger.ts
interface SecurityEvent {
  type: SecurityEventType
  userId?: string
  ip?: string
  userAgent?: string
  resource?: string
  action?: string
  metadata?: Record<string, any>
  timestamp?: Date
}

export async function logSecurityEvent(event: SecurityEvent) {
  const enrichedEvent = {
    ...event,
    timestamp: event.timestamp || new Date(),
    sessionId: getSessionId(),
    requestId: getRequestId()
  }
  
  // Store in database
  await prisma.securityEvent.create({
    data: enrichedEvent
  })
  
  // Send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    await sendToSentry(enrichedEvent)
    await sendToDatadog(enrichedEvent)
  }
  
  // Check for patterns requiring immediate action
  await checkSecurityPatterns(enrichedEvent)
}

async function checkSecurityPatterns(event: SecurityEvent) {
  // Brute force detection
  if (event.type === 'AUTH_FAILURE') {
    const recentFailures = await prisma.securityEvent.count({
      where: {
        type: 'AUTH_FAILURE',
        ip: event.ip,
        timestamp: {
          gte: new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
        }
      }
    })
    
    if (recentFailures > 10) {
      await blockIP(event.ip!)
      await alertSecurityTeam({
        type: 'BRUTE_FORCE_DETECTED',
        ip: event.ip,
        attempts: recentFailures
      })
    }
  }
  
  // Suspicious access patterns
  if (event.type === 'UNAUTHORIZED_ACCESS_ATTEMPT') {
    const suspiciousAttempts = await prisma.securityEvent.count({
      where: {
        type: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        userId: event.userId,
        timestamp: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
        }
      }
    })
    
    if (suspiciousAttempts > 5) {
      await flagUserAccount(event.userId!)
      await notifyUser(event.userId!, 'SUSPICIOUS_ACTIVITY')
    }
  }
}
```

### Real-time Threat Detection

```typescript
// lib/security/threat-detector.ts
export class ThreatDetector {
  private patterns = [
    { name: 'SQL_INJECTION', regex: /(\bUNION\b|\bSELECT\b.*\bFROM\b|\bDROP\b|\bINSERT\b|\bUPDATE\b)/i },
    { name: 'XSS_ATTEMPT', regex: /<script|javascript:|onerror=|onclick=/i },
    { name: 'PATH_TRAVERSAL', regex: /\.\.\/|\.\.\\/ },
    { name: 'COMMAND_INJECTION', regex: /[;&|`$()]/ },
    { name: 'XXE_ATTEMPT', regex: /<!DOCTYPE.*\[<!ENTITY/ }
  ]
  
  async detectThreats(request: NextRequest): Promise<ThreatDetectionResult> {
    const threats: Threat[] = []
    
    // Check URL
    const urlThreats = this.scanForPatterns(request.url)
    threats.push(...urlThreats)
    
    // Check headers
    request.headers.forEach((value, key) => {
      const headerThreats = this.scanForPatterns(value)
      threats.push(...headerThreats.map(t => ({ ...t, location: `header:${key}` })))
    })
    
    // Check body
    if (request.body) {
      const bodyText = JSON.stringify(request.body)
      const bodyThreats = this.scanForPatterns(bodyText)
      threats.push(...bodyThreats.map(t => ({ ...t, location: 'body' })))
    }
    
    if (threats.length > 0) {
      await this.handleThreats(threats, request)
    }
    
    return {
      safe: threats.length === 0,
      threats,
      action: this.determineAction(threats)
    }
  }
  
  private scanForPatterns(text: string): Threat[] {
    const threats: Threat[] = []
    
    for (const pattern of this.patterns) {
      if (pattern.regex.test(text)) {
        threats.push({
          type: pattern.name,
          confidence: 'high',
          matched: text.match(pattern.regex)?.[0]
        })
      }
    }
    
    return threats
  }
  
  private determineAction(threats: Threat[]): SecurityAction {
    if (threats.some(t => t.confidence === 'high')) {
      return 'BLOCK'
    }
    
    if (threats.length > 2) {
      return 'CHALLENGE' // Require additional verification
    }
    
    return 'MONITOR'
  }
}
```

## 🔒 Data Protection

### Encryption at Rest

```typescript
// lib/security/data-encryption.ts
export class DataEncryption {
  // Field-level encryption for sensitive data
  async encryptField(value: string, context: EncryptionContext): Promise<string> {
    const key = await this.deriveKey(context)
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: crypto.getRandomValues(new Uint8Array(12))
      },
      key,
      new TextEncoder().encode(value)
    )
    
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)))
  }
  
  // Transparent encryption for Prisma
  @PrismaExtension
  encryptSensitiveFields() {
    return Prisma.defineExtension({
      name: 'encryption',
      model: {
        user: {
          async create(args) {
            if (args.data.ssn) {
              args.data.ssn = await this.encryptField(args.data.ssn, { type: 'PII' })
            }
            return this.create(args)
          }
        }
      }
    })
  }
}
```

## Conclusion

The security architecture in EATS demonstrates comprehensive protection at every layer of the application. From authentication and authorization to input validation and threat detection, these patterns ensure user data remains secure while maintaining a smooth user experience. The modular approach allows security features to be enhanced without disrupting core functionality, making EATS a secure foundation for recipe management and sharing.