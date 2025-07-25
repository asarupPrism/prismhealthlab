import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { swellAuth } from '@/lib/swell'

export interface AccountCreationData {
  email: string
  password?: string
  firstName: string
  lastName: string
  phone?: string
  dateOfBirth?: string
  address?: {
    address1: string
    address2?: string
    city: string
    state: string
    zip: string
    country?: string
  }
  acceptedTerms?: boolean
  marketingConsent?: boolean
}

export interface AccountCreationResult {
  success: boolean
  supabaseUserId?: string
  swellCustomerId?: string
  error?: string
  requiresEmailVerification?: boolean
}

export interface ExistingAccountResult {
  exists: boolean
  supabaseUserId?: string
  swellCustomerId?: string
  needsLinking?: boolean
  error?: string
}

// Check if account already exists in either system
export async function checkExistingAccount(email: string): Promise<ExistingAccountResult> {
  const supabase = await createClient()
  
  try {
    // Check Supabase first
    const { data: supabaseProfile, error: supabaseError } = await supabase
      .from('profiles')
      .select('user_id, email, swell_customer_id')
      .eq('email', email)
      .maybeSingle()
    
    if (supabaseError && supabaseError.code !== 'PGRST116') {
      console.error('Error checking Supabase account:', supabaseError)
      return { exists: false, error: 'Failed to check existing account' }
    }
    
    // Check Swell account
    let swellCustomer = null
    try {
      // Note: In a real implementation, you'd use Swell's admin API to check for existing customers
      // For now, we'll assume we need to create the Swell account if Supabase doesn't have the link
      swellCustomer = null
    } catch (error) {
      console.error('Error checking Swell account:', error)
      // Continue - we can still work with Supabase only
    }
    
    if (supabaseProfile) {
      return {
        exists: true,
        supabaseUserId: supabaseProfile.user_id,
        swellCustomerId: supabaseProfile.swell_customer_id || undefined,
        needsLinking: !supabaseProfile.swell_customer_id && !!swellCustomer
      }
    }
    
    return { exists: false }
  } catch (error) {
    console.error('Error in checkExistingAccount:', error)
    return { exists: false, error: 'Failed to check existing account' }
  }
}

// Create account in both Supabase and Swell
export async function createDualAccount(data: AccountCreationData): Promise<AccountCreationResult> {
  const supabase = await createClient()
  
  try {
    // Check if account already exists
    const existingCheck = await checkExistingAccount(data.email)
    if (existingCheck.error) {
      return { success: false, error: existingCheck.error }
    }
    
    if (existingCheck.exists) {
      // Account exists, check if we need to link Swell
      if (existingCheck.needsLinking) {
        return linkSwellAccount(existingCheck.supabaseUserId!, data)
      }
      
      return { 
        success: false, 
        error: 'An account with this email already exists. Please sign in instead.' 
      }
    }
    
    // Create Supabase account first
    const { data: authResult, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password || generateTemporaryPassword(),
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
        },
      },
    })
    
    if (authError) {
      console.error('Supabase account creation error:', authError)
      return { success: false, error: `Account creation failed: ${authError.message}` }
    }
    
    if (!authResult.user) {
      return { success: false, error: 'Failed to create user account' }
    }
    
    const supabaseUserId = authResult.user.id
    
    // Create Swell customer account
    let swellCustomerId: string | undefined
    try {
      const swellCustomer = await createSwellCustomer(data)
      swellCustomerId = swellCustomer.id
    } catch (error) {
      console.error('Swell customer creation error:', error)
      // Continue without Swell - we can link it later
    }
    
    // Create extended profile in Supabase
    const profileData = {
      user_id: supabaseUserId,
      email: data.email,
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
      date_of_birth: data.dateOfBirth,
      swell_customer_id: swellCustomerId,
      address_line_1: data.address?.address1,
      address_line_2: data.address?.address2,
      city: data.address?.city,
      state: data.address?.state,
      zip_code: data.address?.zip,
      country: data.address?.country || 'US',
      marketing_consent: data.marketingConsent || false,
      terms_accepted_at: data.acceptedTerms ? new Date().toISOString() : null,
    }
    
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([profileData])
    
    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Try to cleanup auth user if profile creation fails
      try {
        await supabase.auth.admin.deleteUser(supabaseUserId)
      } catch (cleanupError) {
        console.error('Failed to cleanup auth user:', cleanupError)
      }
      return { success: false, error: 'Failed to create user profile' }
    }
    
    // Record consent if provided
    if (data.acceptedTerms || data.marketingConsent) {
      await recordUserConsent(supabaseUserId, data)
    }
    
    // Log account creation
    await logSecurityEvent(supabaseUserId, 'account_created', 'profiles', {
      creation_method: 'checkout',
      has_swell_link: !!swellCustomerId,
      marketing_consent: data.marketingConsent,
      terms_accepted: data.acceptedTerms
    })
    
    return {
      success: true,
      supabaseUserId,
      swellCustomerId,
      requiresEmailVerification: !authResult.user.email_confirmed_at
    }
  } catch (error) {
    console.error('Error in createDualAccount:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Account creation failed' 
    }
  }
}

