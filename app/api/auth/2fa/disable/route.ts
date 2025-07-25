import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { disable2FA, verifyTOTPForLogin, logSecurityEvent } from '@/lib/auth/two-factor'

interface DisableRequest {
  password: string
  twoFactorCode: string
}

// POST /api/auth/2fa/disable - Disable 2FA for user account
export async function POST(request: NextRequest) {
  try {
    const body: DisableRequest = await request.json()
    const { password, twoFactorCode } = body
    
    if (!password || !twoFactorCode) {
      return NextResponse.json(
        { error: 'Password and 2FA code are required' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    try {
      // First verify the current password
      const { error: passwordError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: password
      })
      
      if (passwordError) {
        await logSecurityEvent(user.id, '2fa_disable_password_failed', 'profiles', {
          error: passwordError.message
        })
        
        return NextResponse.json(
          { error: 'Invalid password' },
          { status: 401 }
        )
      }
      
      // Then verify the 2FA code
      const verificationResult = await verifyTOTPForLogin(user.id, twoFactorCode)
      
      if (!verificationResult.success) {
        await logSecurityEvent(user.id, '2fa_disable_verification_failed', 'profiles', {
          error: verificationResult.message
        })
        
        return NextResponse.json({
          success: false,
          error: verificationResult.message,
          remainingAttempts: verificationResult.remainingAttempts
        }, { status: 400 })
      }
      
      // Disable 2FA
      const success = await disable2FA(user.id)
      
      if (success) {
        return NextResponse.json({
          success: true,
          message: '2FA has been disabled for your account. We recommend re-enabling it for security.'
        })
      } else {
        return NextResponse.json(
          { error: 'Failed to disable 2FA. Please try again.' },
          { status: 500 }
        )
      }
    } catch (error) {
      console.error('2FA disable error:', error)
      
      await logSecurityEvent(user.id, '2fa_disable_error', 'profiles', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      return NextResponse.json(
        { error: 'Failed to disable 2FA. Please try again.' },
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