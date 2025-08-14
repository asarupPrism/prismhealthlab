'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

export default function PasswordChangeForm() {
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: ''
  })

  const calculatePasswordStrength = (password: string) => {
    let score = 0
    let message = ''

    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    if (score <= 2) message = 'Weak'
    else if (score <= 4) message = 'Moderate'
    else message = 'Strong'

    return { score, message }
  }

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
    
    if (field === 'newPassword') {
      setPasswordStrength(calculatePasswordStrength(value))
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long')
      return
    }

    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const supabase = createClient()
      
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      setSuccessMessage('Password updated successfully!')
      setIsChangingPassword(false)
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelPassword = () => {
    setIsChangingPassword(false)
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setErrorMessage('')
    setPasswordStrength({ score: 0, message: '' })
  }

  const getStrengthColor = () => {
    if (passwordStrength.score <= 2) return 'bg-rose-500'
    if (passwordStrength.score <= 4) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl shadow-lg shadow-slate-900/30"
    >
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center">
              <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white">Password & Security</h2>
          </div>
          
          {!isChangingPassword && (
            <button
              onClick={() => setIsChangingPassword(true)}
              className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-medium rounded-xl hover:from-rose-400 hover:to-pink-500 transition-all duration-300 shadow-lg shadow-rose-500/25"
            >
              Change Password
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-emerald-300">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-500/20 border border-rose-400/30 rounded-xl text-rose-300">
            {errorMessage}
          </div>
        )}

        {!isChangingPassword ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl">
              <div>
                <p className="text-white font-medium">Password</p>
                <p className="text-slate-400 text-sm">Last changed: Never tracked</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span className="text-emerald-400 text-sm">Secure</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl">
              <div>
                <p className="text-white font-medium">Two-Factor Authentication</p>
                <p className="text-slate-400 text-sm">Add an extra layer of security</p>
              </div>
              <button className="px-4 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-300 font-medium rounded-xl hover:bg-slate-600/60 transition-all duration-300">
                Setup 2FA
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl">
              <div>
                <p className="text-white font-medium">Login Sessions</p>
                <p className="text-slate-400 text-sm">Manage your active sessions</p>
              </div>
              <button className="px-4 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-300 font-medium rounded-xl hover:bg-slate-600/60 transition-all duration-300">
                View Sessions
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400/50 transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400/50 transition-all duration-300"
              />
              
              {passwordData.newPassword && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">Password Strength</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.score <= 2 ? 'text-rose-400' :
                      passwordStrength.score <= 4 ? 'text-amber-400' :
                      'text-emerald-400'
                    }`}>
                      {passwordStrength.message}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                      style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400/50 transition-all duration-300"
              />
              {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                <p className="text-rose-400 text-sm mt-2">Passwords do not match</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-700/50">
              <button
                type="button"
                onClick={handleCancelPassword}
                className="px-6 py-3 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-300 font-medium rounded-xl hover:bg-slate-600/60 transition-all duration-300"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isLoading || passwordData.newPassword !== passwordData.confirmPassword}
                className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-medium rounded-xl hover:from-rose-400 hover:to-pink-500 transition-all duration-300 shadow-lg shadow-rose-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  )
}