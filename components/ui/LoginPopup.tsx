'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'

interface LoginPopupProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess: (userData: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address1: string
    address2: string
    city: string
    state: string
    zip: string
  }) => void
  className?: string
}

export default function LoginPopup({
  isOpen,
  onClose,
  onLoginSuccess,
  className = ''
}: LoginPopupProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  
  const { signIn } = useAuth()

  const handleFieldTouch = (fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { error } = await signIn(email, password)
      
      if (error) {
        throw error
      }
      
      // Mock user profile data - in real app, this would come from the user's profile
      const mockUserData = {
        firstName: 'John',
        lastName: 'Doe',
        email: email,
        phone: '(555) 123-4567',
        address1: '123 Main St',
        address2: '',
        city: 'Chicago',
        state: 'IL',
        zip: '60601'
      }

      onLoginSuccess(mockUserData)
      onClose()
    } catch (error) {
      console.error('Login error:', error)
      setError('Invalid email or password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setError('')
    setTouchedFields(new Set())
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  // Email validation
  const emailError = touchedFields.has('email') && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const emailRequired = touchedFields.has('email') && !email
  const passwordRequired = touchedFields.has('password') && !password

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`relative w-full max-w-md backdrop-blur-md bg-slate-800/90 border border-slate-700/50 rounded-2xl shadow-2xl shadow-slate-900/50 ${className}`}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    Welcome Back
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Sign in to auto-fill your information
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="text-slate-400 hover:text-slate-300 transition-colors p-1"
                >
                  <div className="w-6 h-6 flex items-center justify-center">
                    <div className="w-4 h-1 bg-current rounded-full transform rotate-45"></div>
                    <div className="w-4 h-1 bg-current rounded-full transform -rotate-45 -ml-4"></div>
                  </div>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleFieldTouch('email')}
                  className={`w-full px-4 py-3 bg-slate-900/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    emailError || emailRequired
                      ? 'border-rose-500/50 focus:ring-rose-400/50 focus:border-rose-400/50'
                      : 'border-slate-700/50 focus:ring-cyan-400/50 focus:border-cyan-400/50'
                  }`}
                  placeholder="Enter your email address"
                  disabled={isLoading}
                />
                {emailRequired && (
                  <div className="mt-1 text-sm text-rose-400 flex items-center gap-2">
                    <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/50 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 bg-rose-400 rounded-full"></div>
                    </div>
                    Email is required
                  </div>
                )}
                {emailError && (
                  <div className="mt-1 text-sm text-rose-400 flex items-center gap-2">
                    <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/50 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 bg-rose-400 rounded-full"></div>
                    </div>
                    Please enter a valid email address
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleFieldTouch('password')}
                  className={`w-full px-4 py-3 bg-slate-900/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    passwordRequired
                      ? 'border-rose-500/50 focus:ring-rose-400/50 focus:border-rose-400/50'
                      : 'border-slate-700/50 focus:ring-cyan-400/50 focus:border-cyan-400/50'
                  }`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                {passwordRequired && (
                  <div className="mt-1 text-sm text-rose-400 flex items-center gap-2">
                    <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/50 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 bg-rose-400 rounded-full"></div>
                    </div>
                    Password is required
                  </div>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="backdrop-blur-sm bg-rose-900/20 border border-rose-700/50 rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-rose-400 rounded-full animate-pulse flex-shrink-0"></div>
                    <span className="text-rose-300 text-sm">{error}</span>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-300 font-medium rounded-lg hover:bg-slate-600/60 hover:border-slate-500/60 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Signing In...
                    </>
                  ) : (
                    <>
                      <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      Sign In
                    </>
                  )}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}