'use client'

import { createClient } from '@/lib/supabase/client'

interface WebSocketMessage {
  type: 'order_update' | 'appointment_update' | 'result_available' | 'system_notification'
  payload: unknown
  timestamp: string
  userId: string
}

interface WebSocketOptions {
  onOrderUpdate?: (data: unknown) => void
  onAppointmentUpdate?: (data: unknown) => void
  onResultAvailable?: (data: unknown) => void
  onSystemNotification?: (data: unknown) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
  reconnectAttempts?: number
  reconnectDelay?: number
  enableHeartbeat?: boolean
  heartbeatInterval?: number
}

export class PatientWebSocketClient {
  private ws: WebSocket | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private heartbeatTimer: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private isConnecting = false
  private isDestroyed = false
  
  private readonly maxReconnectAttempts: number
  private readonly reconnectDelay: number
  private readonly enableHeartbeat: boolean
  private readonly heartbeatInterval: number
  
  private callbacks: Required<Omit<WebSocketOptions, 'reconnectAttempts' | 'reconnectDelay' | 'enableHeartbeat' | 'heartbeatInterval'>>

  constructor(private userId: string, options: WebSocketOptions = {}) {
    this.maxReconnectAttempts = options.reconnectAttempts ?? 5
    this.reconnectDelay = options.reconnectDelay ?? 3000
    this.enableHeartbeat = options.enableHeartbeat ?? true
    this.heartbeatInterval = options.heartbeatInterval ?? 30000

    this.callbacks = {
      onOrderUpdate: options.onOrderUpdate ?? (() => {}),
      onAppointmentUpdate: options.onAppointmentUpdate ?? (() => {}),
      onResultAvailable: options.onResultAvailable ?? (() => {}),
      onSystemNotification: options.onSystemNotification ?? (() => {}),
      onConnect: options.onConnect ?? (() => {}),
      onDisconnect: options.onDisconnect ?? (() => {}),
      onError: options.onError ?? (() => {})
    }
  }

  async connect(): Promise<void> {
    if (this.isDestroyed || this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return
    }

    this.isConnecting = true

    try {
      // Get authentication token
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('No authentication token available')
      }

      // Determine WebSocket URL based on environment
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsHost = process.env.NODE_ENV === 'production' 
        ? window.location.host 
        : 'localhost:3000'
      
      const wsUrl = `${wsProtocol}//${wsHost}/api/websocket?token=${encodeURIComponent(session.access_token)}&userId=${encodeURIComponent(this.userId)}`

      this.ws = new WebSocket(wsUrl)
      
      this.ws.onopen = this.handleOpen.bind(this)
      this.ws.onmessage = this.handleMessage.bind(this)
      this.ws.onclose = this.handleClose.bind(this)
      this.ws.onerror = this.handleError.bind(this)

    } catch (error) {
      this.isConnecting = false
      console.error('WebSocket connection failed:', error)
      this.callbacks.onError(error as Error)
      this.scheduleReconnect()
    }
  }

  private handleOpen(): void {
    console.log('WebSocket connected')
    this.isConnecting = false
    this.reconnectAttempts = 0
    
    // Start heartbeat
    if (this.enableHeartbeat) {
      this.startHeartbeat()
    }

    this.callbacks.onConnect()
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data)
      console.log('WebSocket message received:', message)

      // Verify message is for this user
      if (message.userId !== this.userId) {
        console.warn('Received message for different user:', message.userId)
        return
      }

      switch (message.type) {
        case 'order_update':
          this.callbacks.onOrderUpdate(message.payload)
          break
        case 'appointment_update':
          this.callbacks.onAppointmentUpdate(message.payload)
          break
        case 'result_available':
          this.callbacks.onResultAvailable(message.payload)
          break
        case 'system_notification':
          this.callbacks.onSystemNotification(message.payload)
          break
        default:
          console.warn('Unknown message type:', message.type)
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
      this.callbacks.onError(new Error('Invalid message format'))
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log('WebSocket disconnected:', event.code, event.reason)
    
    this.stopHeartbeat()
    this.callbacks.onDisconnect()

    // Don't reconnect if connection was closed intentionally
    if (!this.isDestroyed && event.code !== 1000) {
      this.scheduleReconnect()
    }
  }

  private handleError(event: Event): void {
    console.error('WebSocket error:', event)
    this.callbacks.onError(new Error('WebSocket connection error'))
  }

  private scheduleReconnect(): void {
    if (this.isDestroyed || this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts)
    console.log(`Scheduling reconnection attempt ${this.reconnectAttempts + 1} in ${delay}ms`)

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++
      this.connect()
    }, delay)
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }))
      }
    }, this.heartbeatInterval)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  public disconnect(): void {
    this.isDestroyed = true
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    this.stopHeartbeat()

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }
  }

  public getConnectionState(): string {
    if (!this.ws) return 'disconnected'
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting'
      case WebSocket.OPEN: return 'connected'
      case WebSocket.CLOSING: return 'closing'
      case WebSocket.CLOSED: return 'disconnected'
      default: return 'unknown'
    }
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  // Send a message to the server (if needed for future features)
  public send(message: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('Cannot send message: WebSocket not connected')
    }
  }
}

