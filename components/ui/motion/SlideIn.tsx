'use client'

import React from 'react'
import MedicalMotion from './MedicalMotion'

interface SlideInProps {
  children: React.ReactNode
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
  duration?: number
  disabled?: boolean
}

/**
 * Medical-grade slide-in animation component
 * Provides smooth directional entrance animations following design system
 */
export default function SlideIn({
  children,
  className,
  direction = 'up',
  delay = 0,
  duration = 0.4,
  disabled = false
}: SlideInProps) {
  return (
    <MedicalMotion
      type="slide"
      direction={direction}
      className={className}
      delay={delay}
      duration={duration}
      disabled={disabled}
    >
      {children}
    </MedicalMotion>
  )
}