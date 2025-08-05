'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Homepage error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="max-w-md mx-auto text-center">
        <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <div className="w-8 h-8 bg-rose-400 rounded-full flex items-center justify-center">
            <span className="text-slate-950 font-bold">!</span>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-4">
          Something went wrong
        </h1>
        
        <p className="text-slate-300 mb-8">
          We&apos;re sorry, but there was an error loading this page. This might be a temporary issue.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25"
          >
            Try again
          </button>
          
          <Link
            href="/"
            className="px-6 py-3 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-100 font-semibold rounded-xl hover:bg-slate-600/60 hover:border-slate-500/60 transition-all duration-300"
          >
            Go home
          </Link>
        </div>
        
        {error.digest && (
          <p className="text-xs text-slate-500 mt-6">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}