import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logPatientDataAccess } from '@/lib/audit/hipaa-logger'

interface WebSocketConnection {
  ws: WebSocket
  userId: string
  lastHeartbeat: number
  subscriptions: Set<string>
}

// In-memory connection store (in production, use Redis or similar)
const connections = new Map<string, WebSocketConnection>()
const userConnections = new Map<string, Set<string>>()

// WebSocket upgrade handler
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const userId = searchParams.get('userId')

  if (!token || !userId) {
    return new Response('Missing authentication parameters', { status: 400 })
  }

  try {
    // Verify authentication token
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user || user.id !== userId) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Check if WebSocket upgrade is available
    if (!request.headers.get('upgrade')?.toLowerCase().includes('websocket')) {
      return new Response('WebSocket upgrade required', { status: 426 })
    }

    // Upgrade to WebSocket
    const { socket: ws, response } = upgradeWebSocket(request)

    if (!ws) {
      return new Response('WebSocket upgrade failed', { status: 500 })
    }

    const connectionId = generateConnectionId()
    
    ws.onopen = () => {
      console.log(`WebSocket connected: ${connectionId} for user ${userId}`)
      
      // Store connection
      connections.set(connectionId, {
        ws,
        userId,
        lastHeartbeat: Date.now(),
        subscriptions: new Set()
      })

      // Track user connections
      if (!userConnections.has(userId)) {
        userConnections.set(userId, new Set())
      }
      userConnections.get(userId)!.add(connectionId)

      // Send connection confirmation
      ws.send(JSON.stringify({
        type: 'connection_established',
        payload: { connectionId, userId },
        timestamp: new Date().toISOString(),
        userId
      }))

      // Set up subscriptions for this user
      setupUserSubscriptions(connectionId, userId)

      // HIPAA audit log
      logPatientDataAccess(
        userId,
        userId,
        'websocket_connection',
        'establish_realtime_connection',
        'success',
        { connection_id: connectionId },
        request
      ).catch(console.error)
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        handleClientMessage(connectionId, message)
      } catch (error) {
        console.error('Invalid WebSocket message:', error)
      }
    }

    ws.onclose = () => {
      console.log(`WebSocket disconnected: ${connectionId}`)
      cleanup(connectionId)
    }

    ws.onerror = (error) => {
      console.error(`WebSocket error for ${connectionId}:`, error)
      cleanup(connectionId)
    }

    return response

  } catch (error) {
    console.error('WebSocket upgrade error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}

// Polyfill for WebSocket upgrade (since Next.js doesn't have built-in WebSocket support)
function upgradeWebSocket() {
  // This is a simplified implementation
  // In production, you would use a WebSocket library like 'ws' or deploy to a platform that supports WebSockets
  
  // For development/demo purposes, we'll simulate the WebSocket upgrade
  // In a real implementation, you would need to:
  // 1. Use a WebSocket server library
  // 2. Handle the HTTP upgrade protocol correctly
  // 3. Integrate with your deployment platform's WebSocket support
  
  return {
    socket: null, // Would be the actual WebSocket instance
    response: new Response('WebSocket upgrade not implemented in this environment', { 
      status: 501,
      headers: {
        'Content-Type': 'text/plain'
      }
    })
  }
}

function generateConnectionId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

async function setupUserSubscriptions(connectionId: string, userId: string) {
  const connection = connections.get(connectionId)
  if (!connection) return

  try {
    const supabase = createClient()

    // Subscribe to order updates
    supabase
      .channel(`orders_${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        broadcastToUser(userId, {
          type: 'order_update',
          payload: payload.new || payload.old,
          timestamp: new Date().toISOString(),
          userId
        })
      })
      .subscribe()

    // Subscribe to appointment updates
    supabase
      .channel(`appointments_${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'appointments',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        broadcastToUser(userId, {
          type: 'appointment_update',
          payload: payload.new || payload.old,
          timestamp: new Date().toISOString(),
          userId
        })
      })
      .subscribe()

    // Subscribe to test results
    supabase
      .channel(`test_results_${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'test_results',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        broadcastToUser(userId, {
          type: 'result_available',
          payload: payload.new,
          timestamp: new Date().toISOString(),
          userId
        })
      })
      .subscribe()

    // Store subscription references for cleanup
    connection.subscriptions.add('orders')
    connection.subscriptions.add('appointments')
    connection.subscriptions.add('results')

  } catch (error) {
    console.error('Failed to setup subscriptions:', error)
  }
}

function handleClientMessage(connectionId: string, message: Record<string, unknown>) {
  const connection = connections.get(connectionId)
  if (!connection) return

  switch (message.type) {
    case 'ping':
      // Respond to heartbeat
      connection.lastHeartbeat = Date.now()
      connection.ws.send(JSON.stringify({
        type: 'pong',
        timestamp: new Date().toISOString(),
        userId: connection.userId
      }))
      break

    case 'subscribe':
      // Handle additional subscriptions if needed
      if (message.channel && typeof message.channel === 'string') {
        connection.subscriptions.add(message.channel as string)
      }
      break

    case 'unsubscribe':
      // Handle unsubscriptions
      if (message.channel && typeof message.channel === 'string') {
        connection.subscriptions.delete(message.channel as string)
      }
      break

    default:
      console.warn('Unknown client message type:', message.type as string)
  }
}

function broadcastToUser(userId: string, message: Record<string, unknown>) {
  const userConnectionIds = userConnections.get(userId)
  if (!userConnectionIds) return

  userConnectionIds.forEach(connectionId => {
    const connection = connections.get(connectionId)
    if (connection && connection.ws.readyState === WebSocket.OPEN) {
      try {
        connection.ws.send(JSON.stringify(message))
      } catch (error) {
        console.error(`Failed to send message to ${connectionId}:`, error)
        cleanup(connectionId)
      }
    }
  })
}

function cleanup(connectionId: string) {
  const connection = connections.get(connectionId)
  if (!connection) return

  // Remove from user connections
  const userConnectionIds = userConnections.get(connection.userId)
  if (userConnectionIds) {
    userConnectionIds.delete(connectionId)
    if (userConnectionIds.size === 0) {
      userConnections.delete(connection.userId)
    }
  }

  // Clean up subscriptions
  connection.subscriptions.clear()

  // Remove connection
  connections.delete(connectionId)

  console.log(`Cleaned up connection ${connectionId}`)
}

// Heartbeat monitoring
setInterval(() => {
  const now = Date.now()
  const staleConnections: string[] = []

  connections.forEach((connection, connectionId) => {
    if (now - connection.lastHeartbeat > 60000) { // 1 minute timeout
      staleConnections.push(connectionId)
    }
  })

  staleConnections.forEach(cleanup)
}, 30000) // Check every 30 seconds

// Utility functions removed - not used in current implementation

// Health check endpoint
export async function POST() {
  const activeConnections = connections.size
  const activeUsers = userConnections.size

  return new Response(JSON.stringify({
    status: 'healthy',
    connections: activeConnections,
    users: activeUsers,
    timestamp: new Date().toISOString()
  }), {
    headers: { 'Content-Type': 'application/json' }
  })
}