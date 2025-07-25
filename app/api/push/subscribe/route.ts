import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logPatientDataAccess } from '@/lib/audit/hipaa-logger'

// POST /api/push/subscribe - Subscribe user to push notifications
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { subscription } = await request.json()

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      )
    }

    // Store or update push subscription in database
    const { error: upsertError } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh_key: subscription.keys?.p256dh,
          auth_key: subscription.keys?.auth,
          subscription_data: subscription,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true
        },
        {
          onConflict: 'user_id',
          ignoreDuplicates: false
        }
      )

    if (upsertError) {
      console.error('Failed to store push subscription:', upsertError)
      return NextResponse.json(
        { error: 'Failed to store subscription' },
        { status: 500 }
      )
    }

    // Update user preferences to enable push notifications
    await supabase
      .from('user_preferences')
      .upsert(
        {
          user_id: user.id,
          push_notifications: true,
          notification_types: {
            order_updates: true,
            appointment_reminders: true,
            result_notifications: true,
            system_alerts: true
          },
          updated_at: new Date().toISOString()
        },
        {
          onConflict: 'user_id',
          ignoreDuplicates: false
        }
      )

    // HIPAA audit log
    logPatientDataAccess(
      user.id,
      user.id,
      'push_subscription',
      'subscribe_to_push_notifications',
      'success',
      {
        endpoint: subscription.endpoint,
        user_agent: request.headers.get('user-agent'),
        subscription_timestamp: new Date().toISOString()
      },
      request
    ).catch(console.error)

    // Send welcome notification
    await sendWelcomeNotification(user.id, subscription)

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to push notifications'
    })

  } catch (error) {
    console.error('Push subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Send welcome notification after subscription
async function sendWelcomeNotification(userId: string, subscription: any) {
  try {
    const webpush = require('web-push')
    
    // Configure web-push (in production, store these as environment variables)
    webpush.setVapidDetails(
      'mailto:notifications@prismhealthlab.com',
      process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NjsHn96YE',
      process.env.VAPID_PRIVATE_KEY || 'your-private-vapid-key'
    )

    const payload = JSON.stringify({
      title: 'Welcome to Prism Health Lab',
      body: 'You\'ll now receive important notifications about your health journey',
      icon: '/icons/notification-icon.png',
      badge: '/icons/badge-icon.png',
      data: {
        url: '/portal',
        type: 'welcome',
        timestamp: Date.now()
      },
      actions: [
        {
          action: 'view',
          title: 'View Portal'
        }
      ],
      tag: 'welcome-notification',
      requireInteraction: false
    })

    await webpush.sendNotification(subscription, payload)
    console.log('Welcome notification sent to user:', userId)

  } catch (error) {
    console.error('Failed to send welcome notification:', error)
  }
}