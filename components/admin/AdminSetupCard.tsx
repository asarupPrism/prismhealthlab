'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface AdminSetupCardProps {
  needsSetup: boolean
  hasRoles: boolean
  hasDepartments: boolean
  errors: {
    roles?: string
    departments?: string
  }
}

export default function AdminSetupCard({ 
  needsSetup, 
  hasRoles, 
  hasDepartments, 
  errors 
}: AdminSetupCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [setupResult, setSetupResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const handleSetup = async () => {
    setIsLoading(true)
    setSetupResult(null)

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Setup failed')
      }

      setSetupResult({
        success: true,
        message: result.message || 'Setup completed successfully!'
      })

      // Reload the page after a short delay to show updated data
      setTimeout(() => {
        window.location.reload()
      }, 2000)

    } catch (error) {
      setSetupResult({
        success: false,
        message: error instanceof Error ? error.message : 'Setup failed'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-sm bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-400/30 rounded-2xl shadow-lg shadow-amber-900/30"
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Warning Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-white mb-2">
              Admin Setup Required
            </h2>
            
            <div className="space-y-4">
              {/* Status Information */}
              <div className="space-y-2">
                <p className="text-slate-300">
                  The admin system requires initial setup to create staff roles and departments.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {/* Roles Status */}
                  <div className="flex items-center gap-3 p-3 bg-slate-900/30 border border-slate-700/30 rounded-xl">
                    <div className={`w-3 h-3 rounded-full ${hasRoles ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                    <div>
                      <div className="text-sm font-medium text-white">Staff Roles</div>
                      <div className="text-xs text-slate-400">
                        {hasRoles ? 'Available' : 'Missing'}
                        {errors.roles && ` (Error: ${errors.roles})`}
                      </div>
                    </div>
                  </div>

                  {/* Departments Status */}
                  <div className="flex items-center gap-3 p-3 bg-slate-900/30 border border-slate-700/30 rounded-xl">
                    <div className={`w-3 h-3 rounded-full ${hasDepartments ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                    <div>
                      <div className="text-sm font-medium text-white">Departments</div>
                      <div className="text-xs text-slate-400">
                        {hasDepartments ? 'Available' : 'Missing'}
                        {errors.departments && ` (Error: ${errors.departments})`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Setup Result */}
              {setupResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-4 rounded-xl border ${
                    setupResult.success
                      ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300'
                      : 'bg-rose-500/20 border-rose-400/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      setupResult.success ? 'bg-emerald-400' : 'bg-rose-400'
                    }`}></div>
                    {setupResult.message}
                  </div>
                </motion.div>
              )}

              {/* Setup Instructions */}
              {needsSetup && !setupResult?.success && (
                <div className="bg-slate-900/30 border border-slate-700/30 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-white mb-2">What will be created:</h3>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                      7 default staff roles (Super Admin, System Admin, Lab Manager, etc.)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                      6 organizational departments (Administration, Lab Operations, etc.)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                      Database tables and security policies
                    </li>
                  </ul>
                </div>
              )}

              {/* Setup Button */}
              {needsSetup && !setupResult?.success && (
                <div className="flex items-center justify-end pt-4">
                  <button
                    onClick={handleSetup}
                    disabled={isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-xl hover:from-amber-400 hover:to-orange-500 transition-all duration-300 shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Setting up...
                      </div>
                    ) : (
                      'Initialize Admin System'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}