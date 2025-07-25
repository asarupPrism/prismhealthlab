'use client'

import { useState, useEffect } from 'react'
import { 
  useAuthState, 
  useUser, 
  useProfile, 
  useAdminState, 
  useIsAuthenticated,
  useIsAdmin,
  useHasRole,
  useAuthLoading,
  type AdminState 
} from '@/context'

// SSR-safe wrapper for auth state that prevents hydration mismatches
export function useSSRSafeAuthState() {
  const [isHydrated, setIsHydrated] = useState(false)
  const authState = useAuthState()

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Return safe default values during SSR/hydration
  if (!isHydrated) {
    return {
      user: null,
      profile: null,
      session: null,
      bootstrapLoading: true,
      adminState: { status: 'pending' } as AdminState,
      isHydrated: false
    }
  }

  return {
    ...authState,
    isHydrated: true
  }
}

// SSR-safe user hook
export function useSSRSafeUser() {
  const [isHydrated, setIsHydrated] = useState(false)
  const user = useUser()

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return {
    user: isHydrated ? user : null,
    isHydrated
  }
}

// SSR-safe profile hook
export function useSSRSafeProfile() {
  const [isHydrated, setIsHydrated] = useState(false)
  const profile = useProfile()

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return {
    profile: isHydrated ? profile : null,
    isHydrated
  }
}

// SSR-safe admin state hook
export function useSSRSafeAdminState() {
  const [isHydrated, setIsHydrated] = useState(false)
  const adminState = useAdminState()

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return {
    adminState: isHydrated ? adminState : { status: 'pending' } as AdminState,
    isHydrated
  }
}

// SSR-safe authentication check
export function useSSRSafeIsAuthenticated() {
  const [isHydrated, setIsHydrated] = useState(false)
  const isAuthenticated = useIsAuthenticated()

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return {
    isAuthenticated: isHydrated ? isAuthenticated : false,
    isHydrated
  }
}

// SSR-safe admin check
export function useSSRSafeIsAdmin() {
  const [isHydrated, setIsHydrated] = useState(false)
  const isAdmin = useIsAdmin()

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return {
    isAdmin: isHydrated ? isAdmin : false,
    isHydrated
  }
}

// SSR-safe role check
export function useSSRSafeHasRole(role: string) {
  const [isHydrated, setIsHydrated] = useState(false)
  const hasRole = useHasRole(role)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return {
    hasRole: isHydrated ? hasRole : false,
    isHydrated
  }
}

// SSR-safe loading state
export function useSSRSafeAuthLoading() {
  const [isHydrated, setIsHydrated] = useState(false)
  const authLoading = useAuthLoading()

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return {
    authLoading: isHydrated ? authLoading : true,
    isHydrated
  }
}

// Combined hook for common auth patterns with SSR safety
export function useSSRSafeAuth() {
  const [isHydrated, setIsHydrated] = useState(false)
  const authState = useAuthState()

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const safeAuthState = isHydrated ? authState : {
    user: null,
    profile: null,
    session: null,
    bootstrapLoading: true,
    adminState: { status: 'pending' } as AdminState,
  }

  return {
    ...safeAuthState,
    isHydrated,
    // Computed values with SSR safety
    isAuthenticated: isHydrated ? safeAuthState.user !== null : false,
    isAdmin: isHydrated ? safeAuthState.adminState.status === 'yes' : false,
    isLoading: isHydrated ? safeAuthState.bootstrapLoading || safeAuthState.adminState.status === 'pending' : true,
    hasRole: (role: string) => {
      if (!isHydrated) return false
      return safeAuthState.adminState.status === 'yes' && safeAuthState.adminState.roles.includes(role)
    }
  }
}

// Hook for client-only rendering (completely skip SSR for auth-dependent content)
export function useClientOnly() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}

// Higher-order hook for components that need to wait for hydration
export function useHydratedAuth<T>(callback: () => T, fallback: T) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) {
    return fallback
  }

  return callback()
}