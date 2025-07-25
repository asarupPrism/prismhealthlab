'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TwoFactorSetup from '@/components/auth/TwoFactorSetup'
import TwoFactorVerification from '@/components/auth/TwoFactorVerification'

interface TwoFactorStatus {
  enabled: boolean
  lastVerification?: string
  backupCodesCount: number
  isLocked: boolean
  lockedUntil?: string
  failedAttempts: number
  recentAttempts: Array<{
    type: string
    success: boolean
    timestamp: string
  }>
}

export default function TwoFactorManager() {
  const [status, setStatus] = useState<TwoFactorStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSetup, setShowSetup] = useState(false)
  const [showDisable, setShowDisable] = useState(false)
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [disablePassword, setDisablePassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/auth/2fa/status')
      const data = await response.json()
      
      if (response.ok) {
        setStatus(data)
      } else {
        setError(data.error || 'Failed to fetch 2FA status')
      }
    } catch (error) {
      console.error('Error fetching 2FA status:', error)
      setError('Failed to load 2FA status')
    } finally {
      setLoading(false)
    }
  }

  const handleSetupComplete = () => {
    setShowSetup(false)
    fetchStatus() // Refresh status
  }

  const handleDisable2FA = async (code: string) => {
    setIsProcessing(true)
    
    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: disablePassword,
          twoFactorCode: code
        }),
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        setShowDisable(false)
        setDisablePassword('')
        await fetchStatus()
        return { success: true }
      } else {
        return { 
          success: false, 
          error: data.error || 'Failed to disable 2FA',
          remainingAttempts: data.remainingAttempts
        }
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error)
      return { success: false, error: 'Failed to disable 2FA' }
    } finally {
      setIsProcessing(false)
    }
  }

  const regenerateBackupCodes = async (code: string) => {
    setIsProcessing(true)
    
    try {
      const response = await fetch('/api/auth/2fa/backup-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          twoFactorCode: code
        }),
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        setShowBackupCodes(false)
        
        // Download new backup codes
        const content = [
          'Prism Health Lab - Two-Factor Authentication Backup Codes',
          '======================================================',
          '',
          'These codes can be used to access your account if you lose your authenticator device.',
          'Each code can only be used once. Store them securely.',
          '',
          'Generated: ' + new Date().toLocaleDateString(),
          '',
          ...data.backupCodes.map((code: string, index: number) => `${index + 1}. ${code}`)
        ].join('\n')
        
        const blob = new Blob([content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'prism-health-lab-backup-codes.txt'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        await fetchStatus()
        return { success: true }
      } else {
        return { 
          success: false, 
          error: data.error || 'Failed to regenerate backup codes',
          remainingAttempts: data.remainingAttempts
        }
      }
    } catch (error) {
      console.error('Error regenerating backup codes:', error)
      return { success: false, error: 'Failed to regenerate backup codes' }
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-300">Loading 2FA settings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
        Two-Factor Authentication
      </h3>

      {error && (
        <div className="mb-6 p-4 bg-rose-900/20 border border-rose-700/50 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
            <span className="text-rose-300 text-sm font-medium">Error</span>
          </div>
          <p className="text-rose-300 text-sm">{error}</p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {showSetup && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <TwoFactorSetup 
              onComplete={handleSetupComplete}
              onCancel={() => setShowSetup(false)}
            />
          </motion.div>
        )}

        {showDisable && (
          <motion.div
            key="disable"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="p-4 bg-rose-900/20 border border-rose-700/50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-rose-400 rounded-full"></div>
                <span className="text-rose-300 font-medium">Disable Two-Factor Authentication</span>
              </div>
              <p className="text-rose-200 text-sm">
                This will reduce the security of your account. You&apos;ll need to enter your password and a 2FA code to confirm.
              </p>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 text-white rounded-lg focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-colors"
                placeholder="Enter your password"
              />
            </div>

            <TwoFactorVerification
              onVerify={handleDisable2FA}
              onCancel={() => {
                setShowDisable(false)
                setDisablePassword('')
              }}
              isLoading={isProcessing}
              title="Confirm Disable 2FA"
              subtitle="Enter your 2FA code to disable two-factor authentication"
              allowBackupCodes={true}
            />
          </motion.div>
        )}

        {showBackupCodes && (
          <motion.div
            key="backup"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <TwoFactorVerification
              onVerify={regenerateBackupCodes}
              onCancel={() => setShowBackupCodes(false)}
              isLoading={isProcessing}
              title="Regenerate Backup Codes"
              subtitle="Enter your 2FA code to generate new backup codes"
              allowBackupCodes={false}
            />
          </motion.div>
        )}

        {!showSetup && !showDisable && !showBackupCodes && status && (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {status.enabled ? (
              <div className="space-y-6">
                {/* Status Card */}
                <div className="flex items-start gap-4 p-4 bg-emerald-900/20 border border-emerald-700/50 rounded-xl">
                  <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-400/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <div className="w-4 h-4 bg-emerald-400 rounded flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-emerald-300 font-semibold mb-1">2FA Enabled</h4>
                    <p className="text-emerald-200 text-sm mb-2">
                      Your account is protected with two-factor authentication.
                    </p>
                    {status.lastVerification && (
                      <p className="text-emerald-300 text-xs">
                        Last verified: {new Date(status.lastVerification).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Account Status */}
                {status.isLocked && (
                  <div className="p-4 bg-rose-900/20 border border-rose-700/50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-rose-400 rounded-full"></div>
                      <span className="text-rose-300 font-medium">Account Temporarily Locked</span>
                    </div>
                    <p className="text-rose-200 text-sm">
                      Too many failed attempts. 
                      {status.lockedUntil && (
                        ` Try again after ${new Date(status.lockedUntil).toLocaleTimeString()}.`
                      )}
                    </p>
                  </div>
                )}

                {/* Backup Codes Status */}
                <div className="flex items-center justify-between p-4 bg-slate-800/20 border border-slate-700/30 rounded-xl">
                  <div>
                    <h4 className="text-white font-medium mb-1">Backup Codes</h4>
                    <p className="text-slate-400 text-sm">
                      {status.backupCodesCount} backup codes remaining
                    </p>
                  </div>
                  <button
                    onClick={() => setShowBackupCodes(true)}
                    className="px-4 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-600/60 transition-colors"
                  >
                    Regenerate
                  </button>
                </div>

                {/* Recent Activity */}
                {status.recentAttempts.length > 0 && (
                  <div>
                    <h4 className="text-white font-medium mb-3">Recent Activity</h4>
                    <div className="space-y-2">
                      {status.recentAttempts.slice(0, 3).map((attempt, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-800/20 border border-slate-700/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              attempt.success ? 'bg-emerald-400' : 'bg-rose-400'
                            }`}></div>
                            <span className="text-slate-300 text-sm">
                              {attempt.type.toUpperCase()} {attempt.success ? 'Success' : 'Failed'}
                            </span>
                          </div>
                          <span className="text-slate-400 text-xs">
                            {new Date(attempt.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t border-slate-700/30">
                  <button
                    onClick={() => setShowDisable(true)}
                    className="px-4 py-2 bg-rose-900/20 border border-rose-700/50 text-rose-300 text-sm font-medium rounded-lg hover:bg-rose-800/30 transition-colors"
                  >
                    Disable 2FA
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-700/30 border border-slate-600/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <div className="w-8 h-8 bg-slate-600/50 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-slate-500 rounded flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
                
                <h4 className="text-white font-semibold mb-2">2FA Not Enabled</h4>
                <p className="text-slate-400 text-sm mb-6">
                  Add an extra layer of security to protect your health data.
                </p>
                
                <button
                  onClick={() => setShowSetup(true)}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25"
                >
                  Enable 2FA
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}