// React hook for using WebSocket in components
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'

interface UseWebSocketOptions extends WebSocketOptions {
  autoConnect?: boolean
  dependencies?: unknown[]
}

export function usePatientWebSocket(userId: string, options: UseWebSocketOptions = {}) {
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [reconnectAttempt, setReconnectAttempt] = useState(0)
  
  const clientRef = useRef<PatientWebSocketClient | null>(null)
  const { autoConnect = true, dependencies = [], ...wsOptions } = options

  // Enhanced callbacks that update React state
  const enhancedOptions: WebSocketOptions = useMemo(() => ({
    ...wsOptions,
    onConnect: () => {
      setConnectionState('connected')
      setReconnectAttempt(0)
      options.onConnect?.()
    },
    onDisconnect: () => {
      setConnectionState('disconnected')
      options.onDisconnect?.()
    },
    onError: (error) => {
      setConnectionState('error')
      options.onError?.(error)
    },
    onOrderUpdate: (data) => {
      setLastMessage({ type: 'order_update', payload: data, timestamp: new Date().toISOString(), userId })
      options.onOrderUpdate?.(data)
    },
    onAppointmentUpdate: (data) => {
      setLastMessage({ type: 'appointment_update', payload: data, timestamp: new Date().toISOString(), userId })
      options.onAppointmentUpdate?.(data)
    },
    onResultAvailable: (data) => {
      setLastMessage({ type: 'result_available', payload: data, timestamp: new Date().toISOString(), userId })
      options.onResultAvailable?.(data)
    },
    onSystemNotification: (data) => {
      setLastMessage({ type: 'system_notification', payload: data, timestamp: new Date().toISOString(), userId })
      options.onSystemNotification?.(data)
    }
  }), [wsOptions, options, userId])

  // Initialize WebSocket client
  useEffect(() => {
    if (!userId) return

    clientRef.current = new PatientWebSocketClient(userId, enhancedOptions)

    if (autoConnect) {
      setConnectionState('connecting')
      clientRef.current.connect()
    }

    return () => {
      clientRef.current?.disconnect()
      clientRef.current = null
    }
  }, [userId, autoConnect, enhancedOptions, ...dependencies])

  // Manual connection control
  const connect = useCallback(() => {
    if (clientRef.current) {
      setConnectionState('connecting')
      clientRef.current.connect()
    }
  }, [])

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.disconnect()
      setConnectionState('disconnected')
    }
  }, [])

  const send = useCallback((message: unknown) => {
    clientRef.current?.send(message)
  }, [])

  // Status information
  const isConnected = connectionState === 'connected'
  const isConnecting = connectionState === 'connecting'
  const hasError = connectionState === 'error'

  return {
    connectionState,
    isConnected,
    isConnecting,
    hasError,
    lastMessage,
    reconnectAttempt,
    connect,
    disconnect,
    send,
    client: clientRef.current
  }
}

// Hook for specific data types
export function useOrderUpdates(userId: string, onUpdate?: (order: unknown) => void) {
  return usePatientWebSocket(userId, {
    onOrderUpdate: onUpdate,
    autoConnect: true
  })
}

export function useAppointmentUpdates(userId: string, onUpdate?: (appointment: unknown) => void) {
  return usePatientWebSocket(userId, {
    onAppointmentUpdate: onUpdate,
    autoConnect: true
  })
}

export function useResultNotifications(userId: string, onResult?: (result: unknown) => void) {
  return usePatientWebSocket(userId, {
    onResultAvailable: onResult,
    autoConnect: true
  })
}