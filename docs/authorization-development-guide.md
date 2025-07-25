# Authorization Development Guide

## Overview

This guide documents the comprehensive lessons learned from developing the admin authorization flow for Prism Health Lab. It serves as a reference for future authorization system development, covering architectural patterns, state management strategies, and production readiness considerations.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [State Management Patterns](#state-management-patterns)
3. [Server-Client Boundaries](#server-client-boundaries)
4. [Authentication Flow Design](#authentication-flow-design)
5. [Error Handling & Recovery](#error-handling--recovery)
6. [Security Considerations](#security-considerations)
7. [Performance Optimization](#performance-optimization)
8. [TypeScript Patterns](#typescript-patterns)
9. [Next.js Specific Patterns](#nextjs-specific-patterns)
10. [Development Workflow](#development-workflow)
11. [Common Pitfalls](#common-pitfalls)
12. [Best Practices Checklist](#best-practices-checklist)

## Architecture Overview

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Authorization System                    │
├─────────────────────────────────────────────────────────────┤
│  AuthContext (Client)     │  Server Components & API Routes │
│  ├─ User State           │  ├─ Admin Server Utils          │
│  ├─ Profile State        │  ├─ Admin Check API             │
│  ├─ Session State        │  ├─ Supabase Server Client      │
│  ├─ Admin State          │  └─ RLS Bypass Logic            │
│  └─ Bootstrap State      │                                 │
├─────────────────────────────────────────────────────────────┤
│  UI Components                                              │
│  ├─ Login/Signup Pages                                     │
│  ├─ Admin Layout                                           │
│  ├─ Protected Routes                                       │
│  └─ Sign Out Flow                                          │
└─────────────────────────────────────────────────────────────┘
```

### Key Principles

1. **Separation of Concerns**: Authentication, authorization, and UI are distinct layers
2. **Server-First Security**: Critical checks happen server-side with client optimizations
3. **Declarative UI**: Components render based on state, not imperative logic
4. **Progressive Enhancement**: Start with basic auth, add features incrementally

## State Management Patterns

### 1. Discriminated Union Types for Complex State

```typescript
// ✅ GOOD: Clear state transitions with discriminated unions
type AdminState =
  | { status: 'pending' }
  | { status: 'error'; message: string; retryCount: number }
  | { status: 'no' }
  | { status: 'yes'; roles: string[]; checkedAt: number }

// ❌ BAD: Multiple boolean flags create invalid combinations
interface BadAdminState {
  isLoading: boolean
  isAdmin: boolean
  hasError: boolean
  errorMessage?: string
}
```

### 2. useReducer for Complex State Machines

```typescript
// ✅ GOOD: Reducer handles all state transitions
const adminReducer = (state: AdminState, action: AdminAction): AdminState => {
  switch (action.type) {
    case 'CHECK_START':
      return { status: 'pending' }
    case 'CHECK_SUCCESS':
      return action.isAdmin
        ? { status: 'yes', roles: action.roles, checkedAt: Date.now() }
        : { status: 'no' }
    case 'CHECK_ERROR':
      return {
        status: 'error',
        message: action.message,
        retryCount: state.status === 'error' ? state.retryCount + 1 : 1
      }
    default:
      return state
  }
}

// ❌ BAD: Multiple useState hooks create race conditions
const [isLoading, setIsLoading] = useState(false)
const [isAdmin, setIsAdmin] = useState(false)
const [error, setError] = useState<string | null>(null)
```

### 3. Separated Loading States

```typescript
interface AuthContextType {
  // Separate concerns with distinct loading states
  bootstrapLoading: boolean    // Initial session load
  adminState: AdminState       // Admin check with its own loading
  user: User | null
  profile: Profile | null
}

// ✅ GOOD: Independent useEffect hooks for different concerns
useEffect(() => {
  // Bootstrap: Load initial session
  getSession().finally(() => setBootstrapLoading(false))
}, [])

useEffect(() => {
  // Admin check: Only after bootstrap completes
  if (!bootstrapLoading && user && adminState.status === 'pending') {
    checkAdminStatus()
  }
}, [bootstrapLoading, user, adminState.status])
```

## Server-Client Boundaries

### 1. Server-Only Dependencies

```typescript
// ✅ GOOD: Hide server dependencies from client bundle
import 'server-only'

function createSwellClient() {
  // Use eval to hide from bundler analysis
  const { Client } = eval('require("swell-node")')
  return new Client(process.env.SWELL_STORE_ID, process.env.SWELL_SECRET_KEY)
}

// Module-level instantiation prevents race conditions
const swellClient = createSwellClient()
```

### 2. Webpack Fallback Configuration

```typescript
// next.config.ts
export default {
  webpack(config: any, { isServer }: { isServer: boolean }) {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'deasync': false,
        'http-cookie-agent': false,
        'swell-node': false,
      }
    }
    return config
  }
}
```

### 3. API Routes as Boundaries

```typescript
// ✅ GOOD: Server logic isolated in API routes
// /api/admin/check/route.ts
export async function POST(request: Request) {
  const supabase = await createClient()
  const adminAuth = new AdminAuthServer(supabase)
  
  const { userId } = await request.json()
  const isAdmin = await adminAuth.isAdmin(userId)
  
  return Response.json({ isAdmin })
}

// Client code uses fetch, never imports server modules
const checkAdminStatus = async () => {
  const response = await fetch('/api/admin/check', {
    method: 'POST',
    body: JSON.stringify({ userId: user.id })
  })
  const result = await response.json()
  // Handle result...
}
```

## Authentication Flow Design

### 1. Declarative Render Logic

```typescript
// ✅ GOOD: Clear declarative rendering based on state
function LoginPage() {
  const { user, bootstrapLoading, adminState } = useAuth()
  
  if (bootstrapLoading) {
    return <LoadingSpinner text="Loading session..." />
  }
  
  if (!user) {
    return <LoginForm />
  }
  
  if (isAdminLogin && adminState.status === 'pending') {
    return <LoadingSpinner text="Verifying admin access..." />
  }
  
  if (isAdminLogin && adminState.status === 'error') {
    return <LoginForm error={adminState.message} />
  }
  
  if (isAdminLogin && adminState.status === 'no') {
    return <LoginForm error="Admin access denied" />
  }
  
  // User is authenticated, redirect handled by useEffect
  return <LoadingSpinner text="Redirecting..." />
}
```

### 2. Effect-Based Redirects

```typescript
// ✅ GOOD: Separate redirect logic in useEffect
useEffect(() => {
  if (bootstrapLoading || !user) return
  
  if (isAdminLogin) {
    if (adminState.status === 'yes') {
      router.push(redirectTo)
    }
    return // Wait for admin check to complete
  }
  
  // Non-admin login, redirect immediately
  router.push(redirectTo)
}, [user, bootstrapLoading, adminState, isAdminLogin, redirectTo, router])
```

### 3. Progressive Authentication

```typescript
// Authentication hierarchy:
// 1. Session exists? → 2. User authenticated? → 3. Admin check (if needed)

const authFlow = {
  1: "Bootstrap: Load session from storage",
  2: "Authentication: Verify user credentials", 
  3: "Authorization: Check role-based permissions",
  4: "Redirect: Navigate to intended destination"
}
```

## Error Handling & Recovery

### 1. Exponential Backoff Retry

```typescript
const RETRY_DELAYS = [1000, 2000, 4000] // ms
const MAX_RETRY_COUNT = 3

const retryAdminCheck = async (): Promise<void> => {
  if (adminState.status !== 'error' || adminState.retryCount >= MAX_RETRY_COUNT) {
    return
  }

  const delay = RETRY_DELAYS[adminState.retryCount - 1] || RETRY_DELAYS[RETRY_DELAYS.length - 1]
  console.log(`Retrying admin check in ${delay}ms (attempt ${adminState.retryCount + 1}/${MAX_RETRY_COUNT})`)
  
  await new Promise(resolve => setTimeout(resolve, delay))
  await checkAdminStatus()
}
```

### 2. Graceful Fallbacks

```typescript
// ✅ GOOD: Always provide fallback data
async function getSwellAnalytics() {
  try {
    const data = await swellClient.get('/analytics')
    return data
  } catch (error) {
    console.error('Analytics API failed:', error)
    // Return safe fallback instead of throwing
    return {
      revenue: { today: 0, week: 0, month: 0, year: 0 },
      orders: { pending: 0, completed: 0, total: 0 },
      products: { total: 0, active: 0, out_of_stock: 0 }
    }
  }
}
```

### 3. Error Boundaries for UI

```typescript
// Wrap auth-sensitive components in error boundaries
<ErrorBoundary fallback={<AuthErrorFallback />}>
  <AdminProtectedComponent />
</ErrorBoundary>
```

## Security Considerations

### 1. Row Level Security (RLS) Bypass

```typescript
// Admin checks need to bypass RLS for staff table access
class AdminAuthServer {
  async isAdmin(userId: string) {
    // Server-side check with elevated permissions
    const { data: staffData } = await this.supabase
      .from('staff')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    
    return staffData?.can_access_admin === true && staffData?.is_active === true
  }
}
```

### 2. Server-Side Verification

```typescript
// ✅ GOOD: Critical auth checks on server
// /app/admin/layout.tsx
export default async function AdminLayout({ children }) {
  const supabase = await createClient()
  const adminAuth = new AdminAuthServer(supabase)
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/admin')
  
  const isAdmin = await adminAuth.isAdmin(user.id)
  if (!isAdmin) redirect('/?error=unauthorized')
  
  return <AdminInterface>{children}</AdminInterface>
}
```

### 3. Session Cleanup

```typescript
const handleSignOut = async () => {
  try {
    await signOut() // Clears tokens and session
    dispatchAdmin({ type: 'RESET' }) // Reset admin state
    router.push('/signed-out') // Confirm sign out
  } catch (error) {
    // Fallback: still redirect even if sign out fails
    router.push('/signed-out')
  }
}
```

## Performance Optimization

### 1. TTL Caching

```typescript
const ADMIN_CACHE_TTL = 30 * 60 * 1000 // 30 minutes

type AdminState = 
  | { status: 'yes'; roles: string[]; checkedAt: number }
  // ... other states

const isExpired = (checkedAt: number): boolean => {
  return Date.now() - checkedAt > ADMIN_CACHE_TTL
}

// Auto-revalidate expired cache
useEffect(() => {
  if (adminState.status === 'yes' && isExpired(adminState.checkedAt)) {
    dispatchAdmin({ type: 'CACHE_EXPIRED' })
    checkAdminStatus()
  }
}, [adminState])
```

### 2. Performance Monitoring

```typescript
const checkAdminStatus = async (): Promise<void> => {
  const startTime = performance.now()
  
  try {
    const response = await fetch('/api/admin/check', {...})
    const duration = performance.now() - startTime
    
    console.log('Admin check completed:', { 
      status: response.status, 
      duration: `${duration.toFixed(2)}ms` 
    })
  } catch (error) {
    const duration = performance.now() - startTime
    console.error('Admin check failed:', { error, duration: `${duration.toFixed(2)}ms` })
  }
}
```

### 3. Lazy Loading Admin Features

```typescript
// Only load admin components when needed
const AdminDashboard = lazy(() => import('@/components/admin/AdminDashboard'))
const AdminSidebar = lazy(() => import('@/components/admin/AdminSidebar'))

// Preload admin routes for faster navigation
useEffect(() => {
  if (adminState.status === 'yes') {
    import('@/components/admin/AdminDashboard')
    import('@/components/admin/AdminSidebar')
  }
}, [adminState])
```

## TypeScript Patterns

### 1. Progressive Type Safety

```typescript
// Start with working code, then add types
// Phase 1: Get it working
const adminCheck = async (userId: any) => {
  const result = await fetch('/api/admin/check', {
    body: JSON.stringify({ userId })
  })
  return result.json()
}

// Phase 2: Add proper types
interface AdminCheckRequest {
  userId: string
}

interface AdminCheckResponse {
  isAdmin: boolean
  roles?: string[]
  error?: string
}

const adminCheck = async (userId: string): Promise<AdminCheckResponse> => {
  const response = await fetch('/api/admin/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId } satisfies AdminCheckRequest)
  })
  
  if (!response.ok) {
    throw new Error(`Admin check failed: ${response.status}`)
  }
  
  return response.json() as Promise<AdminCheckResponse>
}
```

### 2. Strict Type Guards

```typescript
// Type guards for runtime safety
function isAdminState(state: unknown): state is AdminState {
  return (
    typeof state === 'object' && 
    state !== null && 
    'status' in state &&
    ['pending', 'error', 'no', 'yes'].includes((state as any).status)
  )
}

// Use in components
if (isAdminState(adminState) && adminState.status === 'yes') {
  // TypeScript knows adminState has roles and checkedAt
  return <AdminDashboard roles={adminState.roles} />
}
```

## Next.js Specific Patterns

### 1. Server Components for Initial Auth

```typescript
// ✅ GOOD: Use Server Components for initial auth checks
// /app/admin/layout.tsx
export default async function AdminLayout({ children }) {
  // Server-side auth check - happens before page loads
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?redirect=/admin')
  }
  
  // Pass minimal data to client components
  return (
    <AdminProvider user={user}>
      {children}
    </AdminProvider>
  )
}
```

### 2. Client Components for Interactive Auth

```typescript
// ✅ GOOD: Client Components for auth interactions
// /components/auth/LoginForm.tsx
'use client'

export default function LoginForm() {
  const { signIn, user } = useAuth()
  
  // Interactive login logic...
  const handleSubmit = async (email: string, password: string) => {
    const { error } = await signIn(email, password)
    // Handle result...
  }
  
  return <form onSubmit={handleSubmit}>...</form>
}
```

### 3. Middleware for Route Protection

```typescript
// middleware.ts - Runs before pages load
export async function middleware(request: NextRequest) {
  const supabase = createClient(request)
  const { data: { user } } = await supabase.auth.getUser()
  
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login?redirect=/admin', request.url))
    }
    
    // Additional admin check can happen here or in layout
  }
  
  return NextResponse.next()
}
```

## Development Workflow

### 1. Incremental Development Strategy

```
Phase 1: Basic Authentication
├─ User signup/signin
├─ Session management
└─ Protected routes

Phase 2: Role-Based Authorization  
├─ Admin role detection
├─ Permission checking
└─ Role-based UI

Phase 3: Production Hardening
├─ Error handling & retry logic
├─ Performance optimization
├─ Security audit
└─ Monitoring & logging
```

### 2. Testing Strategy

```typescript
// Test auth flows at multiple levels
describe('Admin Authorization', () => {
  // Unit tests: State management
  test('adminReducer handles state transitions', () => {
    const state = adminReducer({ status: 'pending' }, { type: 'CHECK_SUCCESS', isAdmin: true, roles: ['admin'] })
    expect(state).toEqual({ status: 'yes', roles: ['admin'], checkedAt: expect.any(Number) })
  })
  
  // Integration tests: API routes
  test('admin check API returns correct response', async () => {
    const response = await POST(new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ userId: 'test-user-id' })
    }))
    const result = await response.json()
    expect(result).toHaveProperty('isAdmin')
  })
  
  // E2E tests: Complete flows
  test('admin user can access admin dashboard', async () => {
    await page.goto('/login?redirect=/admin')
    await page.fill('[data-testid="email"]', 'admin@test.com')
    await page.fill('[data-testid="password"]', 'password')
    await page.click('[data-testid="login-submit"]')
    await expect(page).toHaveURL('/admin')
    await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible()
  })
})
```

### 3. Debug Instrumentation

```typescript
// Comprehensive logging for auth flows
const DEBUG_AUTH = process.env.NODE_ENV === 'development'

const checkAdminStatus = async () => {
  if (DEBUG_AUTH) {
    console.log('=== ADMIN CHECK START ===', { 
      userId: user?.id, 
      currentState: adminState.status,
      timestamp: new Date().toISOString()
    })
  }
  
  try {
    // ... admin check logic
    
    if (DEBUG_AUTH) {
      console.log('✅ Admin check successful', { isAdmin, duration })
    }
  } catch (error) {
    if (DEBUG_AUTH) {
      console.error('❌ Admin check failed', { error, duration })
    }
  } finally {
    if (DEBUG_AUTH) {
      console.log('=== ADMIN CHECK END ===')
    }
  }
}
```

## Common Pitfalls

### 1. Race Conditions

```typescript
// ❌ BAD: Multiple async operations without coordination
useEffect(() => {
  loadUser()
  checkAdmin() // Might run before user is loaded
  loadProfile()
}, [])

// ✅ GOOD: Sequential async operations with proper dependencies
useEffect(() => {
  loadUser()
}, [])

useEffect(() => {
  if (user && adminState.status === 'pending') {
    checkAdmin()
  }
}, [user, adminState.status])
```

### 2. Infinite Loops

```typescript
// ❌ BAD: Missing dependency causes infinite loops
useEffect(() => {
  if (user) {
    checkAdminStatus()
  }
}, [user]) // Missing checkAdminStatus dependency

// ✅ GOOD: Stable function reference prevents loops
const checkAdminStatus = useCallback(async () => {
  // ... check logic
}, [user?.id]) // Only recreate when user ID changes

useEffect(() => {
  if (user) {
    checkAdminStatus()
  }
}, [user, checkAdminStatus])
```

### 3. State Synchronization

```typescript
// ❌ BAD: State updates in wrong order
const handleLogin = async () => {
  setUser(newUser)
  setIsLoading(false) // Loading ends before user is processed
  checkAdmin()
}

// ✅ GOOD: Proper state coordination
const handleLogin = async () => {
  setUser(newUser)
  // Let useEffect handle admin check based on user change
  // Loading state managed by adminState reducer
}
```

### 4. Server-Client Hydration Issues

```typescript
// ❌ BAD: Server and client render different content
function AuthStatus() {
  const { user } = useAuth()
  return <div>{user ? 'Logged in' : 'Logged out'}</div>
}

// ✅ GOOD: Handle hydration safely
function AuthStatus() {
  const { user, bootstrapLoading } = useAuth()
  
  if (bootstrapLoading) {
    return <div>Loading...</div> // Same on server and client
  }
  
  return <div>{user ? 'Logged in' : 'Logged out'}</div>
}
```

## Best Practices Checklist

### Pre-Development
- [ ] Define all possible auth states with discriminated unions
- [ ] Plan server-client boundaries and API surface
- [ ] Design error handling and retry strategies
- [ ] Consider caching and performance implications

### During Development
- [ ] Separate bootstrap loading from feature loading states
- [ ] Use useReducer for complex state machines
- [ ] Implement proper TypeScript types progressively
- [ ] Add comprehensive error boundaries
- [ ] Log state transitions for debugging

### Security Review
- [ ] All critical auth checks happen server-side
- [ ] Sensitive data never reaches client bundle
- [ ] Sessions are properly cleaned up on sign out
- [ ] Rate limiting on auth endpoints
- [ ] Audit logs for admin actions

### Performance Review
- [ ] Auth state is cached with appropriate TTL
- [ ] Heavy operations are server-side or lazy loaded
- [ ] No unnecessary re-renders in auth components
- [ ] Monitoring and alerting for auth failures

### Production Readiness
- [ ] Graceful fallbacks for all error scenarios
- [ ] Clear user feedback for all loading states
- [ ] Comprehensive test coverage (unit, integration, e2e)
- [ ] Error monitoring and alerting
- [ ] Performance monitoring and optimization

## Conclusion

Authorization systems are complex by nature, involving multiple async operations, security concerns, and user experience considerations. The key to success is:

1. **Start Simple**: Basic auth first, then add features incrementally
2. **Separate Concerns**: Authentication, authorization, and UI are distinct layers
3. **Handle Errors Gracefully**: Every async operation can fail
4. **Think Server-First**: Security-critical operations belong server-side
5. **Monitor Everything**: Add instrumentation from the beginning

This guide represents hard-won lessons from building a production-ready authorization system. Use it as a reference for future development and adapt the patterns to your specific needs.

---

*Last Updated: July 2025*  
*Based on: Prism Health Lab Admin Authorization System Development*