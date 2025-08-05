'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { usePatientWebSocket } from '@/lib/websocket/client'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import RealTimeNotifications from '@/components/notifications/RealTimeNotifications'

interface WebSocketContextValue {
  isConnected: boolean
  connectionState: string
  lastMessage: Record<string, unknown>
  reconnectAttempt: number
  sendMessage: (message: Record<string, unknown>) => void
  // Real-time data states
  orders: Record<string, unknown>[]
  appointments: Record<string, unknown>[]
  results: Record<string, unknown>[]
  // Update functions
  updateOrder: (orderId: string, updates: Record<string, unknown>) => void
  updateAppointment: (appointmentId: string, updates: Record<string, unknown>) => void
  addResult: (result: Record<string, unknown>) => void
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null)

interface WebSocketProviderProps {
  children: React.ReactNode
  enableNotifications?: boolean
  enableRealTimeUpdates?: boolean
}

export function WebSocketProvider({ 
  children, 
  enableNotifications = true,
  enableRealTimeUpdates = true 
}: WebSocketProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Record<string, unknown>[]>([])
  const [appointments, setAppointments] = useState<Record<string, unknown>[]>([])
  const [results, setResults] = useState<Record<string, unknown>[]>([])

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user as User | null)
    }

    getUser()

    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser((session?.user as User) || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // WebSocket event handlers
  const handleOrderUpdate = useCallback((orderData: unknown) => {
    if (!enableRealTimeUpdates) return
    const data = orderData as Record<string, unknown>

    setOrders(prev => {
      const existing = prev.find(o => o.id === data.id)
      if (existing) {
        return prev.map(o => o.id === data.id ? { ...o, ...data } : o)
      } else {
        return [data, ...prev]
      }
    })
  }, [enableRealTimeUpdates])

  const handleAppointmentUpdate = useCallback((appointmentData: unknown) => {
    if (!enableRealTimeUpdates) return
    const data = appointmentData as Record<string, unknown>

    setAppointments(prev => {
      const existing = prev.find(a => a.id === data.id)
      if (existing) {
        return prev.map(a => a.id === data.id ? { ...a, ...data } : a)
      } else {
        return [data, ...prev]
      }
    })
  }, [enableRealTimeUpdates])

  const handleResultAvailable = useCallback((resultData: unknown) => {
    if (!enableRealTimeUpdates) return
    const data = resultData as Record<string, unknown>

    setResults(prev => {
      const existing = prev.find(r => r.id === data.id)
      if (!existing) {
        return [data, ...prev]
      }
      return prev
    })
  }, [enableRealTimeUpdates])

  const handleSystemNotification = useCallback((data: unknown) => {
    console.log('System notification received:', data)
  }, [])

  // WebSocket connection
  const {
    isConnected,
    connectionState,
    lastMessage,
    reconnectAttempt,
    send
  } = usePatientWebSocket(user?.id as string, {
    onOrderUpdate: handleOrderUpdate,
    onAppointmentUpdate: handleAppointmentUpdate,
    onResultAvailable: handleResultAvailable,
    onSystemNotification: handleSystemNotification,
    autoConnect: !!user?.id,
    dependencies: [user?.id]
  })

  // Manual update functions
  const updateOrder = useCallback((orderId: string, updates: Record<string, unknown>) => {
    setOrders(prev => 
      prev.map(o => o.id === orderId ? { ...o, ...updates } : o)
    )
  }, [])

  const updateAppointment = useCallback((appointmentId: string, updates: Record<string, unknown>) => {
    setAppointments(prev => 
      prev.map(a => a.id === appointmentId ? { ...a, ...updates } : a)
    )
  }, [])

  const addResult = useCallback((result: Record<string, unknown>) => {
    setResults(prev => {
      const existing = prev.find(r => r.id === result.id)
      if (!existing) {
        return [result, ...prev]
      }
      return prev
    })
  }, [])

  const contextValue: WebSocketContextValue = {
    isConnected,
    connectionState,
    lastMessage: (lastMessage as unknown) as Record<string, unknown>,
    reconnectAttempt,
    sendMessage: send,
    orders,
    appointments,
    results,
    updateOrder,
    updateAppointment,
    addResult
  }

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
      
      {/* Real-time notifications overlay */}
      {enableNotifications && user?.id && (
        <RealTimeNotifications
          userId={user.id as string}
          enableSound={true}
          enablePersistence={true}
          maxNotifications={5}
        />
      )}
    </WebSocketContext.Provider>
  )
}

// Hook to use WebSocket context
export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}

// Specialized hooks for specific data types
export function useRealTimeOrders() {
  const { orders, updateOrder, isConnected } = useWebSocket()
  return { orders, updateOrder, isConnected }
}

export function useRealTimeAppointments() {
  const { appointments, updateAppointment, isConnected } = useWebSocket()
  return { appointments, updateAppointment, isConnected }
}

export function useRealTimeResults() {
  const { results, addResult, isConnected } = useWebSocket()
  return { results, addResult, isConnected }
}

// Connection status component
export function WebSocketStatus() {
  const { connectionState, reconnectAttempt } = useWebSocket()

  if (connectionState === 'connected') return null

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className={`
        flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm
        ${connectionState === 'connecting' 
          ? 'bg-amber-900/20 border border-amber-700/50 text-amber-300'
          : 'bg-rose-900/20 border border-rose-700/50 text-rose-300'
        }
      `}>
        <div className={`
          w-2 h-2 rounded-full
          ${connectionState === 'connecting' 
            ? 'bg-amber-400 animate-pulse' 
            : 'bg-rose-400'
          }
        `} />
        
        <span>
          {connectionState === 'connecting' && 'Connecting to live updates...'}
          {connectionState === 'disconnected' && reconnectAttempt > 0 && 
            `Reconnecting... (${reconnectAttempt}/5)`}
          {connectionState === 'error' && 'Connection error'}
        </span>
        
        {connectionState === 'error' && (
          <button
            onClick={() => window.location.reload()}
            className="ml-2 px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs rounded transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  )
}

// Performance monitoring for WebSocket
export function useWebSocketPerformance() {
  const [metrics, setMetrics] = useState({
    messagesReceived: 0,
    messagesSent: 0,
    connectionUptime: 0,
    averageLatency: 0,
    reconnections: 0
  })

  const { isConnected, lastMessage, reconnectAttempt } = useWebSocket()

  useEffect(() => {
    if (lastMessage) {
      setMetrics(prev => ({
        ...prev,
        messagesReceived: prev.messagesReceived + 1
      }))
    }
  }, [lastMessage])

  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      reconnections: reconnectAttempt
    }))
  }, [reconnectAttempt])

  useEffect(() => {
    if (!isConnected) return

    const startTime = Date.now()
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        connectionUptime: Date.now() - startTime
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [isConnected])

  return metrics
}

// Hook for WebSocket debugging (development only)
export function useWebSocketDebug() {
  const context = useWebSocket()
  const performance = useWebSocketPerformance()

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('WebSocket Debug Info:', {
        ...context,
        performance
      })
    }
  }, [context, performance])

  return process.env.NODE_ENV === 'development' ? { ...context, performance } : null
}