'use client'

import React, { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context'
import LoginForm from '@/components/auth/LoginForm'
import { User } from '@/types/shared'

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, bootstrapLoading, adminState, retryAdminCheck } = useAuth()
  
  // Get redirect URL from query params - check if this is admin login
  const redirectTo = searchParams?.get('redirect') || '/portal'
  const isAdminLogin = redirectTo.includes('/admin')

  // Auto-redirect effect based on auth state
  useEffect(() => {
    // Don't redirect during bootstrap or if no user
    if (bootstrapLoading || !user) return
    
    // For admin login, wait for admin state to be determined
    if (isAdminLogin) {
      if (adminState.status === 'yes') {
        console.log('Admin access confirmed, redirecting to:', redirectTo)
        router.push(redirectTo)
      }
      // For 'pending', 'error', or 'no' states, let the render logic handle it
      return
    }
    
    // For non-admin login, redirect immediately
    console.log('Non-admin login, redirecting to:', redirectTo)
    router.push(redirectTo)
  }, [user, bootstrapLoading, adminState, isAdminLogin, redirectTo, router])

  // Handle successful login - AuthContext will automatically handle admin checks
  const handleLoginSuccess = async (newUser: User) => {
    console.log('Login successful for user:', newUser.id)
    // AuthContext will automatically trigger admin check via useEffect
    // and the redirect will be handled by our useEffect above
  }

  // Debug logging
  console.log('LoginPageContent render - State:', { 
    bootstrapLoading, 
    user: !!user, 
    adminState, 
    isAdminLogin
  })

  // Clean declarative render logic following the pattern you outlined
  if (bootstrapLoading) {
    console.log("Showing loading: bootstrap")
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-300">Loading session...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log("Showing login form")
    // Show login form - main content below
  } else if (adminState.status === 'pending') {
    console.log("Showing loading: verifying admin")
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-300">Verifying admin access...</span>
        </div>
      </div>
    )
  } else if (adminState.status === 'error') {
    console.log("Showing admin error")
    // Admin error will be shown in the form below
  } else if (user && adminState.status === 'yes' && isAdminLogin) {
    console.log("Admin access confirmed - should redirect (showing redirecting state)")
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Redirecting to admin...</p>
        </div>
      </div>
    )
  } else if (user && adminState.status === 'no' && isAdminLogin) {
    console.log("Admin access denied")
    // Will show login form with error below
  } else if (user && !isAdminLogin) {
    console.log("Non-admin user - should redirect (showing redirecting state)")
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950"></div>
      
      {/* Medical indicators */}
      <div className="absolute top-8 left-8 flex items-center gap-4">
        <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Main Content */}
      <div className="relative flex items-center justify-center min-h-screen px-6 py-12">
        <div className="w-full max-w-md">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent mb-4">
              {isAdminLogin ? 'Admin Portal' : 'Prism Health Lab'}
            </h1>
            <p className="text-slate-400 text-lg">
              {isAdminLogin 
                ? 'Secure administrative access - staff credentials required'
                : 'Secure access to your health dashboard'
              }
            </p>
            {isAdminLogin && (
              <div className="mt-4 flex items-center justify-center gap-2 text-amber-300 text-sm">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                <span>Administrative privileges required</span>
              </div>
            )}
          </div>

          {/* Admin Error Display */}
          {(adminState.status === 'error' || (user && adminState.status === 'no' && isAdminLogin)) && (
            <div className="mb-6 p-4 bg-rose-900/20 border border-rose-700/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-rose-400 rounded-full animate-pulse"></div>
                <span className="text-rose-300 text-sm font-medium">
                  {adminState.status === 'error' 
                    ? adminState.message 
                    : 'Access denied. This account does not have admin privileges.'
                  }
                </span>
              </div>
              {adminState.status === 'error' && adminState.retryCount < 3 && (
                <button
                  onClick={retryAdminCheck}
                  className="mt-3 text-cyan-400 hover:text-cyan-300 text-sm underline"
                >
                  Retry admin check
                </button>
              )}
            </div>
          )}

          {/* Login Form */}
          <LoginForm 
            onSuccess={handleLoginSuccess}
            showSwitchToSignup={!isAdminLogin}
            onSwitchToSignup={() => router.push('/signup')}
            isAdminLogin={isAdminLogin}
          />

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <button 
              onClick={() => router.push('/')}
              className="text-slate-400 hover:text-slate-300 transition-colors text-sm flex items-center gap-2 mx-auto"
            >
              <div className="w-0 h-0 border-r-2 border-t-2 border-b-2 border-slate-400 border-t-transparent border-b-transparent transform rotate-180"></div>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-300">Loading...</span>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  )
}