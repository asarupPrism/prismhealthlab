'use client'

import React from 'react'
import MedicalMotion from './MedicalMotion'

interface FadeInProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  disabled?: boolean
}

/**
 * Medical-grade fade-in animation component
 * Provides smooth opacity transitions following design system standards
 */
export default function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.4,
  disabled = false
}: FadeInProps) {
  return (
    <MedicalMotion
      type="fade"
      className={className}
      delay={delay}
      duration={duration}
      disabled={disabled}
    >
      {children}
    </MedicalMotion>
  )
}