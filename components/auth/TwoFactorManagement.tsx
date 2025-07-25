'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context'
import { QRCodeSVG as QRCode } from 'qrcode.react'

interface TwoFactorSettings {
  isEnabled: boolean
  backupCodes: string[]
  hasBackupCodes: boolean
}

export default function TwoFactorManagement() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<TwoFactorSettings>({
    isEnabled: false,
    backupCodes: [],
    hasBackupCodes: false
  })
  const [loading, setLoading] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [showSetup, setShowSetup] = useState(false)
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadTwoFactorSettings()
    }
  }, [user])

  const loadTwoFactorSettings = async () => {
    try {
      const response = await fetch('/api/auth/2fa/status')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Failed to load 2FA settings:', error)
    }
  }

  const initiateTwoFactorSetup = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST'
      })
      
      if (response.ok) {
        const data = await response.json()
        setQrCode(data.qrCodeUrl)
        setShowSetup(true)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to setup 2FA')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const verifyAndEnable2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a 6-digit verification code')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: verificationCode
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSettings({
          isEnabled: true,
          backupCodes: data.backupCodes || [],
          hasBackupCodes: true
        })
        setSuccess('Two-factor authentication has been enabled successfully!')
        setShowSetup(false)
        setShowBackupCodes(true)
        setVerificationCode('')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Invalid verification code')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const disable2FA = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST'
      })

      if (response.ok) {
        setSettings({
          isEnabled: false,
          backupCodes: [],
          hasBackupCodes: false
        })
        setSuccess('Two-factor authentication has been disabled')
        setQrCode(null)
        setShowSetup(false)
        setShowBackupCodes(false)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to disable 2FA')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const generateNewBackupCodes = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/2fa/backup-codes', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(prev => ({
          ...prev,
          backupCodes: data.backupCodes
        }))
        setShowBackupCodes(true)
        setSuccess('New backup codes generated successfully')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to generate backup codes')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Two-Factor Authentication
          </h3>
          <p className="text-slate-400 text-sm">
            Add an extra layer of security to your account
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            settings.isEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
          }`}></div>
          <span className={`text-sm font-medium ${
            settings.isEnabled ? 'text-emerald-300' : 'text-slate-400'
          }`}>
            {settings.isEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-rose-900/20 border border-rose-500/50 rounded-lg"
        >
          <p className="text-rose-300 text-sm">{error}</p>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-emerald-900/20 border border-emerald-500/50 rounded-lg"
        >
          <p className="text-emerald-300 text-sm">{success}</p>
        </motion.div>
      )}

      {!settings.isEnabled && !showSetup && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-amber-400">🔒</span>
          </div>
          <h4 className="text-white font-medium mb-2">Enable Two-Factor Authentication</h4>
          <p className="text-slate-400 text-sm mb-6">
            Protect your health data with an additional security layer using your phone
          </p>
          <button
            onClick={initiateTwoFactorSetup}
            disabled={loading}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {loading ? 'Setting up...' : 'Enable 2FA'}
          </button>
        </div>
      )}

      {showSetup && qrCode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="text-center">
            <h4 className="text-white font-medium mb-4">Scan QR Code</h4>
            <div className="bg-white p-4 rounded-lg inline-block">
              <QRCode value={qrCode} size={200} />
            </div>
            <p className="text-slate-400 text-sm mt-4">
              Scan this code with your authenticator app (Google Authenticator, Authy, etc.)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              maxLength={6}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowSetup(false)
                setQrCode(null)
                setVerificationCode('')
                setError(null)
              }}
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={verifyAndEnable2FA}
              disabled={loading || verificationCode.length !== 6}
              className="flex-1 px-4 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify & Enable'}
            </button>
          </div>
        </motion.div>
      )}

      {settings.isEnabled && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-emerald-900/20 border border-emerald-500/50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl text-emerald-400">✓</span>
              <div>
                <p className="text-emerald-300 font-medium">2FA is Active</p>
                <p className="text-emerald-200 text-sm">Your account is protected</p>
              </div>
            </div>
            <button
              onClick={disable2FA}
              disabled={loading}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {loading ? 'Disabling...' : 'Disable'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setShowBackupCodes(!showBackupCodes)}
              className="p-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-left transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📋</span>
                <div>
                  <p className="text-white font-medium text-sm">Backup Codes</p>
                  <p className="text-slate-400 text-xs">View recovery codes</p>
                </div>
              </div>
            </button>

            <button
              onClick={generateNewBackupCodes}
              disabled={loading}
              className="p-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-left transition-colors disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🔄</span>
                <div>
                  <p className="text-white font-medium text-sm">New Codes</p>
                  <p className="text-slate-400 text-xs">Generate fresh codes</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {showBackupCodes && settings.backupCodes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 p-4 bg-amber-900/20 border border-amber-500/50 rounded-lg"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-amber-400">⚠️</span>
            <h4 className="text-amber-300 font-medium">Backup Recovery Codes</h4>
          </div>
          <p className="text-amber-200 text-sm mb-4">
            Save these codes in a secure location. Each can only be used once to access your account if you lose your authenticator device.
          </p>
          <div className="grid grid-cols-2 gap-2 font-mono text-sm">
            {settings.backupCodes.map((code, index) => (
              <div
                key={index}
                className="p-2 bg-slate-900/50 border border-slate-700 rounded text-center text-slate-200"
              >
                {code}
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowBackupCodes(false)}
            className="mt-4 w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Hide Codes
          </button>
        </motion.div>
      )}
    </div>
  )
}