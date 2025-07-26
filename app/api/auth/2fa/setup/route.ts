import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { setupTOTP, logSecurityEvent } from '@/lib/auth/two-factor'

// POST /api/auth/2fa/setup - Initialize 2FA setup
export async function POST() {
  try {
    const supabase = await createClient()
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if 2FA is already enabled
    const { data: profile } = await supabase
      .from('profiles')
      .select('two_factor_enabled')
      .eq('user_id', user.id)
      .single()
    
    if (profile?.two_factor_enabled) {
      return NextResponse.json(
        { error: '2FA is already enabled for this account' },
        { status: 400 }
      )
    }
    
    try {
      const setupResult = await setupTOTP(user.id)
      
      return NextResponse.json({
        success: true,
        data: {
          qrCodeUrl: setupResult.qrCodeUrl,
          backupCodes: setupResult.backupCodes,
          message: 'Scan the QR code with your authenticator app, then verify with a code to complete setup.'
        }
      })
    } catch (error) {
      console.error('2FA setup error:', error)
      
      await logSecurityEvent(user.id, 'totp_setup_failed', 'profiles', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      return NextResponse.json(
        { error: 'Failed to setup 2FA. Please try again.' },
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

// GET /api/auth/2fa/setup - Get 2FA setup status
export async function GET() {
  try {
    const supabase = await createClient()
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get user's 2FA status
    const { data: profile } = await supabase
      .from('profiles')
      .select('two_factor_enabled, totp_secret, backup_codes, last_2fa_verification')
      .eq('user_id', user.id)
      .single()
    
    return NextResponse.json({
      enabled: profile?.two_factor_enabled || false,
      hasSecret: !!profile?.totp_secret,
      backupCodesCount: profile?.backup_codes?.length || 0,
      lastVerification: profile?.last_2fa_verification,
      canSetup: !profile?.two_factor_enabled
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}