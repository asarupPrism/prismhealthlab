'use client'

import React from 'react'
import { useSSRSafeAuth, useClientOnly } from '@/hooks/useSSRSafeAuth'
import { redirect } from 'next/navigation'

interface SSRSafeAuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  requiredRole?: string
  fallback?: React.ReactNode
  redirectTo?: string
  showLoadingOnSSR?: boolean
}

// Loading component for auth checks
function AuthLoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400">Checking authentication...</p>
      </div>
    </div>
  )
}

// SSR-safe auth guard component
export default function SSRSafeAuthGuard({
  children,
  requireAuth = false,
  requireAdmin = false,
  requiredRole,
  fallback,
  redirectTo,
  showLoadingOnSSR = false
}: SSRSafeAuthGuardProps) {
  const isClient = useClientOnly()
  const { isAuthenticated, isAdmin, hasRole, isLoading, isHydrated } = useSSRSafeAuth()

  // During SSR or before hydration
  if (!isClient || !isHydrated) {
    if (showLoadingOnSSR) {
      return fallback || <AuthLoadingFallback />
    }
    // For SSR, render children to avoid hydration mismatch
    // Auth checks will happen on client-side
    return <>{children}</>
  }

  // Show loading during auth bootstrap
  if (isLoading) {
    return fallback || <AuthLoadingFallback />
  }

  // Auth requirements check
  if (requireAuth && !isAuthenticated) {
    if (redirectTo) {
      redirect(redirectTo)
    }
    return fallback || (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Authentication Required</h2>
          <p className="text-slate-400">Please sign in to access this page.</p>
        </div>
      </div>
    )
  }

  // Admin requirements check
  if (requireAdmin && !isAdmin) {
    if (redirectTo) {
      redirect(redirectTo)
    }
    return fallback || (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Admin Access Required</h2>
          <p className="text-slate-400">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    )
  }

  // Role requirements check
  if (requiredRole && !hasRole(requiredRole)) {
    if (redirectTo) {
      redirect(redirectTo)
    }
    return fallback || (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Insufficient Permissions</h2>
          <p className="text-slate-400">You need the {requiredRole} role to access this page.</p>
        </div>
      </div>
    )
  }

  // All checks passed, render children
  return <>{children}</>
}

// Convenience components for common auth patterns

// Requires authentication
export function AuthRequired({ 
  children, 
  fallback, 
  redirectTo = '/auth/login' 
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}) {
  return (
    <SSRSafeAuthGuard
      requireAuth
      fallback={fallback}
      redirectTo={redirectTo}
      showLoadingOnSSR={true}
    >
      {children}
    </SSRSafeAuthGuard>
  )
}

// Requires admin access
export function AdminRequired({ 
  children, 
  fallback,
  redirectTo = '/portal?error=access-denied' 
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}) {
  return (
    <SSRSafeAuthGuard
      requireAuth
      requireAdmin
      fallback={fallback}
      redirectTo={redirectTo}
      showLoadingOnSSR={true}
    >
      {children}
    </SSRSafeAuthGuard>
  )
}

// Requires specific role
export function RoleRequired({ 
  children, 
  role,
  fallback,
  redirectTo = '/portal?error=access-denied' 
}: {
  children: React.ReactNode
  role: string
  fallback?: React.ReactNode
  redirectTo?: string
}) {
  return (
    <SSRSafeAuthGuard
      requireAuth
      requiredRole={role}
      fallback={fallback}
      redirectTo={redirectTo}
      showLoadingOnSSR={true}
    >
      {children}
    </SSRSafeAuthGuard>
  )
}

// Shows content only when authenticated
export function AuthenticatedOnly({ 
  children, 
  fallback 
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { isAuthenticated, isHydrated } = useSSRSafeAuth()

  if (!isHydrated) {
    return fallback || null
  }

  return isAuthenticated ? <>{children}</> : fallback || null
}

// Shows content only when not authenticated
export function UnauthenticatedOnly({ 
  children, 
  fallback 
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { isAuthenticated, isHydrated } = useSSRSafeAuth()

  if (!isHydrated) {
    return fallback || null
  }

  return !isAuthenticated ? <>{children}</> : fallback || null
}

// Shows content only for admin users
export function AdminOnly({ 
  children, 
  fallback 
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { isAdmin, isHydrated } = useSSRSafeAuth()

  if (!isHydrated) {
    return fallback || null
  }

  return isAdmin ? <>{children}</> : fallback || null
}

// Shows content only for users with specific role
export function RoleOnly({ 
  children, 
  role,
  fallback 
}: {
  children: React.ReactNode
  role: string
  fallback?: React.ReactNode
}) {
  const { hasRole, isHydrated } = useSSRSafeAuth()

  if (!isHydrated) {
    return fallback || null
  }

  return hasRole(role) ? <>{children}</> : fallback || null
}