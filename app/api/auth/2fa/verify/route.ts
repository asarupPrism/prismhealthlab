import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyAndEnableTOTP, verifyTOTPForLogin, verifyBackupCode } from '@/lib/auth/two-factor'

interface VerifyRequest {
  code: string
  purpose: 'setup' | 'login' | 'sensitive_action'
}

// POST /api/auth/2fa/verify - Verify 2FA code
export async function POST(request: NextRequest) {
  try {
    const body: VerifyRequest = await request.json()
    const { code, purpose = 'login' } = body
    
    if (!code) {
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    
    // Verify user is authenticated (except for login purpose)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if ((authError || !user) && purpose !== 'login') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // For login purpose, get user ID from session/request
    const userId = user?.id
    if (purpose === 'login' && !userId) {
      // In a real implementation, you'd get the user ID from the login session
      // For now, we'll require authentication for all purposes
      return NextResponse.json({ error: 'User session required' }, { status: 401 })
    }
    
    try {
      let result
      
      switch (purpose) {
        case 'setup':
          result = await verifyAndEnableTOTP(userId!, code)
          break
        case 'login':
        case 'sensitive_action':
          // Check if it's a backup code (8 characters, hex)
          if (code.length === 8 && /^[A-F0-9]+$/i.test(code)) {
            result = await verifyBackupCode(userId!, code)
          } else {
            result = await verifyTOTPForLogin(userId!, code)
          }
          break
        default:
          return NextResponse.json(
            { error: 'Invalid verification purpose' },
            { status: 400 }
          )
      }
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: result.message
        })
      } else {
        return NextResponse.json({
          success: false,
          error: result.message,
          remainingAttempts: result.remainingAttempts
        }, { status: 400 })
      }
    } catch (error) {
      console.error('2FA verification error:', error)
      return NextResponse.json(
        { error: 'Verification failed. Please try again.' },
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