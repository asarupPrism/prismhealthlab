'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePatientWebSocket } from '@/lib/websocket/client'
// createClient import removed - not used

interface Notification {
  id: string
  type: 'order_update' | 'appointment_update' | 'result_available' | 'system_notification'
  title: string
  message: string
  data?: Record<string, unknown>
  timestamp: string
  read: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  autoHide?: boolean
  hideDelay?: number
}

interface RealTimeNotificationsProps {
  userId: string
  maxNotifications?: number
  enableSound?: boolean
  enablePersistence?: boolean
  className?: string
}

export default function RealTimeNotifications({
  userId,
  maxNotifications = 5,
  enableSound = true,
  enablePersistence = true,
  className = ''
}: RealTimeNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  // isVisible and setIsVisible state removed - not used
  const [soundEnabled, setSoundEnabled] = useState(enableSound)
  const [unreadCount, setUnreadCount] = useState(0)

  const audioRef = useRef<HTMLAudioElement>()
  const persistenceKey = `notifications_${userId}`

  // Load persisted notifications on mount
  useEffect(() => {
    if (!enablePersistence) return

    try {
      const saved = localStorage.getItem(persistenceKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        setNotifications(parsed.notifications || [])
        setUnreadCount(parsed.unreadCount || 0)
      }
    } catch (_error) {
      console.error('Failed to load persisted notifications:', _error)
    }
  }, [enablePersistence, persistenceKey])

  // Persist notifications when they change
  useEffect(() => {
    if (!enablePersistence) return

    try {
      localStorage.setItem(persistenceKey, JSON.stringify({
        notifications: notifications.slice(-maxNotifications),
        unreadCount
      }))
    } catch (_error) {
      console.error('Failed to persist notifications:', _error)
    }
  }, [notifications, unreadCount, enablePersistence, persistenceKey, maxNotifications])

  // Initialize audio for notifications
  useEffect(() => {
    if (soundEnabled && typeof window !== 'undefined') {
      audioRef.current = new Audio('/sounds/notification.mp3')
      audioRef.current.volume = 0.5
    }
  }, [soundEnabled])

  // Play notification sound
  const playNotificationSound = useCallback((priority: string) => {
    if (!soundEnabled || !audioRef.current) return

    try {
      // Different tones for different priorities
      switch (priority) {
        case 'urgent':
          audioRef.current.src = '/sounds/urgent.mp3'
          break
        case 'high':
          audioRef.current.src = '/sounds/high-priority.mp3'
          break
        default:
          audioRef.current.src = '/sounds/notification.mp3'
      }
      
      audioRef.current.play().catch(console.error)
    } catch (_error) {
      console.error('Failed to play notification sound:', _error)
    }
  }, [soundEnabled])

  // Add new notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      read: false
    }

    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, maxNotifications)
      return updated
    })

    setUnreadCount(prev => prev + 1)
    playNotificationSound(notification.priority)

    // Auto-hide if specified
    if (notification.autoHide !== false) {
      const delay = notification.hideDelay || getPriorityDelay(notification.priority)
      setTimeout(() => {
        removeNotification(newNotification.id)
      }, delay)
    }

    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icons/notification-icon.png',
        tag: newNotification.id
      })
    }

    // Trigger haptic feedback on mobile
    if ('vibrate' in navigator) {
      const pattern = notification.priority === 'urgent' ? [200, 100, 200] : [100]
      navigator.vibrate(pattern)
    }
  }, [maxNotifications, playNotificationSound])

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }, [])

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  // WebSocket event handlers
  const handleOrderUpdate = useCallback((data: Record<string, unknown>) => {
    const statusMessages = {
      processing: 'Your order is being processed',
      completed: 'Your order has been completed',
      shipped: 'Your order has been shipped',
      cancelled: 'Your order has been cancelled'
    }

    addNotification({
      type: 'order_update',
      title: 'Order Update',
      message: statusMessages[data.status as keyof typeof statusMessages] || 'Your order status has changed',
      data,
      timestamp: new Date().toISOString(),
      priority: data.status === 'completed' ? 'high' : 'medium'
    })
  }, [addNotification])

  const handleAppointmentUpdate = useCallback((data: Record<string, unknown>) => {
    const statusMessages = {
      scheduled: 'Your appointment has been scheduled',
      confirmed: 'Your appointment has been confirmed',
      rescheduled: 'Your appointment has been rescheduled',
      cancelled: 'Your appointment has been cancelled',
      completed: 'Your appointment has been completed'
    }

    addNotification({
      type: 'appointment_update',
      title: 'Appointment Update',
      message: statusMessages[data.status as keyof typeof statusMessages] || 'Your appointment status has changed',
      data,
      timestamp: new Date().toISOString(),
      priority: data.status === 'cancelled' ? 'high' : 'medium'
    })
  }, [addNotification])

  const handleResultAvailable = useCallback((data: Record<string, unknown>) => {
    addNotification({
      type: 'result_available',
      title: 'Test Results Available',
      message: 'Your test results are now available for review',
      data,
      timestamp: new Date().toISOString(),
      priority: 'high',
      autoHide: false // Don't auto-hide result notifications
    })
  }, [addNotification])

  const handleSystemNotification = useCallback((data: Record<string, unknown>) => {
    addNotification({
      type: 'system_notification',
      title: data.title || 'System Notification',
      message: data.message,
      data: data.data,
      timestamp: new Date().toISOString(),
      priority: data.priority || 'medium'
    })
  }, [addNotification])

  // WebSocket connection
  const { connectionState, isConnected } = usePatientWebSocket(userId, {
    onOrderUpdate: handleOrderUpdate,
    onAppointmentUpdate: handleAppointmentUpdate,
    onResultAvailable: handleResultAvailable,
    onSystemNotification: handleSystemNotification,
    onConnect: () => {
      console.log('Real-time notifications connected')
    },
    onDisconnect: () => {
      console.log('Real-time notifications disconnected')
    },
    onError: (_error) => {
      console.error('Real-time notifications error:', _error)
    }
  })

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const getPriorityDelay = (priority: string): number => {
    switch (priority) {
      case 'urgent': return 10000 // 10 seconds
      case 'high': return 8000   // 8 seconds
      case 'medium': return 6000 // 6 seconds
      case 'low': return 4000    // 4 seconds
      default: return 6000
    }
  }

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'urgent': return 'rose'
      case 'high': return 'amber'
      case 'medium': return 'cyan'
      case 'low': return 'slate'
      default: return 'cyan'
    }
  }

  const getNotificationIcon = (type: string): string => {
    switch (type) {
      case 'order_update': return '📦'
      case 'appointment_update': return '📅'
      case 'result_available': return '📋'
      case 'system_notification': return '🔔'
      default: return '📱'
    }
  }

  return (
    <div className={`real-time-notifications ${className}`}>
      {/* Connection status indicator */}
      <div className="fixed top-4 right-4 z-50">
        <motion.div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
            isConnected 
              ? 'bg-emerald-900/20 border border-emerald-700/50 text-emerald-300'
              : 'bg-amber-900/20 border border-amber-700/50 text-amber-300'
          }`}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
        >
          <div 
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`} 
          />
          <span>
            {isConnected ? 'Live' : connectionState === 'connecting' ? 'Connecting...' : 'Offline'}
          </span>
          {unreadCount > 0 && (
            <div className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full min-w-[1.25rem] text-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
        </motion.div>
      </div>

      {/* Notification controls */}
      {notifications.length > 0 && (
        <div className="fixed top-16 right-4 z-40">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg text-sm transition-colors ${
                soundEnabled 
                  ? 'bg-cyan-900/20 border border-cyan-700/50 text-cyan-300'
                  : 'bg-slate-800/50 border border-slate-700/50 text-slate-400'
              }`}
              aria-label={soundEnabled ? 'Disable sound' : 'Enable sound'}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
            
            <button
              onClick={markAllAsRead}
              className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:text-white text-sm rounded-lg transition-colors"
              disabled={unreadCount === 0}
            >
              Mark all read
            </button>
            
            <button
              onClick={clearAll}
              className="px-3 py-2 bg-rose-900/20 border border-rose-700/50 text-rose-300 hover:text-rose-200 text-sm rounded-lg transition-colors"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Notifications container */}
      <div className="fixed top-24 right-4 z-30 max-w-sm space-y-3">
        <AnimatePresence mode="popLayout">
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className={`
                bg-slate-800/95 backdrop-blur-sm border rounded-xl p-4 shadow-lg cursor-pointer
                ${notification.read 
                  ? 'border-slate-700/50 opacity-75' 
                  : `border-${getPriorityColor(notification.priority)}-700/50`
                }
              `}
              onClick={() => !notification.read && markAsRead(notification.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <span className="text-xl">
                    {getNotificationIcon(notification.type)}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-white truncate">
                      {notification.title}
                    </h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeNotification(notification.id)
                      }}
                      className="text-slate-400 hover:text-white transition-colors"
                      aria-label="Dismiss notification"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <p className="text-sm text-slate-300 leading-relaxed mb-2">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </span>
                    
                    {!notification.read && (
                      <div className={`w-2 h-2 rounded-full bg-${getPriorityColor(notification.priority)}-400`} />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Screen reader announcements */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {notifications.filter(n => !n.read).length > 0 && 
          `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`}
      </div>
    </div>
  )
}

// Hook for managing notification preferences
export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState({
    enableSound: true,
    enableBrowser: true,
    enablePush: false,
    priorityFilter: 'all' as 'all' | 'high' | 'urgent',
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  })

  useEffect(() => {
    const saved = localStorage.getItem('notification-preferences')
    if (saved) {
      try {
        setPreferences(prev => ({ ...prev, ...JSON.parse(saved) }))
      } catch (_error) {
        console.error('Failed to load notification preferences:', _error)
      }
    }
  }, [])

  const updatePreference = useCallback((key: string, value: unknown) => {
    setPreferences(prev => {
      const updated = { ...prev, [key]: value }
      localStorage.setItem('notification-preferences', JSON.stringify(updated))
      return updated
    })
  }, [])

  return { preferences, updatePreference }
}