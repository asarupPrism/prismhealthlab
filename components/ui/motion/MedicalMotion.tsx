'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'

// Dynamically import motion with SSR disabled
const DynamicMotion = dynamic(
  () => import('framer-motion').then(mod => ({ default: mod.motion.div })),
  { 
    ssr: false,
    loading: () => <div className="opacity-0" /> // Prevent layout shift
  }
)

interface MedicalMotionProps {
  children: React.ReactNode
  className?: string
  initial?: Record<string, any>
  animate?: Record<string, any>
  transition?: Record<string, any>
  delay?: number
  duration?: number
  type?: 'fade' | 'slide' | 'scale' | 'none'
  direction?: 'up' | 'down' | 'left' | 'right'
  disabled?: boolean
}

// Medical-grade animation presets following design system
const MEDICAL_ANIMATIONS = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 }
  },
  slide: {
    up: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 }
    },
    down: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 }
    },
    left: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 }
    },
    right: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 }
    }
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 }
  }
}

// Medical-grade timing following design system
const MEDICAL_TIMING = {
  duration: 0.4, // Professional, not too fast
  ease: [0.4, 0.0, 0.2, 1], // Material Design easing
  stiffness: 300,
  damping: 30
}

export default function MedicalMotion({
  children,
  className = '',
  initial,
  animate,
  transition,
  delay = 0,
  duration = MEDICAL_TIMING.duration,
  type = 'fade',
  direction = 'up',
  disabled = false
}: MedicalMotionProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [shouldAnimate, setShouldAnimate] = useState(true)

  useEffect(() => {
    setIsMounted(true)
    
    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setShouldAnimate(!prefersReducedMotion && !disabled)
  }, [disabled])

  // Get animation config based on type and direction
  const getAnimationConfig = () => {
    if (!shouldAnimate || type === 'none') {
      return {
        initial: {},
        animate: {}
      }
    }

    if (initial && animate) {
      return { initial, animate }
    }

    switch (type) {
      case 'slide':
        return MEDICAL_ANIMATIONS.slide[direction as keyof typeof MEDICAL_ANIMATIONS.slide]
      case 'scale':
        return MEDICAL_ANIMATIONS.scale
      case 'fade':
      default:
        return MEDICAL_ANIMATIONS.fade
    }
  }

  const animationConfig = getAnimationConfig()
  
  const transitionConfig = transition || {
    duration,
    delay,
    ease: MEDICAL_TIMING.ease,
    type: 'spring',
    stiffness: MEDICAL_TIMING.stiffness,
    damping: MEDICAL_TIMING.damping
  }

  // Server-side render: show content without animation
  if (!isMounted) {
    return (
      <div className={className}>
        {children}
      </div>
    )
  }

  // Client-side render with animation
  if (shouldAnimate) {
    return (
      <DynamicMotion
        className={className}
        initial={animationConfig.initial}
        animate={animationConfig.animate}
        transition={transitionConfig}
      >
        {children}
      </DynamicMotion>
    )
  }

  // Fallback for reduced motion or disabled
  return (
    <div className={className}>
      {children}
    </div>
  )
}