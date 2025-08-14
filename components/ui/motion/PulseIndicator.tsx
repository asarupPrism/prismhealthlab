'use client'

import React from 'react'

interface PulseIndicatorProps {
  color?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'blue' | 'purple'
  size?: 'sm' | 'md' | 'lg'
  delay?: number
  className?: string
}

/**
 * Medical-grade LED-style pulse indicators
 * Uses CSS animations for optimal performance and accessibility
 */
export default function PulseIndicator({
  color = 'cyan',
  size = 'md',
  delay = 0,
  className = ''
}: PulseIndicatorProps) {
  const colorClasses = {
    cyan: 'bg-cyan-400',
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    rose: 'bg-rose-400',
    blue: 'bg-blue-400',
    purple: 'bg-purple-400'
  }

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  const animationStyle = delay > 0 ? { animationDelay: `${delay}s` } : {}

  return (
    <div 
      className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-pulse ${className}`}
      style={animationStyle}
      role="status"
      aria-label="System status indicator"
    />
  )
}