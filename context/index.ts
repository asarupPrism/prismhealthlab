// Auth context exports
export { AuthProvider, useAuth } from './AuthProvider'

// State-only hooks (for components that only need to read state)
export {
  useAuthState,
  useUser,
  useProfile,
  useSession,
  useBootstrapLoading,
  useAdminState,
  useIsAuthenticated,
  useIsAdmin,
  useHasRole,
  useAuthLoading,
  // Helper functions
  isAdminStateLoading,
  isAdminStateError,
  isAdmin,
  getAdminRoles,
  hasAdminRole,
  getAdminErrorMessage,
  canRetryAdminCheck,
  type AuthState,
  type AdminState,
} from './AuthStateContext'

// Action-only hooks (for components that only need to perform actions)
export {
  useAuthActions,
  useSignUp,
  useSignIn,
  useSignOut,
  useUpdateProfile,
  useAdminActions,
  useRefreshProfile,
  type AuthActions,
} from './AuthActionsContext'

// For backward compatibility, export the original context
export { default as AuthContext } from './AuthContext'