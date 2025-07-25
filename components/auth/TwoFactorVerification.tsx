'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface TwoFactorVerificationProps {
  onVerify: (code: string) => Promise<{ success: boolean; error?: string; remainingAttempts?: number }>
  onCancel?: () => void
  isLoading?: boolean
  title?: string
  subtitle?: string
  allowBackupCodes?: boolean
}

export default function TwoFactorVerification({
  onVerify,
  onCancel,
  isLoading = false,
  title = 'Two-Factor Authentication',
  subtitle = 'Enter the verification code from your authenticator app',
  allowBackupCodes = true
}: TwoFactorVerificationProps) {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState<string | null>(null)
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null)
  const [showBackupCode, setShowBackupCode] = useState(false)
  const [backupCode, setBackupCode] = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // Only allow digits

    const newCode = [...code]
    newCode[index] = value.slice(-1) // Only take the last character
    setCode(newCode)
    setError(null)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-verify when all digits entered
    if (index === 5 && value && newCode.every(digit => digit !== '')) {
      handleVerify(newCode.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    
    if (pastedData.length === 6) {
      const newCode = pastedData.split('')
      setCode(newCode)
      setError(null)
      handleVerify(pastedData)
    }
  }

  const handleVerify = async (verificationCode: string) => {
    try {
      const result = await onVerify(verificationCode)
      
      if (result.success) {
        setError(null)
      } else {
        setError(result.error || 'Invalid verification code')
        setRemainingAttempts(result.remainingAttempts || null)
        
        // Clear the code inputs on error
        setCode(['', '', '', '', '', ''])
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus()
        }
      }
    } catch (error) {
      console.error('Verification error:', error)
      setError('Verification failed. Please try again.')
      setCode(['', '', '', ''])
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus()
      }
    }
  }

  const handleBackupCodeVerify = async () => {
    if (!backupCode || backupCode.length !== 8) {
      setError('Please enter a valid backup code')
      return
    }

    await handleVerify(backupCode)
  }

  const toggleBackupCode = () => {
    setShowBackupCode(!showBackupCode)
    setError(null)
    setCode(['', '', '', '', '', ''])
    setBackupCode('')
  }

  return (
    <div className="max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded flex items-center justify-center">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          <p className="text-slate-300">{subtitle}</p>
        </div>

        {!showBackupCode ? (
          <>
            {/* 6-digit code input */}
            <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-mono bg-slate-800/50 border border-slate-600/50 text-white rounded-lg focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-colors"
                  maxLength={1}
                  autoComplete="off"
                  disabled={isLoading}
                />
              ))}
            </div>

            {/* Manual verify button (if needed) */}
            {code.every(digit => digit !== '') && (
              <button
                onClick={() => handleVerify(code.join(''))}
                disabled={isLoading}
                className="w-full mb-4 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Verifying...
                  </span>
                ) : (
                  'Verify Code'
                )}
              </button>
            )}
          </>
        ) : (
          <>
            {/* Backup code input */}
            <div className="mb-6">
              <input
                type="text"
                value={backupCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^A-Fa-f0-9]/g, '').toUpperCase().slice(0, 8)
                  setBackupCode(value)
                  setError(null)
                }}
                placeholder="Enter backup code"
                className="w-full px-4 py-3 text-center text-lg font-mono bg-slate-800/50 border border-slate-600/50 text-white rounded-xl focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-colors"
                maxLength={8}
                autoComplete="off"
                disabled={isLoading}
              />
              <p className="text-slate-400 text-sm mt-2">
                Enter one of your 8-character backup codes
              </p>
            </div>

            <button
              onClick={handleBackupCodeVerify}
              disabled={isLoading || backupCode.length !== 8}
              className="w-full mb-4 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Verifying...
                </span>
              ) : (
                'Use Backup Code'
              )}
            </button>
          </>
        )}

        {/* Error display */}
        {error && (
          <div className="mb-4 p-3 bg-rose-900/20 border border-rose-700/50 rounded-xl">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
              <span className="text-rose-300 text-sm font-medium">Verification Failed</span>
            </div>
            <p className="text-rose-300 text-sm">{error}</p>
            {remainingAttempts !== null && remainingAttempts > 0 && (
              <p className="text-rose-400 text-xs mt-1">
                {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
              </p>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          {allowBackupCodes && (
            <button
              onClick={toggleBackupCode}
              className="w-full px-4 py-2 text-slate-400 hover:text-slate-300 text-sm font-medium transition-colors"
              disabled={isLoading}
            >
              {showBackupCode ? 'Use Authenticator App' : 'Use Backup Code Instead'}
            </button>
          )}

          {onCancel && (
            <button
              onClick={onCancel}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 text-slate-300 font-medium rounded-xl hover:bg-slate-600/60 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
          )}
        </div>

        {/* Help text */}
        <div className="mt-6 p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
            <span className="text-cyan-300 text-sm font-medium">Having trouble?</span>
          </div>
          <p className="text-slate-400 text-xs">
            Make sure your device&apos;s time is synchronized. If you&apos;ve lost access to your authenticator app, use one of your backup codes.
          </p>
        </div>
      </motion.div>
    </div>
  )
}