'use client'

import React from 'react'
import MedicalMotion from './MedicalMotion'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
  hover?: boolean
  disabled?: boolean
}

/**
 * Medical-grade glass-morphism card with animations
 * Follows design system specifications for backdrop blur and transparency
 */
export default function GlassCard({
  children,
  className = '',
  delay = 0,
  hover = true,
  disabled = false
}: GlassCardProps) {
  const baseClasses = 'backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 rounded-2xl'
  const hoverClasses = hover ? 'hover:bg-slate-800/40 hover:border-slate-600/40 transition-all duration-300' : ''
  const combinedClasses = `${baseClasses} ${hoverClasses} ${className}`.trim()

  return (
    <MedicalMotion
      type="slide"
      direction="up"
      delay={delay}
      className={combinedClasses}
      disabled={disabled}
    >
      {children}
    </MedicalMotion>
  )
}