import { NextRequest, NextResponse } from 'next/server'
import { createAccountDuringCheckout, checkExistingAccount, linkOrderToAccount } from '@/lib/account/account-creation'

interface CreateAccountRequest {
  email: string
  firstName: string
  lastName: string
  phone?: string
  address?: {
    address1: string
    address2?: string
    city: string
    state: string
    zip: string
  }
  orderData?: {
    swellOrderId: string
    orderDetails: Record<string, unknown>
  }
}

// POST /api/account/create-checkout - Create account during checkout flow
export async function POST(request: NextRequest) {
  try {
    const body: CreateAccountRequest = await request.json()
    const { email, firstName, lastName, phone, address, orderData } = body
    
    // Validate required fields
    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, first name, and last name are required' },
        { status: 400 }
      )
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }
    
    try {
      console.log('Creating account during checkout for:', email)
      
      // Check if account already exists
      const existingCheck = await checkExistingAccount(email)
      if (existingCheck.error) {
        return NextResponse.json(
          { error: existingCheck.error },
          { status: 500 }
        )
      }
      
      if (existingCheck.exists) {
        // Account exists - return the user ID for order linking
        console.log('Account already exists for:', email)
        
        // Link order to existing account if provided
        if (orderData && existingCheck.supabaseUserId) {
          await linkOrderToAccount(
            existingCheck.supabaseUserId,
            orderData.swellOrderId,
            orderData.orderDetails
          )
        }
        
        return NextResponse.json({
          success: true,
          accountExists: true,
          userId: existingCheck.supabaseUserId,
          swellCustomerId: existingCheck.swellCustomerId,
          message: 'Account already exists. Order has been linked to your existing account.'
        })
      }
      
      // Create new account
      const result = await createAccountDuringCheckout(
        email,
        firstName,
        lastName,
        phone,
        address
      )
      
      if (!result.success) {
        console.error('Account creation failed:', result.error)
        return NextResponse.json(
          { error: result.error || 'Failed to create account' },
          { status: 500 }
        )
      }
      
      console.log('Account created successfully:', result.supabaseUserId)
      
      // Link order to new account if provided
      if (orderData && result.supabaseUserId) {
        const linked = await linkOrderToAccount(
          result.supabaseUserId,
          orderData.swellOrderId,
          orderData.orderDetails
        )
        
        if (!linked) {
          console.warn('Failed to link order to new account')
        }
      }
      
      return NextResponse.json({
        success: true,
        accountExists: false,
        userId: result.supabaseUserId,
        swellCustomerId: result.swellCustomerId,
        requiresEmailVerification: result.requiresEmailVerification,
        message: result.requiresEmailVerification 
          ? 'Account created successfully! Please check your email to verify your account.'
          : 'Account created successfully! You can now access your patient portal.'
      })
    } catch (error) {
      console.error('Account creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create account. Please try again.' },
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

// GET /api/account/create-checkout - Check if account exists (for form validation)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }
    
    const result = await checkExistingAccount(email)
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      exists: result.exists,
      hasSwellLink: !!result.swellCustomerId,
      needsLinking: result.needsLinking || false
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}