'use client'

import React, { useState, useRef, useCallback } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useDeviceCapabilities } from '@/hooks/useTouchInteractions'

interface TouchOptimizedCardProps {
  children: React.ReactNode
  className?: string
  onTap?: () => void
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onLongPress?: () => void
  allowSwipeActions?: boolean
  swipeThreshold?: number
  disabled?: boolean
  // Action buttons for swipe reveals
  leftAction?: {
    icon: string
    color: string
    label: string
    action: () => void
  }
  rightAction?: {
    icon: string
    color: string
    label: string
    action: () => void
  }
  // Visual feedback options
  enablePressEffect?: boolean
  enableRipple?: boolean
  hapticFeedback?: boolean
}

interface RippleEffect {
  id: string
  x: number
  y: number
  timestamp: number
}

export default function TouchOptimizedCard({
  children,
  className = '',
  onTap,
  onSwipeLeft,
  onSwipeRight,
  onLongPress,
  allowSwipeActions = false,
  swipeThreshold = 80,
  disabled = false,
  leftAction,
  rightAction,
  enablePressEffect = true,
  enableRipple = true,
  hapticFeedback = true
}: TouchOptimizedCardProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [ripples, setRipples] = useState<RippleEffect[]>([])
  const [swipeProgress, setSwipeProgress] = useState(0)
  const [revealedAction, setRevealedAction] = useState<'left' | 'right' | null>(null)

  const cardRef = useRef<HTMLDivElement>(null)
  const capabilities = useDeviceCapabilities()

  // Motion values for smooth animations
  const x = useMotionValue(0)
  const opacity = useTransform(
    x,
    [-swipeThreshold * 2, -swipeThreshold, 0, swipeThreshold, swipeThreshold * 2],
    [0.5, 0.8, 1, 0.8, 0.5]
  )

  // Touch interaction handlers
  const { touchHandlers, touchState } = useTouchInteractions({
    onTap: () => {
      if (!disabled && onTap) {
        onTap()
      }
    },
    onSwipeLeft: () => {
      if (!disabled && onSwipeLeft) {
        onSwipeLeft()
      }
    },
    onSwipeRight: () => {
      if (!disabled && onSwipeRight) {
        onSwipeRight()
      }
    },
    onLongPress: () => {
      if (!disabled && onLongPress) {
        onLongPress()
      }
    },
    swipeThreshold,
    enableHapticFeedback: hapticFeedback && capabilities.supportsHaptics,
    preventScrollOnSwipe: allowSwipeActions
  })

  // Handle pan gestures for swipe actions
  const handlePanStart = useCallback(() => {
    if (!allowSwipeActions || disabled) return
    setIsPressed(true)
  }, [allowSwipeActions, disabled])

  const handlePan = useCallback((_event: unknown, info: PanInfo) => {
    if (!allowSwipeActions || disabled) return

    const { offset } = info
    const progress = Math.abs(offset.x) / swipeThreshold
    
    setSwipeProgress(Math.min(progress, 1))
    x.set(offset.x)

    // Determine which action is being revealed
    if (offset.x > 20) {
      setRevealedAction('right')
    } else if (offset.x < -20) {
      setRevealedAction('left')
    } else {
      setRevealedAction(null)
    }
  }, [allowSwipeActions, disabled, swipeThreshold, x])

  const handlePanEnd = useCallback((_event: unknown, info: PanInfo) => {
    if (!allowSwipeActions || disabled) return

    const { offset, velocity } = info
    const shouldTriggerAction = Math.abs(offset.x) > swipeThreshold || Math.abs(velocity.x) > 500

    if (shouldTriggerAction) {
      if (offset.x > 0 && rightAction) {
        // Animate to reveal right action
        x.set(120)
        rightAction.action()
        
        // Haptic feedback for successful action
        if (hapticFeedback && capabilities.supportsHaptics) {
          navigator.vibrate([100, 50, 100])
        }
      } else if (offset.x < 0 && leftAction) {
        // Animate to reveal left action
        x.set(-120)
        leftAction.action()
        
        if (hapticFeedback && capabilities.supportsHaptics) {
          navigator.vibrate([100, 50, 100])
        }
      }
    }

    // Reset position
    setTimeout(() => {
      x.set(0)
      setSwipeProgress(0)
      setRevealedAction(null)
      setIsPressed(false)
    }, shouldTriggerAction ? 300 : 0)
  }, [
    allowSwipeActions, 
    disabled, 
    swipeThreshold, 
    rightAction, 
    leftAction, 
    x, 
    hapticFeedback, 
    capabilities.supportsHaptics
  ])

  // Ripple effect handler
  const handleRipple = useCallback((event: React.TouchEvent | React.MouseEvent) => {
    if (!enableRipple || disabled) return

    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY

    const ripple: RippleEffect = {
      id: Math.random().toString(36).substr(2, 9),
      x: clientX - rect.left,
      y: clientY - rect.top,
      timestamp: Date.now()
    }

    setRipples(prev => [...prev, ripple])

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== ripple.id))
    }, 600)
  }, [enableRipple, disabled])

  // Combine touch and mouse handlers
  const eventHandlers = {
    ...(capabilities.hasTouch ? touchHandlers : {}),
    onMouseDown: !capabilities.hasTouch ? (e: React.MouseEvent) => {
      handleRipple(e)
      setIsPressed(true)
    } : undefined,
    onMouseUp: !capabilities.hasTouch ? () => setIsPressed(false) : undefined,
    onMouseLeave: !capabilities.hasTouch ? () => setIsPressed(false) : undefined,
    onClick: !capabilities.hasTouch ? onTap : undefined
  }

  return (
    <div className="relative overflow-hidden">
      {/* Background actions */}
      {allowSwipeActions && (leftAction || rightAction) && (
        <div className="absolute inset-0 flex">
          {/* Left action */}
          {leftAction && (
            <motion.div
              className={`flex items-center justify-center w-20 bg-${leftAction.color}-600`}
              initial={{ x: -80 }}
              animate={{ 
                x: revealedAction === 'left' ? 0 : -80,
                opacity: revealedAction === 'left' ? 1 : 0
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="text-center text-white">
                <span className="block text-xl mb-1">{leftAction.icon}</span>
                <span className="text-xs font-medium">{leftAction.label}</span>
              </div>
            </motion.div>
          )}

          <div className="flex-1" />

          {/* Right action */}
          {rightAction && (
            <motion.div
              className={`flex items-center justify-center w-20 bg-${rightAction.color}-600`}
              initial={{ x: 80 }}
              animate={{ 
                x: revealedAction === 'right' ? 0 : 80,
                opacity: revealedAction === 'right' ? 1 : 0
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="text-center text-white">
                <span className="block text-xl mb-1">{rightAction.icon}</span>
                <span className="text-xs font-medium">{rightAction.label}</span>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Main card */}
      <motion.div
        ref={cardRef}
        className={`
          relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isPressed && enablePressEffect ? 'bg-slate-700/60' : ''}
          ${className}
        `}
        style={{ 
          x: allowSwipeActions ? x : undefined,
          opacity: allowSwipeActions ? opacity : undefined
        }}
        whileTap={
          !disabled && enablePressEffect && !capabilities.hasTouch ? 
          { scale: 0.98, backgroundColor: 'rgba(51, 65, 85, 0.6)' } : 
          undefined
        }
        onPanStart={allowSwipeActions ? handlePanStart : undefined}
        onPan={allowSwipeActions ? handlePan : undefined}
        onPanEnd={allowSwipeActions ? handlePanEnd : undefined}
        drag={allowSwipeActions && !disabled ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        {...eventHandlers}
      >
        {/* Ripple effects */}
        {enableRipple && ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full bg-white/20 pointer-events-none"
            style={{
              left: ripple.x - 20,
              top: ripple.y - 20,
              width: 40,
              height: 40
            }}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}

        {/* Swipe progress indicator */}
        {allowSwipeActions && swipeProgress > 0 && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-700/50">
            <motion.div
              className={`h-full ${
                revealedAction === 'left' ? `bg-${leftAction?.color}-400` :
                revealedAction === 'right' ? `bg-${rightAction?.color}-400` :
                'bg-slate-400'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${swipeProgress * 100}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>
        )}

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Touch target overlay for better accessibility */}
        {capabilities.hasTouch && (
          <div 
            className="absolute inset-0 z-20 bg-transparent"
            style={{ minHeight: '44px', minWidth: '44px' }} // iOS touch target minimum
          />
        )}

        {/* Visual feedback for interaction states */}
        {touchState.isActive && (
          <div className="absolute inset-0 bg-white/5 pointer-events-none" />
        )}

        {/* Long press indicator */}
        {touchState.gesture === 'longpress' && (
          <motion.div
            className="absolute inset-0 border-2 border-cyan-400 rounded-xl pointer-events-none"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.div>

      {/* Accessibility announcements */}
      <div className="sr-only" role="status" aria-live="polite">
        {touchState.gesture === 'longpress' && 'Long press detected'}
        {revealedAction && `${revealedAction} action revealed`}
      </div>
    </div>
  )
}

// Specialized card variant for purchase history items
export function PurchaseHistoryTouchCard({
  order,
  onExpand,
  onViewDetails,
  onViewResults,
  className = ''
}: {
  order: Record<string, unknown>
  onExpand?: () => void
  onViewDetails?: () => void
  onViewResults?: () => void
  className?: string
}) {
  const capabilities = useDeviceCapabilities()

  const leftAction = onViewResults ? {
    icon: '📋',
    color: 'emerald',
    label: 'Results',
    action: onViewResults
  } : undefined

  const rightAction = onViewDetails ? {
    icon: '👁️',
    color: 'blue',
    label: 'Details',
    action: onViewDetails
  } : undefined

  return (
    <TouchOptimizedCard
      className={className}
      onTap={onExpand}
      allowSwipeActions={capabilities.hasTouch}
      leftAction={leftAction}
      rightAction={rightAction}
      swipeThreshold={100}
      enablePressEffect={true}
      enableRipple={true}
      hapticFeedback={true}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <h3 className="text-lg font-semibold text-white">
                Order #{order.id.slice(-8).toUpperCase()}
              </h3>
              <div className="px-2 py-1 text-xs font-medium rounded-full bg-cyan-900/30 text-cyan-300 border border-cyan-700/50">
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span>{new Date(order.created_at).toLocaleDateString()}</span>
              <span>{order.order_tests?.length || 0} test{(order.order_tests?.length || 0) !== 1 ? 's' : ''}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-semibold text-white">
              ${order.total_amount.toFixed(2)}
            </div>
            {order.discount_amount > 0 && (
              <div className="text-sm text-emerald-400">
                -${order.discount_amount.toFixed(2)} saved
              </div>
            )}
          </div>
        </div>

        {/* Compact test summary */}
        <div className="bg-slate-900/30 rounded-lg p-3 mb-4">
          <div className="text-sm text-white">
            {order.order_tests?.slice(0, 2).map((test: { test_name: string }) => test.test_name).join(', ')}
            {(order.order_tests?.length || 0) > 2 && (
              <span className="text-slate-400"> +{(order.order_tests?.length || 0) - 2} more</span>
            )}
          </div>
        </div>

        {/* Touch-friendly action hints */}
        {capabilities.hasTouch && (
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Tap to expand</span>
            <span>Swipe for actions</span>
          </div>
        )}
      </div>
    </TouchOptimizedCard>
  )
}