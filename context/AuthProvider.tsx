'use client'

import { useEffect, useState, useReducer, useCallback, useMemo } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'
import AuthStateContext, { type AuthState, type AdminState } from './AuthStateContext'
import AuthActionsContext, { type AuthActions } from './AuthActionsContext'

// Admin state actions
type AdminAction =
  | { type: 'CHECK_START' }
  | { type: 'CHECK_SUCCESS'; isAdmin: boolean; roles: string[] }
  | { type: 'CHECK_ERROR'; message: string }
  | { type: 'CHECK_RETRY'; retryCount: number }
  | { type: 'CACHE_EXPIRED' }
  | { type: 'RESET' }

// Constants for admin state management
const ADMIN_CACHE_TTL = 30 * 60 * 1000 // 30 minutes
const MAX_RETRY_COUNT = 3
const RETRY_DELAYS = [1000, 2000, 4000] // Exponential backoff

// Admin state reducer
const adminReducer = (state: AdminState, action: AdminAction): AdminState => {
  switch (action.type) {
    case 'CHECK_START':
      return { status: 'pending' }
    
    case 'CHECK_SUCCESS':
      return action.isAdmin
        ? {
            status: 'yes' as const,
            roles: action.roles,
            checkedAt: Date.now()
          }
        : { status: 'no' as const }
    
    case 'CHECK_ERROR':
      return {
        status: 'error',
        message: action.message,
        retryCount: state.status === 'error' ? state.retryCount + 1 : 1
      }
    
    case 'CHECK_RETRY':
      return {
        status: 'error',
        message: state.status === 'error' ? state.message : 'Unknown error',
        retryCount: action.retryCount
      }
    
    case 'CACHE_EXPIRED':
      return { status: 'pending' }
    
    case 'RESET':
      return { status: 'pending' }
    
    default:
      return state
  }
}

// Helper function to check if cache is expired
const isExpired = (checkedAt: number): boolean => {
  return Date.now() - checkedAt > ADMIN_CACHE_TTL
}

