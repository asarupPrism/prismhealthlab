'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to monitoring service
    console.error('Portal error:', error)
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
          Portal Access Error
        </h1>
        
        <p className="text-slate-300 mb-8">
          We&apos;re having trouble loading your patient portal. This might be due to a temporary issue with your connection or our servers.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25"
          >
            Retry Portal Access
          </button>
          
          <Link
            href="/"
            className="px-6 py-3 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-100 font-semibold rounded-xl hover:bg-slate-600/60 hover:border-slate-500/60 transition-all duration-300"
          >
            Return Home
          </Link>
        </div>
        
        <div className="mt-6 p-4 bg-slate-800/40 rounded-lg border border-slate-700/50">
          <p className="text-xs text-slate-400 mb-2">Troubleshooting tips:</p>
          <ul className="text-xs text-slate-400 text-left space-y-1">
            <li>• Check your internet connection</li>
            <li>• Try refreshing the page</li>
            <li>• Clear your browser cache</li>
            <li>• Contact support if the issue persists</li>
          </ul>
        </div>
        
        {error.digest && (
          <p className="text-xs text-slate-500 mt-4">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}