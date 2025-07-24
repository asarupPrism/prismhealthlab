'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'
import { User } from '@/types/shared'

interface AuthFormProps {
  initialMode?: 'login' | 'signup'
  onSuccess?: (user: User, mode: 'login' | 'signup') => void
  onData?: (data: { isAuthenticated: boolean; user?: User; mode: 'login' | 'signup' }) => void
  className?: string
}

export default function AuthForm({
  initialMode = 'signup',
  onSuccess,
  onData,
  className = ''
}: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)

  const handleSuccess = (user: User) => {
    onSuccess?.(user, mode)
    onData?.({ isAuthenticated: true, user, mode })
  }

  const handleLoginData = (data: { isAuthenticated: boolean; user?: User }) => {
    if (data.isAuthenticated) {
      onData?.({ ...data, mode: 'login' })
    }
  }

  const handleSignupData = (data: { isAuthenticated: boolean; user?: User; formData?: Record<string, unknown> }) => {
    if (data.isAuthenticated) {
      onData?.({ 
        isAuthenticated: data.isAuthenticated, 
        user: data.user, 
        mode: 'signup' 
      })
    }
  }

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {mode === 'login' ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <LoginForm
              onSuccess={handleSuccess}
              onSwitchToSignup={() => setMode('signup')}
              onData={handleLoginData}
              showSwitchToSignup={true}
            />
          </motion.div>
        ) : (
          <motion.div
            key="signup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <SignupForm
              onSuccess={handleSuccess}
              onSwitchToLogin={() => setMode('login')}
              onData={handleSignupData}
              showSwitchToLogin={true}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}