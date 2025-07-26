'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'

interface TwoFactorSetupProps {
  onComplete?: () => void
  onCancel?: () => void
}

interface SetupData {
  qrCodeUrl: string
  backupCodes: string[]
}

export default function TwoFactorSetup({ onComplete, onCancel }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'intro' | 'qr' | 'verify' | 'backup' | 'complete'>('intro')
  const [setupData, setSetupData] = useState<SetupData | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedBackupCodes, setSavedBackupCodes] = useState(false)

  // Initialize 2FA setup
  const initializeSetup = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize 2FA setup')
      }
      
      setSetupData(data.data)
      setStep('qr')
    } catch (error) {
      console.error('2FA setup initialization error:', error)
      setError(error instanceof Error ? error.message : 'Failed to initialize setup')
    } finally {
      setIsLoading(false)
    }
  }

  // Verify and enable 2FA
  const verifyAndEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code')
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: verificationCode,
          purpose: 'setup'
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }
      
      if (data.success) {
        setStep('backup')
      } else {
        setError(data.error || 'Invalid verification code')
      }
    } catch (error) {
      console.error('2FA verification error:', error)
      setError(error instanceof Error ? error.message : 'Verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Complete setup
  const completeSetup = () => {
    if (!savedBackupCodes) {
      setError('Please confirm that you have saved your backup codes')
      return
    }
    
    setStep('complete')
    setTimeout(() => {
      onComplete?.()
    }, 2000)
  }

  // Download backup codes
  const downloadBackupCodes = () => {
    if (!setupData?.backupCodes) return
    
    const content = [
      'Prism Health Lab - Two-Factor Authentication Backup Codes',
      '======================================================',
      '',
      'These codes can be used to access your account if you lose your authenticator device.',
      'Each code can only be used once. Store them securely.',
      '',
      'Generated: ' + new Date().toLocaleDateString(),
      '',
      ...setupData.backupCodes.map((code, index) => `${index + 1}. ${code}`)
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
    
    setSavedBackupCodes(true)
  }

  return (
    <div className="max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {/* Introduction Step */}
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded flex items-center justify-center">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                </div>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">
              Enable Two-Factor Authentication
            </h2>
            
            <p className="text-slate-300 mb-8">
              Add an extra layer of security to your account. You&apos;ll need an authenticator app like Google Authenticator or Authy.
            </p>
            
            <div className="space-y-4 text-left mb-8">
              <div className="flex items-start gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg">
                <div className="w-6 h-6 bg-emerald-500/20 border border-emerald-400/30 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Enhanced Security</h4>
                  <p className="text-slate-400 text-sm">Protect your health data with military-grade security</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg">
                <div className="w-6 h-6 bg-cyan-500/20 border border-cyan-400/30 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">HIPAA Compliance</h4>
                  <p className="text-slate-400 text-sm">Meet healthcare industry security standards</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg">
                <div className="w-6 h-6 bg-amber-500/20 border border-amber-400/30 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Backup Codes</h4>
                  <p className="text-slate-400 text-sm">Emergency access codes if you lose your device</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600/50 text-slate-300 font-medium rounded-xl hover:bg-slate-600/60 transition-colors"
              >
                Maybe Later
              </button>
              <button
                onClick={initializeSetup}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Setting up...' : 'Get Started'}
              </button>
            </div>
          </motion.div>
        )}

        {/* QR Code Step */}
        {step === 'qr' && setupData && (
          <motion.div
            key="qr"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Scan QR Code
            </h2>
            
            <p className="text-slate-300 mb-6">
              Open your authenticator app and scan this QR code:
            </p>
            
            <div className="bg-white p-4 rounded-xl mx-auto w-fit mb-6">
              <QRCodeSVG
                value={setupData.qrCodeUrl}
                size={200}
                level="M"
                includeMargin={false}
              />
            </div>
            
            <p className="text-slate-400 text-sm mb-8">
              Can&apos;t scan? You can manually enter this code in your app instead.
            </p>
            
            <button
              onClick={() => setStep('verify')}
              className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25"
            >
              I&apos;ve Added the Account
            </button>
          </motion.div>
        )}

        {/* Verification Step */}
        {step === 'verify' && (
          <motion.div
            key="verify"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Verify Setup
            </h2>
            
            <p className="text-slate-300 mb-6">
              Enter the 6-digit code from your authenticator app:
            </p>
            
            <div className="mb-6">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                  setVerificationCode(value)
                  setError(null)
                }}
                placeholder="000000"
                className="w-full px-4 py-3 text-center text-2xl font-mono bg-slate-800/50 border border-slate-600/50 text-white rounded-xl focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-colors"
                maxLength={6}
                autoComplete="off"
              />
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-rose-900/20 border border-rose-700/50 rounded-xl">
                <p className="text-rose-300 text-sm">{error}</p>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => setStep('qr')}
                className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600/50 text-slate-300 font-medium rounded-xl hover:bg-slate-600/60 transition-colors"
              >
                Back
              </button>
              <button
                onClick={verifyAndEnable}
                disabled={isLoading || verificationCode.length !== 6}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium rounded-xl hover:from-emerald-400 hover:to-green-500 transition-all duration-300 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Verify & Enable'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Backup Codes Step */}
        {step === 'backup' && setupData && (
          <motion.div
            key="backup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              Save Backup Codes
            </h2>
            
            <div className="mb-6 p-4 bg-amber-900/20 border border-amber-700/50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-amber-400 rounded-full"></div>
                <span className="text-amber-300 font-medium">Important</span>
              </div>
              <p className="text-amber-200 text-sm">
                These backup codes can be used to access your account if you lose your authenticator device. Each code can only be used once.
              </p>
            </div>
            
            <div className="bg-slate-800/50 border border-slate-600/50 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {setupData.backupCodes.map((code, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-slate-700/30 rounded">
                    <span className="text-slate-400 w-4">{index + 1}.</span>
                    <span className="text-white">{code}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <button
              onClick={downloadBackupCodes}
              className="w-full mb-4 px-4 py-3 bg-slate-700/50 border border-slate-600/50 text-slate-300 font-medium rounded-xl hover:bg-slate-600/60 transition-colors"
            >
              Download Backup Codes
            </button>
            
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={savedBackupCodes}
                  onChange={(e) => setSavedBackupCodes(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
                  savedBackupCodes 
                    ? 'bg-emerald-500 border-emerald-500' 
                    : 'border-slate-500'
                }`}>
                  {savedBackupCodes && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <span className="text-slate-300 text-sm">
                  I have saved these backup codes in a secure location
                </span>
              </label>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-rose-900/20 border border-rose-700/50 rounded-xl">
                <p className="text-rose-300 text-sm">{error}</p>
              </div>
            )}
            
            <button
              onClick={completeSetup}
              disabled={!savedBackupCodes}
              className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium rounded-xl hover:from-emerald-400 hover:to-green-500 transition-all duration-300 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Complete Setup
            </button>
          </motion.div>
        )}

        {/* Complete Step */}
        {step === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                </div>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">
              2FA Enabled Successfully!
            </h2>
            
            <p className="text-slate-300 mb-8">
              Your account is now protected with two-factor authentication. You&apos;ll need to enter a code from your authenticator app when signing in.
            </p>
            
            <div className="p-4 bg-emerald-900/20 border border-emerald-700/50 rounded-xl">
              <p className="text-emerald-300 text-sm">
                Your health data is now secured with enterprise-grade protection.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}