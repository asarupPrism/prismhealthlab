'use client'

import React, { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context'
import SignupForm from '@/components/auth/SignupForm'

function SignupPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, bootstrapLoading } = useAuth()
  
  // Get redirect URL from query params
  const redirectTo = searchParams?.get('redirect') || '/portal'

  // If user is already authenticated, redirect them
  useEffect(() => {
    if (!bootstrapLoading && user) {
      router.push(redirectTo)
    }
  }, [user, bootstrapLoading, redirectTo, router])

  // Handle successful signup
  const handleSignupSuccess = () => {
    // Redirect to the intended page after successful signup
    router.push(redirectTo)
  }

  // Show loading while checking auth state
  if (bootstrapLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-300">Loading...</span>
        </div>
      </div>
    )
  }

  // Don't render signup form if user is already authenticated
  if (user) {
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
              Join Prism Health Lab
            </h1>
            <p className="text-slate-400 text-lg">
              Create your account to access health insights
            </p>
          </div>

          {/* Signup Form */}
          <SignupForm 
            onSuccess={handleSignupSuccess}
            showSwitchToLogin={true}
            onSwitchToLogin={() => router.push('/login')}
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

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-300">Loading...</span>
        </div>
      </div>
    }>
      <SignupPageContent />
    </Suspense>
  )
}