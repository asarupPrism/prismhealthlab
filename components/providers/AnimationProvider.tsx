'use client'

/**
 * Animation Context Provider
 * 
 * Provides shared animation configuration and reduced motion preferences
 * across all client components that use framer-motion.
 */

import React, { createContext, useContext, useEffect, useState } from 'react'
import { MotionConfig, Transition } from 'framer-motion'
import { TRANSITIONS } from '@/lib/animations/variants'

interface AnimationContextValue {
  reducedMotion: boolean
  isLoaded: boolean
  defaultTransition: Transition
}

const AnimationContext = createContext<AnimationContextValue>({
  reducedMotion: false,
  isLoaded: false,
  defaultTransition: TRANSITIONS.smooth,
})

export const useAnimation = () => {
  const context = useContext(AnimationContext)
  if (!context) {
    throw new Error('useAnimation must be used within AnimationProvider')
  }
  return context
}

interface AnimationProviderProps {
  children: React.ReactNode
  transition?: Transition
}

export default function AnimationProvider({ 
  children, 
  transition = TRANSITIONS.smooth 
}: AnimationProviderProps) {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange)
    setIsLoaded(true)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const contextValue: AnimationContextValue = {
    reducedMotion,
    isLoaded,
    defaultTransition: reducedMotion 
      ? { duration: 0.3, ease: 'easeOut' }
      : transition,
  }

  return (
    <AnimationContext.Provider value={contextValue}>
      <MotionConfig
        transition={contextValue.defaultTransition}
        reducedMotion={reducedMotion ? 'always' : 'never'}
      >
        {children}
      </MotionConfig>
    </AnimationContext.Provider>
  )
}