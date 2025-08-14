'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

interface Session {
  id: string
  user_agent?: string
  ip_address?: string
  last_activity?: string
  created_at: string
}

interface Profile {
  id: string
  two_factor_enabled?: boolean
  email?: string
}

interface SecuritySettingsProps {
  profile: Profile
  sessions: Session[]
  userId: string
}

export default function SecuritySettings({ profile, sessions, userId }: SecuritySettingsProps) {
  const [is2FAEnabled, setIs2FAEnabled] = useState(profile?.two_factor_enabled || false)
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [_qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSetup2FA = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      // In a real app, this would call an API to generate 2FA secret
      // For now, we'll simulate it
      const mockSecret = 'JBSWY3DPEHPK3PXP' // This would be generated server-side
      setSecret(mockSecret)
      setQrCode(`https://chart.googleapis.com/chart?chs=200x200&chld=M%7C0&cht=qr&chl=otpauth://totp/PrismHealthLab:${profile?.email}?secret=${mockSecret}&issuer=PrismHealthLab`)
      setIsSettingUp2FA(true)
    } catch {
      setMessage({ type: 'error', text: 'Failed to setup 2FA' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify2FA = async () => {
    if (verificationCode.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter a 6-digit code' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      // In a real app, this would verify the code server-side
      const supabase = createClient()
      
      // Update profile with 2FA enabled
      const { error } = await supabase
        .from('profiles')
        .update({ 
          two_factor_enabled: true,
          two_factor_secret: secret, // In production, this should be encrypted
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (error) throw error

      setIs2FAEnabled(true)
      setIsSettingUp2FA(false)
      setMessage({ type: 'success', text: 'Two-factor authentication enabled successfully!' })
      setVerificationCode('')
      setSecret('')
      setQrCode('')
    } catch {
      setMessage({ type: 'error', text: 'Invalid verification code' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication?')) return

    setIsLoading(true)
    setMessage(null)

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          two_factor_enabled: false,
          two_factor_secret: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (error) throw error

      setIs2FAEnabled(false)
      setMessage({ type: 'success', text: 'Two-factor authentication disabled' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to disable 2FA' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to revoke this session?')) return

    try {
      const supabase = createClient()
      
      await supabase
        .from('user_sessions')
        .delete()
        .eq('id', sessionId)

      // Refresh page to update sessions list
      window.location.reload()
    } catch {
      console.error('Error revoking session:', err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const parseUserAgent = (ua?: string) => {
    if (!ua) return 'Unknown Device'
    
    // Simple parsing - in production, use a proper UA parser
    if (ua.includes('Mobile')) return '📱 Mobile Device'
    if (ua.includes('Tablet')) return '📱 Tablet'
    if (ua.includes('Windows')) return '💻 Windows PC'
    if (ua.includes('Mac')) return '💻 Mac'
    if (ua.includes('Linux')) return '💻 Linux'
    return '💻 Desktop'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl shadow-lg shadow-slate-900/30"
    >
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-xl flex items-center justify-center">
            <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-white">Security Settings</h2>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {message && (
          <div className={`p-4 rounded-xl ${
            message.type === 'success' 
              ? 'bg-emerald-500/20 border border-emerald-400/30 text-emerald-300'
              : 'bg-rose-500/20 border border-rose-400/30 text-rose-300'
          }`}>
            {message.text}
          </div>
        )}

        {/* Two-Factor Authentication */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
            Two-Factor Authentication
          </h3>
          
          {!is2FAEnabled && !isSettingUp2FA ? (
            <div className="p-4 bg-slate-900/30 rounded-xl">
              <p className="text-slate-300 mb-4">
                Add an extra layer of security to your account by enabling two-factor authentication.
              </p>
              <button
                onClick={handleSetup2FA}
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-medium rounded-xl hover:from-indigo-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-indigo-500/25"
              >
                {isLoading ? 'Setting up...' : 'Enable 2FA'}
              </button>
            </div>
          ) : is2FAEnabled && !isSettingUp2FA ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-400/30 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-300 font-medium mb-1">2FA is Active</p>
                  <p className="text-slate-400 text-sm">Your account is protected with two-factor authentication</p>
                </div>
                <button
                  onClick={handleDisable2FA}
                  disabled={isLoading}
                  className="px-4 py-2 bg-rose-500/20 border border-rose-400/30 text-rose-300 font-medium rounded-xl hover:bg-rose-500/30 transition-all duration-300"
                >
                  Disable
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/30 rounded-xl">
                <p className="text-white font-medium mb-3">Scan QR Code with Authenticator App</p>
                <div className="flex items-center gap-6">
                  <div className="w-48 h-48 bg-white p-2 rounded-xl">
                    {/* In production, this would be a real QR code */}
                    <div className="w-full h-full bg-slate-200 rounded-lg flex items-center justify-center text-slate-500">
                      QR Code
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-300 text-sm mb-3">
                      Or enter this code manually:
                    </p>
                    <code className="block p-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-cyan-400 font-mono">
                      {secret}
                    </code>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-900/30 rounded-xl">
                <label className="block text-white font-medium mb-3">
                  Enter Verification Code
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white text-center text-2xl font-mono rounded-xl focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50"
                  />
                  <button
                    onClick={handleVerify2FA}
                    disabled={isLoading || verificationCode.length !== 6}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium rounded-xl hover:from-emerald-400 hover:to-green-500 transition-all duration-300 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Verifying...' : 'Verify & Enable'}
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsSettingUp2FA(false)
                  setVerificationCode('')
                  setSecret('')
                  setQrCode('')
                }}
                className="text-slate-400 hover:text-white text-sm"
              >
                Cancel Setup
              </button>
            </div>
          )}
        </div>

        {/* Active Sessions */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
            Active Sessions
          </h3>
          
          {sessions && sessions.length > 0 ? (
            <div className="space-y-3">
              {sessions.map((session, index) => (
                <div key={session.id} className="p-4 bg-slate-900/30 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">
                        {parseUserAgent(session.user_agent)}
                        {index === 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs rounded-full">
                            Current
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                        <span>{session.ip_address || 'Unknown IP'}</span>
                        <span>•</span>
                        <span>Last active: {formatDate(session.last_activity || session.created_at)}</span>
                      </div>
                    </div>
                    {index !== 0 && (
                      <button
                        onClick={() => handleRevokeSession(session.id)}
                        className="px-3 py-1.5 bg-rose-500/20 border border-rose-400/30 text-rose-300 font-medium rounded-lg hover:bg-rose-500/30 transition-all duration-300"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-slate-900/30 rounded-xl text-center">
              <p className="text-slate-400">No active sessions found</p>
            </div>
          )}
        </div>

        {/* Login Alerts */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
            Login Alerts
          </h3>
          
          <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl">
            <div>
              <p className="text-white font-medium">Email alerts for new logins</p>
              <p className="text-slate-400 text-sm">Get notified when someone logs into your account from a new device</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:ring-2 peer-focus:ring-amber-400/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-amber-500 peer-checked:to-orange-600"></div>
            </label>
          </div>
        </div>
      </div>
    </motion.div>
  )
}