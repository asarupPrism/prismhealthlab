'use client'

import { createContext, useContext } from 'react'
import { User, Session } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'

// Admin state with role extensibility and caching
export type AdminState =
  | { status: 'pending' }
  | { status: 'error'; message: string; retryCount: number }
  | { status: 'no' }
  | { status: 'yes'; roles: string[]; checkedAt: number }

// Auth state interface - only read-only state
export interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  bootstrapLoading: boolean
  adminState: AdminState
}

// Helper functions for admin state
export const isAdminStateLoading = (adminState: AdminState): boolean => {
  return adminState.status === 'pending'
}

export const isAdminStateError = (adminState: AdminState): boolean => {
  return adminState.status === 'error'
}

export const isAdmin = (adminState: AdminState): boolean => {
  return adminState.status === 'yes'
}

export const getAdminRoles = (adminState: AdminState): string[] => {
  return adminState.status === 'yes' ? adminState.roles : []
}

export const hasAdminRole = (adminState: AdminState, role: string): boolean => {
  return adminState.status === 'yes' && adminState.roles.includes(role)
}

export const getAdminErrorMessage = (adminState: AdminState): string | null => {
  return adminState.status === 'error' ? adminState.message : null
}

export const canRetryAdminCheck = (adminState: AdminState): boolean => {
  return adminState.status === 'error' && adminState.retryCount < 3
}

// Auth state context - only provides read-only state
const AuthStateContext = createContext<AuthState | undefined>(undefined)

export function useAuthState() {
  const context = useContext(AuthStateContext)
  if (context === undefined) {
    throw new Error('useAuthState must be used within an AuthProvider')
  }
  return context
}

// Specific hooks for individual state pieces to minimize re-renders
export function useUser() {
  const { user } = useAuthState()
  return user
}

export function useProfile() {
  const { profile } = useAuthState()
  return profile
}

export function useSession() {
  const { session } = useAuthState()
  return session
}

export function useBootstrapLoading() {
  const { bootstrapLoading } = useAuthState()
  return bootstrapLoading
}

export function useAdminState() {
  const { adminState } = useAuthState()
  return adminState
}

// Computed state hooks
export function useIsAuthenticated() {
  const user = useUser()
  return user !== null
}

export function useIsAdmin() {
  const adminState = useAdminState()
  return isAdmin(adminState)
}

export function useHasRole(role: string) {
  const adminState = useAdminState()
  return hasAdminRole(adminState, role)
}

export function useAuthLoading() {
  const bootstrapLoading = useBootstrapLoading()
  const adminState = useAdminState()
  return bootstrapLoading || isAdminStateLoading(adminState)
}

export default AuthStateContext