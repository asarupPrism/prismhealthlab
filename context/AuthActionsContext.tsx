'use client'

import { createContext, useContext } from 'react'
import { AuthError } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'

// Auth actions interface - only actions/methods
export interface AuthActions {
  signUp: (email: string, password: string, userData?: Partial<Profile>) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>
  checkAdminStatus: () => Promise<void>
  retryAdminCheck: () => Promise<void>
  refreshProfile: () => Promise<void>
}

// Auth actions context - only provides methods
const AuthActionsContext = createContext<AuthActions | undefined>(undefined)

export function useAuthActions() {
  const context = useContext(AuthActionsContext)
  if (context === undefined) {
    throw new Error('useAuthActions must be used within an AuthProvider')
  }
  return context
}

// Specific action hooks for better developer experience
export function useSignUp() {
  const { signUp } = useAuthActions()
  return signUp
}

export function useSignIn() {
  const { signIn } = useAuthActions()
  return signIn
}

export function useSignOut() {
  const { signOut } = useAuthActions()
  return signOut
}

export function useUpdateProfile() {
  const { updateProfile } = useAuthActions()
  return updateProfile
}

export function useAdminActions() {
  const { checkAdminStatus, retryAdminCheck } = useAuthActions()
  return { checkAdminStatus, retryAdminCheck }
}

export function useRefreshProfile() {
  const { refreshProfile } = useAuthActions()
  return refreshProfile
}

export default AuthActionsContext