// Helper function to get error message
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'An unexpected error occurred'
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // State management
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [bootstrapLoading, setBootstrapLoading] = useState(true)
  const [adminState, dispatchAdmin] = useReducer(adminReducer, { status: 'pending' })
  
  const supabase = createClient()

  // Load profile function
  const loadProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error)
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }, [supabase])

  // Admin check function with instrumentation and caching
  const checkAdminStatus = useCallback(async (): Promise<void> => {
    if (!user) {
      dispatchAdmin({ type: 'RESET' })
      return
    }

    const startTime = performance.now()
    
    try {
      console.log('=== ADMIN CHECK START ===', { userId: user.id })
      dispatchAdmin({ type: 'CHECK_START' })
      
      const response = await fetch('/api/admin/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })

      const duration = performance.now() - startTime
      console.log('Admin check API response:', { status: response.status, duration })

      if (!response.ok) {
        throw new Error(`Admin check failed with status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Admin check result:', result)

      if (result.error) {
        throw new Error(result.error)
      }

      // Success - dispatch with roles (default to ['admin'] for now)
      dispatchAdmin({
        type: 'CHECK_SUCCESS',
        isAdmin: result.isAdmin === true,
        roles: result.roles || (result.isAdmin ? ['admin'] : [])
      })

      console.log('✅ Admin check completed successfully')
      
    } catch (error) {
      const duration = performance.now() - startTime
      const errorMessage = getErrorMessage(error)
      
      console.error('Admin check error:', { error: errorMessage, duration })
      
      dispatchAdmin({
        type: 'CHECK_ERROR',
        message: errorMessage
      })
    }
    
    console.log('=== ADMIN CHECK END ===')
  }, [user])

  // Retry function with exponential backoff
  const retryAdminCheck = useCallback(async (): Promise<void> => {
    if (adminState.status !== 'error' || adminState.retryCount >= MAX_RETRY_COUNT) {
      return
    }

    const delay = RETRY_DELAYS[adminState.retryCount - 1] || RETRY_DELAYS[RETRY_DELAYS.length - 1]
    console.log(`Retrying admin check in ${delay}ms (attempt ${adminState.retryCount + 1}/${MAX_RETRY_COUNT})`)
    
    await new Promise(resolve => setTimeout(resolve, delay))
    await checkAdminStatus()
  }, [adminState, checkAdminStatus])

  // Refresh profile function
  const refreshProfile = useCallback(async (): Promise<void> => {
    if (user) {
      await loadProfile(user.id)
    }
  }, [user, loadProfile])

  // Auth actions
  const signUp = useCallback(async (email: string, password: string, userData?: Partial<Profile>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData ? {
            first_name: userData.first_name,
            last_name: userData.last_name,
            phone: userData.phone,
          } : {},
        },
      })

      if (!error && data.user) {
        // Create profile after successful signup
        const profileData: Partial<Profile> = {
          user_id: data.user.id,
          email: data.user.email!,
          first_name: userData?.first_name || null,
          last_name: userData?.last_name || null,
          phone: userData?.phone || null,
          ...userData,
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .insert([profileData])

        if (profileError) {
          console.error('Error creating profile:', profileError)
        }
      }

      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }, [supabase])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }, [supabase])

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }, [supabase])

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!user) {
      return { error: new Error('No user logged in') }
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single()

      if (!error && data) {
        setProfile(data)
      }

      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }, [user, supabase])

  // Bootstrap effect - only handles initial session loading
  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
      } else {
        setSession(session)
        setUser(session?.user ?? null)
        
        // Load profile if user exists
        if (session?.user) {
          await loadProfile(session.user.id)
        }
      }
      
      // Bootstrap is complete - regardless of whether there's a user
      setBootstrapLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        // Load profile for new sessions
        if (session?.user && event === 'SIGNED_IN') {
          await loadProfile(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          setProfile(null)
          // Reset admin state on sign out
          dispatchAdmin({ type: 'RESET' })
        }
        
        // Auth state change completed - bootstrap is done
        setBootstrapLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, loadProfile])

  // Admin check effect - only runs after bootstrap is complete
  useEffect(() => {
    if (bootstrapLoading || !user) return
    
    if (adminState.status === 'pending') {
      console.log('Bootstrap complete, user authenticated, triggering admin check')
      checkAdminStatus()
    }
  }, [bootstrapLoading, user, adminState.status, checkAdminStatus])

  // Cache expiration check - only when not in bootstrap
  useEffect(() => {
    if (bootstrapLoading || !user) return
    
    if (adminState.status === 'yes' && isExpired(adminState.checkedAt)) {
      console.log('Admin cache expired, revalidating')
      dispatchAdmin({ type: 'CACHE_EXPIRED' })
      checkAdminStatus()
    }
  }, [bootstrapLoading, user, adminState, checkAdminStatus])

  // Memoize auth state to prevent unnecessary re-renders
  const authState = useMemo<AuthState>(() => ({
    user,
    profile,
    session,
    bootstrapLoading,
    adminState,
  }), [user, profile, session, bootstrapLoading, adminState])

  // Memoize auth actions to prevent unnecessary re-renders
  const authActions = useMemo<AuthActions>(() => ({
    signUp,
    signIn,
    signOut,
    updateProfile,
    checkAdminStatus,
    retryAdminCheck,
    refreshProfile,
  }), [signUp, signIn, signOut, updateProfile, checkAdminStatus, retryAdminCheck, refreshProfile])

  return (
    <AuthStateContext.Provider value={authState}>
      <AuthActionsContext.Provider value={authActions}>
        {children}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  )
}

// Legacy hook for backward compatibility - prefer specific hooks
export function useAuth() {
  const state = useContext(AuthStateContext)
  const actions = useContext(AuthActionsContext)
  
  if (state === undefined || actions === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return { ...state, ...actions }
}