'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { User } from '@/types/shared'

interface LoginFormProps {
  onSuccess?: (user: User) => void
  onSwitchToSignup?: () => void
  onData?: (data: { isAuthenticated: boolean; user?: User }) => void
  showSwitchToSignup?: boolean
  className?: string
  isAdminLogin?: boolean
}

export default function LoginForm({
  onSuccess,
  onSwitchToSignup,
  onData,
  showSwitchToSignup = true,
  className = '',
  isAdminLogin = false
}: LoginFormProps) {
  const { signIn } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setErrors({})

    try {
      const result = await signIn(formData.email, formData.password) as Record<string, unknown>
      const error = result.error as Error | null
      const user = (result.data as Record<string, unknown>)?.user || result.user
      
      if (error) {
        setErrors({ submit: error.message || 'Login failed. Please try again.' })
        return
      }

      if (user) {
        // Notify parent components
        onSuccess?.(user as User)
        onData?.({ isAuthenticated: true, user: user as User })
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrors({ submit: 'An unexpected error occurred. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            {isAdminLogin ? 'Admin Access Required' : 'Sign In to Your Account'}
          </h2>
          <p className="text-slate-300 text-sm">
            {isAdminLogin 
              ? 'Enter your staff credentials to access the admin dashboard'
              : 'Access your health dashboard and test results'
            }
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-3">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder={isAdminLogin ? "admin@prismhealthlab.com" : "patient@example.com"}
              className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-slate-400 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:ring-2 ${
                errors.email
                  ? 'border-rose-500/50 focus:ring-rose-400 focus:border-rose-400'
                  : 'border-slate-600/50 focus:ring-cyan-400 focus:border-cyan-400'
              }`}
              disabled={loading}
            />
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-rose-400 text-sm mt-2 flex items-center gap-2"
              >
                <span className="text-xs">✗</span>
                {errors.email}
              </motion.p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-3">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-slate-400 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:ring-2 ${
                errors.password
                  ? 'border-rose-500/50 focus:ring-rose-400 focus:border-rose-400'
                  : 'border-slate-600/50 focus:ring-cyan-400 focus:border-cyan-400'
              }`}
              disabled={loading}
            />
            {errors.password && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-rose-400 text-sm mt-2 flex items-center gap-2"
              >
                <span className="text-xs">✗</span>
                {errors.password}
              </motion.p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-rose-900/20 border border-rose-700/50 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                <span className="text-rose-300 text-sm">{errors.submit}</span>
              </div>
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-6 py-4 font-semibold rounded-xl transition-all duration-300 ${
              loading
                ? 'bg-slate-700/30 border border-slate-600/30 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                Signing In...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                Sign In
              </span>
            )}
          </button>
        </form>

        {/* Switch to Signup */}
        {showSwitchToSignup && (
          <div className="mt-8 pt-6 border-t border-slate-700/30 text-center">
            <p className="text-slate-400 text-sm mb-4">
              Don&apos;t have an account yet?
            </p>
            <button
              onClick={onSwitchToSignup}
              className="px-6 py-3 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-200 font-medium rounded-xl hover:bg-slate-600/60 hover:border-slate-500/60 transition-all duration-300"
            >
              Create New Account
            </button>
          </div>
        )}

        {/* Forgot Password */}
        <div className="mt-6 text-center">
          <button className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors">
            Forgot your password?
          </button>
        </div>
      </div>
    </div>
  )
}