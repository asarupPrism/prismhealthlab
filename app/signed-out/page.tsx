'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/context'

export default function SignedOutPage() {
  const router = useRouter()
  const { user, bootstrapLoading } = useAuth()

  // If user is still logged in (shouldn't happen), redirect to portal
  useEffect(() => {
    if (!bootstrapLoading && user) {
      router.push('/portal')
    }
  }, [user, bootstrapLoading, router])

  // Show loading while checking auth state
  if (bootstrapLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-300">Checking session...</span>
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
        <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
        <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
        <div className="w-2 h-2 bg-slate-700 rounded-full"></div>
      </div>

      {/* Main Content */}
      <div className="relative flex items-center justify-center min-h-screen px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md text-center"
        >
          
          {/* Status Icon */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center border border-slate-600/50">
              <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-slate-400 rounded flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent mb-4">
              Successfully Signed Out
            </h1>
            <p className="text-slate-400 text-lg mb-2">
              Your session has been securely ended
            </p>
            <p className="text-slate-500 text-sm">
              All administrative access has been revoked for security
            </p>
          </div>

          {/* Sign In Options */}
          <div className="space-y-4 mb-8">
            {/* Regular Login */}
            <Link
              href="/login"
              className="block w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25"
            >
              Sign In to Patient Portal
            </Link>

            {/* Admin Login */}
            <Link
              href="/login?redirect=/admin"
              className="block w-full py-4 px-6 backdrop-blur-sm bg-slate-800/60 border border-slate-700/50 text-slate-200 font-medium rounded-xl hover:bg-slate-700/60 hover:border-slate-600/50 transition-all duration-300"
            >
              Admin Portal Access
            </Link>
          </div>

          {/* Additional Options */}
          <div className="space-y-3 text-sm">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 text-slate-400 hover:text-slate-300 transition-colors"
            >
              <div className="w-0 h-0 border-r-2 border-t-2 border-b-2 border-slate-400 border-t-transparent border-b-transparent transform rotate-180"></div>
              Back to Home
            </Link>
            
            <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-800/50">
              <Link
                href="/signup"
                className="text-slate-500 hover:text-slate-400 transition-colors"
              >
                Create Account
              </Link>
              <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
              <Link
                href="/contact"
                className="text-slate-500 hover:text-slate-400 transition-colors"
              >
                Need Help?
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}