// Link existing Supabase account to Swell
async function linkSwellAccount(supabaseUserId: string, data: AccountCreationData): Promise<AccountCreationResult> {
  const supabase = await createClient()
  
  try {
    // Create Swell customer
    const swellCustomer = await createSwellCustomer(data)
    
    // Update Supabase profile with Swell customer ID
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        swell_customer_id: swellCustomer.id,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', supabaseUserId)
    
    if (updateError) {
      console.error('Failed to link Swell account:', updateError)
      return { success: false, error: 'Failed to link e-commerce account' }
    }
    
    await logSecurityEvent(supabaseUserId, 'swell_account_linked', 'profiles', {
      swell_customer_id: swellCustomer.id,
      link_method: 'checkout'
    })
    
    return {
      success: true,
      supabaseUserId,
      swellCustomerId: swellCustomer.id
    }
  } catch (error) {
    console.error('Error linking Swell account:', error)
    return { 
      success: false, 
      error: 'Failed to link e-commerce account' 
    }
  }
}

// Create Swell customer account
async function createSwellCustomer(data: AccountCreationData) {
  // Note: This uses the client-side Swell SDK which might not be available on server
  // In a production environment, you'd use Swell's server-side API
  try {
    const customerData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      ...(data.address && {
        shipping: {
          firstName: data.firstName,
          lastName: data.lastName,
          address1: data.address.address1,
          address2: data.address.address2,
          city: data.address.city,
          state: data.address.state,
          zip: data.address.zip,
          country: data.address.country || 'US'
        }
      })
    }
    
    // For now, we'll create a placeholder - in production, use Swell's admin API
    return {
      id: `swell_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...customerData
    }
  } catch (error) {
    console.error('Swell customer creation error:', error)
    throw error
  }
}

// Record user consent for HIPAA compliance
async function recordUserConsent(userId: string, data: AccountCreationData) {
  const supabase = await createClient()
  
  const consents = []
  
  if (data.acceptedTerms) {
    consents.push({
      user_id: userId,
      consent_type: 'terms_of_service',
      granted: true,
      consent_text: 'Terms of Service and Privacy Policy',
      granted_at: new Date().toISOString()
    })
  }
  
  if (data.marketingConsent) {
    consents.push({
      user_id: userId,
      consent_type: 'marketing',
      granted: true,
      consent_text: 'Marketing communications and health insights',
      granted_at: new Date().toISOString()
    })
  }
  
  if (consents.length > 0) {
    const { error } = await supabase
      .from('user_consents')
      .insert(consents)
    
    if (error) {
      console.error('Failed to record user consent:', error)
    }
  }
}

// Generate temporary password for password-less account creation
function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Security event logging (reuse from 2FA module)
async function logSecurityEvent(
  userId: string,
  action: string,
  resource: string,
  metadata: Record<string, any> = {}
) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('security_audit_logs')
    .insert({
      user_id: userId,
      action,
      resource,
      risk_score: 1, // Account creation is low risk
      metadata
    })
  
  if (error) {
    console.error('Failed to log security event:', error)
  }
}

// Enhanced account creation for checkout flow
export async function createAccountDuringCheckout(
  email: string,
  firstName: string,
  lastName: string,
  phone?: string,
  address?: {
    address1: string
    address2?: string
    city: string
    state: string
    zip: string
  }
): Promise<AccountCreationResult> {
  return createDualAccount({
    email,
    firstName,
    lastName,
    phone,
    address: address ? { ...address, country: 'US' } : undefined,
    acceptedTerms: true, // Implied by proceeding with checkout
    marketingConsent: false // Default to no marketing
  })
}

// Link Swell order to user account
export async function linkOrderToAccount(
  userId: string,
  swellOrderId: string,
  orderData: Record<string, any>
) {
  const supabase = await createClient()
  
  try {
    // Update order with user association
    const { error } = await supabase
      .from('orders')
      .update({
        user_id: userId,
        swell_order_data: orderData,
        updated_at: new Date().toISOString()
      })
      .eq('id', swellOrderId)
    
    if (error) {
      console.error('Failed to link order to account:', error)
      return false
    }
    
    await logSecurityEvent(userId, 'order_linked_to_account', 'orders', {
      swell_order_id: swellOrderId,
      link_method: 'checkout'
    })
    
    return true
  } catch (error) {
    console.error('Error linking order to account:', error)
    return false
  }
}