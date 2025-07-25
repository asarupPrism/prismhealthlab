import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logPatientDataAccess } from '@/lib/audit/hipaa-logger'

const webpush = require('web-push')

// Configure web-push
webpush.setVapidDetails(
  'mailto:notifications@prismhealthlab.com',
  process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NjsHn96YE',
  process.env.VAPID_PRIVATE_KEY || 'your-private-vapid-key'
)

interface PushNotificationPayload {
  userId: string
  title: string
  body: string
  data?: any
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  type?: 'order_update' | 'appointment_reminder' | 'result_available' | 'system_alert'
  actions?: Array<{
    action: string
    title: string
  }>
  requireInteraction?: boolean
  silent?: boolean
  tag?: string
}

// POST /api/push/send - Send push notification to user
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Verify admin or system authentication
    const authHeader = request.headers.get('Authorization')
    const apiKey = request.headers.get('X-API-Key')
    
    // Check if request is from authenticated admin or system
    let isAuthorized = false
    let adminUserId = null
    
    if (authHeader?.startsWith('Bearer ')) {
      const { data: { user }, error } = await supabase.auth.getUser(authHeader.split(' ')[1])
      if (!error && user) {
        // Check if user is admin
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single()
        
        isAuthorized = profile?.role === 'admin' || profile?.role === 'healthcare_provider'
        adminUserId = user.id
      }
    } else if (apiKey === process.env.PUSH_API_KEY) {
      // System API key authentication
      isAuthorized = true
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const payload: PushNotificationPayload = await request.json()

    if (!payload.userId || !payload.title || !payload.body) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, title, body' },
        { status: 400 }
      )
    }

    // Get user's push subscription
    const { data: subscription, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', payload.userId)
      .eq('is_active', true)
      .single()

    if (subError || !subscription) {
      return NextResponse.json(
        { error: 'User not subscribed to push notifications' },
        { status: 404 }
      )
    }

    // Check user's notification preferences
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('push_notifications, notification_types')
      .eq('user_id', payload.userId)
      .single()

    if (!preferences?.push_notifications) {
      return NextResponse.json(
        { error: 'User has disabled push notifications' },
        { status: 403 }
      )
    }

    // Check if specific notification type is enabled
    if (payload.type && preferences.notification_types) {
      const typeEnabled = preferences.notification_types[payload.type]
      if (!typeEnabled) {
        return NextResponse.json(
          { error: `User has disabled ${payload.type} notifications` },
          { status: 403 }
        )
      }
    }

    // Prepare notification payload
    const notificationPayload = {
      title: payload.title,
      body: payload.body,
      icon: '/icons/notification-icon.png',
      badge: '/icons/badge-icon.png',
      data: {
        ...payload.data,
        type: payload.type,
        timestamp: Date.now(),
        url: payload.data?.url || '/portal'
      },
      actions: payload.actions || [
        {
          action: 'view',
          title: 'View'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ],
      requireInteraction: payload.requireInteraction || payload.priority === 'urgent',
      silent: payload.silent || false,
      tag: payload.tag || `prism-${payload.type || 'notification'}`,
      vibrate: getVibrationPattern(payload.priority || 'medium')
    }

    // Send push notification
    const pushResult = await webpush.sendNotification(
      subscription.subscription_data,
      JSON.stringify(notificationPayload),
      {
        urgency: getPushUrgency(payload.priority || 'medium'),
        TTL: getTTL(payload.priority || 'medium')
      }
    )

    // Log notification in database
    await supabase
      .from('push_notifications_log')
      .insert({
        user_id: payload.userId,
        subscription_id: subscription.id,
        notification_type: payload.type || 'general',
        title: payload.title,
        body: payload.body,
        payload: notificationPayload,
        sent_at: new Date().toISOString(),
        status: 'sent',
        priority: payload.priority || 'medium'
      })

    // HIPAA audit log
    logPatientDataAccess(
      adminUserId || 'system',
      payload.userId,
      'push_notification',
      'send_push_notification',
      'success',
      {
        notification_type: payload.type,
        title: payload.title,
        priority: payload.priority,
        admin_user_id: adminUserId,
        sent_timestamp: new Date().toISOString()
      },
      request
    ).catch(console.error)

    return NextResponse.json({
      success: true,
      message: 'Push notification sent successfully',
      notificationId: pushResult.statusCode || 'sent'
    })

  } catch (error) {
    console.error('Push notification send error:', error)

    // Handle specific web-push errors
    if (error.statusCode === 410) {
      // Subscription expired - deactivate it
      await deactivateExpiredSubscription(error)
      return NextResponse.json(
        { error: 'Push subscription expired and has been deactivated' },
        { status: 410 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to send push notification' },
      { status: 500 }
    )
  }
}

function getVibrationPattern(priority: string): number[] {
  switch (priority) {
    case 'urgent':
      return [200, 100, 200, 100, 200]
    case 'high':
      return [100, 50, 100]
    case 'medium':
      return [100]
    case 'low':
      return [50]
    default:
      return [100]
  }
}

function getPushUrgency(priority: string): 'very-low' | 'low' | 'normal' | 'high' {
  switch (priority) {
    case 'urgent':
      return 'high'
    case 'high':
      return 'high'
    case 'medium':
      return 'normal'
    case 'low':
      return 'low'
    default:
      return 'normal'
  }
}

function getTTL(priority: string): number {
  switch (priority) {
    case 'urgent':
      return 3600 // 1 hour
    case 'high':
      return 21600 // 6 hours
    case 'medium':
      return 86400 // 24 hours
    case 'low':
      return 604800 // 7 days
    default:
      return 86400
  }
}

async function deactivateExpiredSubscription(error: any) {
  try {
    const supabase = createClient()
    
    // Extract endpoint from error if possible
    const endpoint = error.endpoint
    if (endpoint) {
      await supabase
        .from('push_subscriptions')
        .update({
          is_active: false,
          unsubscribed_at: new Date().toISOString(),
          unsubscribe_reason: 'subscription_expired'
        })
        .eq('endpoint', endpoint)
    }
  } catch (deactivateError) {
    console.error('Failed to deactivate expired subscription:', deactivateError)
  }
}

// GET /api/push/send - Get push notification statistics (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Verify admin authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get notification statistics
    const { data: stats, error: statsError } = await supabase
      .from('push_notifications_log')
      .select('notification_type, status, priority, sent_at')
      .gte('sent_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days

    if (statsError) {
      throw statsError
    }

    // Process statistics
    const processed = {
      totalSent: stats?.length || 0,
      byType: {},
      byPriority: {},
      byStatus: {},
      recentActivity: stats?.slice(-10) || []
    }

    stats?.forEach(notification => {
      // By type
      processed.byType[notification.notification_type] = 
        (processed.byType[notification.notification_type] || 0) + 1

      // By priority
      processed.byPriority[notification.priority] = 
        (processed.byPriority[notification.priority] || 0) + 1

      // By status
      processed.byStatus[notification.status] = 
        (processed.byStatus[notification.status] || 0) + 1
    })

    return NextResponse.json({
      success: true,
      data: processed
    })

  } catch (error) {
    console.error('Push statistics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch push notification statistics' },
      { status: 500 }
    )
  }
}