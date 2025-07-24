'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { User } from '@/types/shared'

interface SignupFormProps {
  onSuccess?: (user: User) => void
  onSwitchToLogin?: () => void
  onData?: (data: { isAuthenticated: boolean; user?: User; formData?: Record<string, unknown> }) => void
  showSwitchToLogin?: boolean
  className?: string
}

export default function SignupForm({
  onSuccess,
  onSwitchToLogin,
  onData,
  showSwitchToLogin = true,
  className = ''
}: SignupFormProps) {
  const { signUp } = useAuth()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    phone: '',
    agreeToTerms: false,
    agreeToHipaa: false
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required'
    } else {
      const birthDate = new Date(formData.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      if (age < 18) {
        newErrors.dateOfBirth = 'You must be at least 18 years old'
      }
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions'
    }

    if (!formData.agreeToHipaa) {
      newErrors.agreeToHipaa = 'HIPAA acknowledgment is required for medical services'
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
      const result = await signUp(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        date_of_birth: formData.dateOfBirth,
        phone: formData.phone
      }) as Record<string, unknown>
      const error = result.error as Error | null
      const user = (result.data as Record<string, unknown>)?.user || result.user
      
      if (error) {
        setErrors({ submit: error.message || 'Registration failed. Please try again.' })
        return
      }

      if (user) {
        // Notify parent components
        onSuccess?.(user as User)
        onData?.({ isAuthenticated: true, user: user as User, formData })
      }
    } catch (error) {
      console.error('Signup error:', error)
      setErrors({ submit: 'An unexpected error occurred. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <div className={`max-w-lg mx-auto ${className}`}>
      <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            Create Your Patient Account
          </h2>
          <p className="text-slate-300 text-sm">
            Get secure access to your health data and test results
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-slate-300 mb-3">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="John"
                className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-slate-400 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:ring-2 ${
                  errors.firstName
                    ? 'border-rose-500/50 focus:ring-rose-400 focus:border-rose-400'
                    : 'border-slate-600/50 focus:ring-cyan-400 focus:border-cyan-400'
                }`}
                disabled={loading}
              />
              {errors.firstName && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-rose-400 text-sm mt-2 flex items-center gap-2"
                >
                  <span className="text-xs">✗</span>
                  {errors.firstName}
                </motion.p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-slate-300 mb-3">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Doe"
                className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-slate-400 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:ring-2 ${
                  errors.lastName
                    ? 'border-rose-500/50 focus:ring-rose-400 focus:border-rose-400'
                    : 'border-slate-600/50 focus:ring-cyan-400 focus:border-cyan-400'
                }`}
                disabled={loading}
              />
              {errors.lastName && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-rose-400 text-sm mt-2 flex items-center gap-2"
                >
                  <span className="text-xs">✗</span>
                  {errors.lastName}
                </motion.p>
              )}
            </div>
          </div>

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
              placeholder="patient@example.com"
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

          {/* Password Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="Create password"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-3">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm password"
                className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-slate-400 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:ring-2 ${
                  errors.confirmPassword
                    ? 'border-rose-500/50 focus:ring-rose-400 focus:border-rose-400'
                    : 'border-slate-600/50 focus:ring-cyan-400 focus:border-cyan-400'
                }`}
                disabled={loading}
              />
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-rose-400 text-sm mt-2 flex items-center gap-2"
                >
                  <span className="text-xs">✗</span>
                  {errors.confirmPassword}
                </motion.p>
              )}
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-slate-300 mb-3">
                Date of Birth
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-white transition-all duration-300 backdrop-blur-sm focus:outline-none focus:ring-2 ${
                  errors.dateOfBirth
                    ? 'border-rose-500/50 focus:ring-rose-400 focus:border-rose-400'
                    : 'border-slate-600/50 focus:ring-cyan-400 focus:border-cyan-400'
                }`}
                disabled={loading}
              />
              {errors.dateOfBirth && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-rose-400 text-sm mt-2 flex items-center gap-2"
                >
                  <span className="text-xs">✗</span>
                  {errors.dateOfBirth}
                </motion.p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-3">
                Phone Number <span className="text-slate-500">(Optional)</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(555) 123-4567"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
                disabled={loading}
              />
            </div>
          </div>

          {/* Medical Consent Checkboxes */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="agreeToHipaa"
                name="agreeToHipaa"
                checked={formData.agreeToHipaa}
                onChange={handleInputChange}
                className={`mt-1 w-4 h-4 text-cyan-400 bg-slate-900/50 border-slate-600/50 rounded focus:ring-cyan-400 focus:ring-2 ${
                  errors.agreeToHipaa ? 'border-rose-500/50' : ''
                }`}
                disabled={loading}
              />
              <label htmlFor="agreeToHipaa" className="text-sm text-slate-300 leading-relaxed">
                I acknowledge receipt of the HIPAA Privacy Notice and consent to the use and disclosure of my protected health information for treatment, payment, and healthcare operations.
              </label>
            </div>
            {errors.agreeToHipaa && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-rose-400 text-sm flex items-center gap-2 ml-7"
              >
                <span className="text-xs">✗</span>
                {errors.agreeToHipaa}
              </motion.p>
            )}

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className={`mt-1 w-4 h-4 text-cyan-400 bg-slate-900/50 border-slate-600/50 rounded focus:ring-cyan-400 focus:ring-2 ${
                  errors.agreeToTerms ? 'border-rose-500/50' : ''
                }`}
                disabled={loading}
              />
              <label htmlFor="agreeToTerms" className="text-sm text-slate-300 leading-relaxed">
                I agree to the <button type="button" className="text-cyan-400 hover:text-cyan-300">Terms of Service</button> and <button type="button" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</button>.
              </label>
            </div>
            {errors.agreeToTerms && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-rose-400 text-sm flex items-center gap-2 ml-7"
              >
                <span className="text-xs">✗</span>
                {errors.agreeToTerms}
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
                : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                Creating Account...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                Create Patient Account
              </span>
            )}
          </button>
        </form>

        {/* Switch to Login */}
        {showSwitchToLogin && (
          <div className="mt-8 pt-6 border-t border-slate-700/30 text-center">
            <p className="text-slate-400 text-sm mb-4">
              Already have an account?
            </p>
            <button
              onClick={onSwitchToLogin}
              className="px-6 py-3 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-200 font-medium rounded-xl hover:bg-slate-600/60 hover:border-slate-500/60 transition-all duration-300"
            >
              Sign In Instead
            </button>
          </div>
        )}
      </div>
    </div>
  )
}