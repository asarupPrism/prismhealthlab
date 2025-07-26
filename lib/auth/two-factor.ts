import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { createHash, randomBytes } from 'crypto'
import { authenticator } from 'otplib'

// Configure TOTP settings
authenticator.options = {
  step: 30, // 30-second time window
  window: 1, // Allow 1 step before/after current time
}

// Types for 2FA
export interface TwoFactorSetupResult {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
}

export interface TwoFactorVerificationResult {
  success: boolean
  message: string
  remainingAttempts?: number
}

export interface SMSVerificationResult {
  success: boolean
  message: string
  expiresAt: Date
}

// Generate secure backup codes
function generateBackupCodes(count: number = 8): string[] {
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    codes.push(randomBytes(4).toString('hex').toUpperCase())
  }
  return codes
}

// Hash codes for secure storage
function hashCode(code: string): string {
  return createHash('sha256').update(code).digest('hex')
}

// Generate TOTP secret and QR code
export async function setupTOTP(userId: string): Promise<TwoFactorSetupResult> {
  const supabase = await createClient()
  
  // Generate secret
  const secret = authenticator.generateSecret()
  
  // Get user profile for QR code
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, first_name, last_name')
    .eq('user_id', userId)
    .single()
  
  if (!profile) {
    throw new Error('User profile not found')
  }
  
  const serviceName = 'Prism Health Lab'
  const accountName = profile.email
  const qrCodeUrl = authenticator.keyuri(accountName, serviceName, secret)
  
  // Generate backup codes
  const backupCodes = generateBackupCodes()
  
  // Store secret and backup codes (don't enable 2FA yet)
  const { error } = await supabase
    .from('profiles')
    .update({
      totp_secret: secret,
      backup_codes: backupCodes,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
  
  if (error) {
    throw new Error(`Failed to store 2FA setup: ${error.message}`)
  }
  
  // Log the setup attempt
  await logSecurityEvent(userId, 'totp_setup_initiated', 'profiles', {
    setup_method: 'totp'
  })
  
  return {
    secret,
    qrCodeUrl,
    backupCodes
  }
}

// Verify TOTP code and enable 2FA
export async function verifyAndEnableTOTP(userId: string, token: string): Promise<TwoFactorVerificationResult> {
  const supabase = await createClient()
  
  // Check for rate limiting
  const { data: attempts } = await supabase
    .from('two_factor_attempts')
    .select('*')
    .eq('user_id', userId)
    .eq('attempt_type', 'totp')
    .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
    .order('created_at', { ascending: false })
  
  if (attempts && attempts.length >= 5) {
    await logSecurityEvent(userId, 'totp_rate_limit_exceeded', 'two_factor_attempts', {
      attempts_count: attempts.length
    })
    
    return {
      success: false,
      message: 'Too many attempts. Please try again in an hour.'
    }
  }
  
  // Get user's TOTP secret
  const { data: profile } = await supabase
    .from('profiles')
    .select('totp_secret')
    .eq('user_id', userId)
    .single()
  
  if (!profile?.totp_secret) {
    return {
      success: false,
      message: '2FA setup not found. Please restart the setup process.'
    }
  }
  
  // Verify the token
  const isValid = authenticator.verify({
    token,
    secret: profile.totp_secret
  })
  
  // Log the attempt
  const { error: logError } = await supabase
    .from('two_factor_attempts')
    .insert({
      user_id: userId,
      attempt_type: 'totp',
      code_hash: hashCode(token),
      success: isValid,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
    })
  
  if (logError) {
    console.error('Failed to log 2FA attempt:', logError)
  }
  
  if (isValid) {
    // Enable 2FA for the user
    const { error } = await supabase
      .from('profiles')
      .update({
        two_factor_enabled: true,
        last_2fa_verification: new Date().toISOString(),
        failed_2fa_attempts: 0,
        locked_until: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
    
    if (error) {
      throw new Error(`Failed to enable 2FA: ${error.message}`)
    }
    
    await logSecurityEvent(userId, 'totp_enabled', 'profiles', {
      verification_method: 'totp'
    })
    
    return {
      success: true,
      message: '2FA has been successfully enabled for your account.'
    }
  } else {
    // Update failed attempts
    const { error } = await supabase
      .from('profiles')
      .update({
        failed_2fa_attempts: ((profile as unknown as { failed_2fa_attempts: number }).failed_2fa_attempts || 0) + 1
      })
      .eq('user_id', userId)
    
    if (error) {
      console.error('Failed to update failed attempts:', error)
    }
    
    await logSecurityEvent(userId, 'totp_verification_failed', 'two_factor_attempts', {
      verification_method: 'totp'
    })
    
    const remainingAttempts = Math.max(0, 5 - ((attempts?.length || 0) + 1))
    
    return {
      success: false,
      message: 'Invalid verification code. Please try again.',
      remainingAttempts
    }
  }
}

// Verify TOTP for login
export async function verifyTOTPForLogin(userId: string, token: string): Promise<TwoFactorVerificationResult> {
  const supabase = await createClient()
  
  // Check if user is locked
  const { data: profile } = await supabase
    .from('profiles')
    .select('totp_secret, two_factor_enabled, failed_2fa_attempts, locked_until')
    .eq('user_id', userId)
    .single()
  
  if (!profile) {
    return {
      success: false,
      message: 'User not found.'
    }
  }
  
  if (!profile.two_factor_enabled || !profile.totp_secret) {
    return {
      success: false,
      message: '2FA is not enabled for this account.'
    }
  }
  
  // Check if account is locked
  if (profile.locked_until && new Date(profile.locked_until) > new Date()) {
    const unlockTime = new Date(profile.locked_until).toLocaleTimeString()
    return {
      success: false,
      message: `Account temporarily locked. Try again after ${unlockTime}.`
    }
  }
  
  // Check for recent failed attempts
  if (profile.failed_2fa_attempts >= 5) {
    // Lock account for 30 minutes
    const lockUntil = new Date(Date.now() + 30 * 60 * 1000)
    await supabase
      .from('profiles')
      .update({
        locked_until: lockUntil.toISOString()
      })
      .eq('user_id', userId)
    
    await logSecurityEvent(userId, 'account_locked_2fa_failures', 'profiles', {
      failed_attempts: profile.failed_2fa_attempts,
      locked_until: lockUntil.toISOString()
    })
    
    return {
      success: false,
      message: 'Account locked due to multiple failed attempts. Please try again in 30 minutes.'
    }
  }
  
  // Try backup codes first
  if (token.length === 8 && /^[A-F0-9]+$/.test(token.toUpperCase())) {
    return verifyBackupCode(userId, token)
  }
  
  // Verify TOTP token
  const isValid = authenticator.verify({
    token,
    secret: profile.totp_secret
  })
  
  // Log the attempt
  await supabase
    .from('two_factor_attempts')
    .insert({
      user_id: userId,
      attempt_type: 'totp',
      code_hash: hashCode(token),
      success: isValid,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    })
  
  if (isValid) {
    // Reset failed attempts and update last verification
    await supabase
      .from('profiles')
      .update({
        failed_2fa_attempts: 0,
        last_2fa_verification: new Date().toISOString(),
        locked_until: null
      })
      .eq('user_id', userId)
    
    await logSecurityEvent(userId, 'totp_login_success', 'profiles', {
      verification_method: 'totp'
    })
    
    return {
      success: true,
      message: '2FA verification successful.'
    }
  } else {
    // Increment failed attempts
    await supabase
      .from('profiles')
      .update({
        failed_2fa_attempts: profile.failed_2fa_attempts + 1
      })
      .eq('user_id', userId)
    
    await logSecurityEvent(userId, 'totp_login_failed', 'two_factor_attempts', {
      verification_method: 'totp',
      failed_attempts: profile.failed_2fa_attempts + 1
    })
    
    const remainingAttempts = Math.max(0, 5 - (profile.failed_2fa_attempts + 1))
    
    return {
      success: false,
      message: 'Invalid verification code. Please try again.',
      remainingAttempts
    }
  }
}

// Verify backup code
export async function verifyBackupCode(userId: string, code: string): Promise<TwoFactorVerificationResult> {
  const supabase = await createClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('backup_codes, two_factor_enabled')
    .eq('user_id', userId)
    .single()
  
  if (!profile?.two_factor_enabled || !profile.backup_codes) {
    return {
      success: false,
      message: '2FA is not enabled or backup codes not found.'
    }
  }
  
  const normalizedCode = code.replace(/\s/g, '').toUpperCase()
  const codeIndex = profile.backup_codes.indexOf(normalizedCode)
  
  if (codeIndex === -1) {
    await logSecurityEvent(userId, 'backup_code_invalid', 'two_factor_attempts', {
      code_attempted: normalizedCode.substring(0, 2) + '****' // Log partial code for security
    })
    
    return {
      success: false,
      message: 'Invalid backup code.'
    }
  }
  
  // Remove used backup code
  const updatedCodes = [...profile.backup_codes]
  updatedCodes.splice(codeIndex, 1)
  
  await supabase
    .from('profiles')
    .update({
      backup_codes: updatedCodes,
      failed_2fa_attempts: 0,
      last_2fa_verification: new Date().toISOString(),
      locked_until: null
    })
    .eq('user_id', userId)
  
  await logSecurityEvent(userId, 'backup_code_used', 'profiles', {
    remaining_codes: updatedCodes.length
  })
  
  return {
    success: true,
    message: `Backup code accepted. You have ${updatedCodes.length} backup codes remaining.`
  }
}

// Disable 2FA
export async function disable2FA(userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('profiles')
    .update({
      two_factor_enabled: false,
      totp_secret: null,
      backup_codes: null,
      failed_2fa_attempts: 0,
      locked_until: null,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
  
  if (error) {
    throw new Error(`Failed to disable 2FA: ${error.message}`)
  }
  
  await logSecurityEvent(userId, 'totp_disabled', 'profiles', {
    disabled_at: new Date().toISOString()
  })
  
  return true
}

// Generate new backup codes
export async function regenerateBackupCodes(userId: string): Promise<string[]> {
  const supabase = await createClient()
  
  const newBackupCodes = generateBackupCodes()
  
  const { error } = await supabase
    .from('profiles')
    .update({
      backup_codes: newBackupCodes,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
  
  if (error) {
    throw new Error(`Failed to regenerate backup codes: ${error.message}`)
  }
  
  await logSecurityEvent(userId, 'backup_codes_regenerated', 'profiles', {
    codes_count: newBackupCodes.length
  })
  
  return newBackupCodes
}

// Security event logging
export async function logSecurityEvent(
  userId: string,
  action: string,
  resource: string,
  metadata: Record<string, unknown> = {}
) {
  const supabase = await createClient()
  
  // Calculate risk score based on action
  let riskScore = 0
  const highRiskActions = ['account_locked_2fa_failures', 'totp_rate_limit_exceeded', 'backup_code_invalid']
  const mediumRiskActions = ['totp_verification_failed', 'totp_login_failed']
  
  if (highRiskActions.includes(action)) {
    riskScore = 8
  } else if (mediumRiskActions.includes(action)) {
    riskScore = 5
  } else if (action.includes('success') || action.includes('enabled')) {
    riskScore = 1
  } else {
    riskScore = 3
  }
  
  const { error } = await supabase
    .from('security_audit_logs')
    .insert({
      user_id: userId,
      action,
      resource,
      risk_score: riskScore,
      metadata
    })
  
  if (error) {
    console.error('Failed to log security event:', error)
  }
}

// Check if user has 2FA enabled
export async function is2FAEnabled(userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('two_factor_enabled')
    .eq('user_id', userId)
    .single()
  
  return profile?.two_factor_enabled || false
}

// Get 2FA status
export async function get2FAStatus(userId: string) {
  const supabase = await createClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('two_factor_enabled, last_2fa_verification, backup_codes')
    .eq('user_id', userId)
    .single()
  
  return {
    enabled: profile?.two_factor_enabled || false,
    lastVerification: profile?.last_2fa_verification,
    backupCodesCount: profile?.backup_codes?.length || 0
  }
}