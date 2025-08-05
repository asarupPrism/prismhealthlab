import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logPatientDataAccess } from '@/lib/audit/hipaa-logger'

// POST /api/push/unsubscribe - Unsubscribe user from push notifications
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { reason } = await request.json()

    // Deactivate push subscription
    const { error: updateError } = await supabase
      .from('push_subscriptions')
      .update({
        is_active: false,
        unsubscribed_at: new Date().toISOString(),
        unsubscribe_reason: reason || 'user_request'
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Failed to unsubscribe:', updateError)
      return NextResponse.json(
        { error: 'Failed to unsubscribe' },
        { status: 500 }
      )
    }

    // Update user preferences
    await supabase
      .from('user_preferences')
      .update({
        push_notifications: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    // HIPAA audit log
    logPatientDataAccess(
      user.id,
      user.id,
      'push_subscription',
      'unsubscribe_from_push_notifications',
      'success',
      {
        reason: reason || 'user_request',
        user_agent: request.headers.get('user-agent'),
        unsubscribe_timestamp: new Date().toISOString()
      },
      request
    ).catch(console.error)

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from push notifications'
    })

  } catch (error) {
    console.error('Push unsubscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}