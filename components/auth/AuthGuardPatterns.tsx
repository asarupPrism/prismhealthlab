'use client'

import React from 'react'
import { useSSRSafeAuth } from '@/hooks/useSSRSafeAuth'
import { motion } from 'framer-motion'

// Common auth guard patterns with consistent styling

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

// Loading state component
export function AuthLoadingState() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold text-white mb-2">Loading...</h2>
        <p className="text-slate-400">Checking your credentials</p>
      </motion.div>
    </div>
  )
}

// Authentication required state
export function AuthRequiredState() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md mx-auto p-6"
      >
        <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl text-amber-400">🔒</span>
        </div>
        <h2 className="text-xl font-semibold text-white mb-3">Authentication Required</h2>
        <p className="text-slate-400 mb-6">
          Please sign in to access this page. Your health data is protected and requires authentication.
        </p>
        <motion.a
          href="/auth/login"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-block px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-colors"
        >
          Sign In
        </motion.a>
      </motion.div>
    </div>
  )
}

// Admin access required state
export function AdminRequiredState() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md mx-auto p-6"
      >
        <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl text-rose-400">⚠</span>
        </div>
        <h2 className="text-xl font-semibold text-white mb-3">Admin Access Required</h2>
        <p className="text-slate-400 mb-6">
          You don't have administrator permissions to access this page. 
          Contact your system administrator if you believe this is an error.
        </p>
        <motion.a
          href="/portal"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-block px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
        >
          Return to Portal
        </motion.a>
      </motion.div>
    </div>
  )
}

// Role access required state
export function RoleRequiredState({ role }: { role: string }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md mx-auto p-6"
      >
        <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl text-orange-400">🔐</span>
        </div>
        <h2 className="text-xl font-semibold text-white mb-3">Insufficient Permissions</h2>
        <p className="text-slate-400 mb-6">
          You need the <code className="px-2 py-1 bg-slate-800 rounded text-orange-300">{role}</code> role 
          to access this page. Contact your administrator to request access.
        </p>
        <motion.a
          href="/portal"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-block px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
        >
          Return to Portal
        </motion.a>
      </motion.div>
    </div>
  )
}

// Progressive auth guard that shows loading states appropriately
export function ProgressiveAuthGuard({
  children,
  requireAuth = false,
  requireAdmin = false,
  requiredRole,
  showLoadingDuringHydration = true
}: {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  requiredRole?: string
  showLoadingDuringHydration?: boolean
}) {
  const { isAuthenticated, isAdmin, hasRole, isLoading, isHydrated } = useSSRSafeAuth()

  // Show loading during hydration if requested
  if (!isHydrated && showLoadingDuringHydration) {
    return <AuthLoadingState />
  }

  // Show loading during auth checks
  if (isLoading) {
    return <AuthLoadingState />
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    return <AuthRequiredState />
  }

  // Check admin requirement
  if (requireAdmin && !isAdmin) {
    return <AdminRequiredState />
  }

  // Check role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    return <RoleRequiredState role={requiredRole} />
  }

  // All checks passed
  return <>{children}</>
}

// Conditional render based on auth state
export function ConditionalAuthRender({
  children,
  condition,
  fallback,
  showDuringHydration = false
}: {
  children: React.ReactNode
  condition: (auth: ReturnType<typeof useSSRSafeAuth>) => boolean
  fallback?: React.ReactNode
  showDuringHydration?: boolean
}) {
  const auth = useSSRSafeAuth()

  if (!auth.isHydrated) {
    return showDuringHydration ? <>{children}</> : fallback || null
  }

  return condition(auth) ? <>{children}</> : fallback || null
}

// Auth state indicator for debugging
export function AuthStateIndicator() {
  const auth = useSSRSafeAuth()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 p-3 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono z-50">
      <div className="space-y-1">
        <div>Hydrated: {auth.isHydrated ? '✅' : '❌'}</div>
        <div>Auth: {auth.isAuthenticated ? '✅' : '❌'}</div>
        <div>Admin: {auth.isAdmin ? '✅' : '❌'}</div>
        <div>Loading: {auth.isLoading ? '⏳' : '✅'}</div>
        <div>User: {auth.user?.email || 'None'}</div>
        <div className="text-slate-400">
          Admin Status: {auth.adminState.status}
        </div>
      </div>
    </div>
  )
}