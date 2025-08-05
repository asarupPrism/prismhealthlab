import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { get2FAStatus } from '@/lib/auth/two-factor'

// GET /api/auth/2fa/status - Get comprehensive 2FA status
export async function GET() {
  try {
    const supabase = await createClient()
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    try {
      const status = await get2FAStatus(user.id)
      
      // Get recent attempts for additional context
      const { data: recentAttempts } = await supabase
        .from('two_factor_attempts')
        .select('attempt_type, success, created_at')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .order('created_at', { ascending: false })
        .limit(10)
      
      // Check if account is locked
      const { data: profile } = await supabase
        .from('profiles')
        .select('locked_until, failed_2fa_attempts')
        .eq('user_id', user.id)
        .single()
      
      const isLocked = profile?.locked_until && new Date(profile.locked_until) > new Date()
      
      return NextResponse.json({
        enabled: status.enabled,
        lastVerification: status.lastVerification,
        backupCodesCount: status.backupCodesCount,
        isLocked: !!isLocked,
        lockedUntil: profile?.locked_until,
        failedAttempts: profile?.failed_2fa_attempts || 0,
        recentAttempts: recentAttempts?.map((attempt: { attempt_type: string; success: boolean; created_at: string }) => ({
          type: attempt.attempt_type,
          success: attempt.success,
          timestamp: attempt.created_at
        })) || []
      })
    } catch (error) {
      console.error('2FA status error:', error)
      return NextResponse.json(
        { error: 'Failed to get 2FA status' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}