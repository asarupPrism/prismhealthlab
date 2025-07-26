import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { regenerateBackupCodes, verifyTOTPForLogin, logSecurityEvent } from '@/lib/auth/two-factor'

interface RegenerateRequest {
  twoFactorCode: string
}

// POST /api/auth/2fa/backup-codes - Regenerate backup codes
export async function POST(request: NextRequest) {
  try {
    const body: RegenerateRequest = await request.json()
    const { twoFactorCode } = body
    
    if (!twoFactorCode) {
      return NextResponse.json(
        { error: '2FA verification code is required' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if 2FA is enabled
    const { data: profile } = await supabase
      .from('profiles')
      .select('two_factor_enabled')
      .eq('user_id', user.id)
      .single()
    
    if (!profile?.two_factor_enabled) {
      return NextResponse.json(
        { error: '2FA is not enabled for this account' },
        { status: 400 }
      )
    }
    
    try {
      // Verify the 2FA code
      const verificationResult = await verifyTOTPForLogin(user.id, twoFactorCode)
      
      if (!verificationResult.success) {
        await logSecurityEvent(user.id, 'backup_codes_regeneration_failed', 'profiles', {
          error: verificationResult.message
        })
        
        return NextResponse.json({
          success: false,
          error: verificationResult.message,
          remainingAttempts: verificationResult.remainingAttempts
        }, { status: 400 })
      }
      
      // Regenerate backup codes
      const newBackupCodes = await regenerateBackupCodes(user.id)
      
      return NextResponse.json({
        success: true,
        backupCodes: newBackupCodes,
        message: 'New backup codes have been generated. Store them securely - they will not be shown again.'
      })
    } catch (error) {
      console.error('Backup codes regeneration error:', error)
      
      await logSecurityEvent(user.id, 'backup_codes_regeneration_error', 'profiles', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      return NextResponse.json(
        { error: 'Failed to regenerate backup codes. Please try again.' },
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

// GET /api/auth/2fa/backup-codes - Get backup codes count
export async function GET() {
  try {
    const supabase = await createClient()
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get backup codes count
    const { data: profile } = await supabase
      .from('profiles')
      .select('backup_codes, two_factor_enabled')
      .eq('user_id', user.id)
      .single()
    
    return NextResponse.json({
      enabled: profile?.two_factor_enabled || false,
      backupCodesCount: profile?.backup_codes?.length || 0
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}