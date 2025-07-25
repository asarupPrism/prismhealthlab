'use client'

// Legacy AuthContext for backward compatibility
// DEPRECATED: Use the new split context approach instead
// Import from './index' for the new optimized hooks

import { createContext } from 'react'
import type { AuthState } from './AuthStateContext'
import type { AuthActions } from './AuthActionsContext'

// Legacy combined interface
export interface AuthContextType extends AuthState, AuthActions {}

// Legacy context for backward compatibility
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export default AuthContext