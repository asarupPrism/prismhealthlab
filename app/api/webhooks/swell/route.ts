import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createHash, timingSafeEqual } from 'crypto'
import { queueCacheInvalidation } from '@/lib/cache/invalidation-service'

// Swell webhook event types
interface SwellWebhookEvent {
  type: string
  data: {
    id: string
    [key: string]: unknown
  }
  created: string
}

interface OrderWebhookData {
  id: string
  status: string
  payment_status?: string
  total: number
  grand_total?: number
  sub_total?: number
  currency: string
  account?: {
    id: string
    email: string
  }
  billing?: {
    first_name: string
    last_name: string
    email: string
    phone?: string
    address1?: string
    address2?: string
    city?: string
    state?: string
    zip?: string
    country?: string
  }
  shipping?: {
    first_name?: string
    last_name?: string
    address1?: string
    address2?: string
    city?: string
    state?: string
    zip?: string
    country?: string
  }
  items?: Array<{
    id: string
    product_id: string
    product: {
      name: string
      [key: string]: unknown
    }
    quantity: number
    price: number
    variant_id?: string
  }>
  metadata?: Record<string, unknown>
  date_created: string
  date_updated: string
}

// Verify Swell webhook signature
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  if (!signature || !signature.startsWith('sha256=')) {
    return false
  }
  
  const expectedSignature = createHash('sha256')
    .update(payload)
    .update(secret)
    .digest('hex')
  
  const actualSignature = signature.slice(7) // Remove 'sha256=' prefix
  
  if (expectedSignature.length !== actualSignature.length) {
    return false
  }
  
  return timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(actualSignature, 'hex')
  )
}

// Handle order creation with enhanced account linking
async function handleOrderCreated(orderData: OrderWebhookData) {
  const supabase = await createClient()
  
  try {
    console.log('Processing new order:', orderData.id)
    
    // Find or create user account
    let userId = null
    const customerEmail = orderData.account?.email || orderData.billing?.email
    
    if (customerEmail) {
      // Check if user already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('user_id, swell_customer_id')
        .eq('email', customerEmail)
        .maybeSingle()
      
      if (existingProfile) {
        userId = existingProfile.user_id
        
        // Update Swell customer ID if missing
        if (!existingProfile.swell_customer_id && orderData.account?.id) {
          await supabase
            .from('profiles')
            .update({ 
              swell_customer_id: orderData.account.id,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
        }
      } else if (orderData.billing) {
        // Create account via API
        try {
          const response = await fetch('/api/account/create-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: customerEmail,
              firstName: orderData.billing.first_name,
              lastName: orderData.billing.last_name,
              phone: orderData.billing.phone,
              address: {
                address1: orderData.billing.address1,
                address2: orderData.billing.address2,
                city: orderData.billing.city,
                state: orderData.billing.state,
                zip: orderData.billing.zip
              },
              orderData: {
                swellOrderId: orderData.id,
                orderDetails: orderData
              }
            })
          })
          
          const result = await response.json()
          if (result.success) {
            userId = result.userId
            console.log('Account created for new customer:', userId)
          }
        } catch (error) {
          console.error('Failed to create account during webhook:', error)
        }
      }
    }
    
    // Prepare comprehensive order data
    const orderRecord = {
      id: orderData.id,
      user_id: userId,
      total_amount: orderData.grand_total || orderData.total || 0,
      discount_amount: 0, // Calculate from order data if available
      currency: orderData.currency || 'USD',
      status: orderData.status || 'pending',
      billing_info: orderData.billing ? {
        firstName: orderData.billing.first_name,
        lastName: orderData.billing.last_name,
        email: orderData.billing.email,
        phone: orderData.billing.phone,
        address1: orderData.billing.address1,
        address2: orderData.billing.address2,
        city: orderData.billing.city,
        state: orderData.billing.state,
        zip: orderData.billing.zip,
        country: orderData.billing.country || 'US'
      } : null,
      swell_order_data: orderData,
      metadata: {
        ...orderData.metadata,
        webhook_processed_at: new Date().toISOString(),
        created_via: 'webhook',
        payment_status: orderData.payment_status
      },
      created_at: new Date(orderData.date_created).toISOString()
    }
    
    // Insert order
    const { data: insertedOrder, error: orderError } = await supabase
      .from('orders')
      .insert([orderRecord])
      .select()
      .single()
    
    if (orderError) {
      console.error('Error inserting order:', orderError)
      return false
    }
    
    // Insert order items
    if (orderData.items && orderData.items.length > 0) {
      const orderItems = orderData.items.map(item => ({
        order_id: orderData.id,
        test_id: item.product_id,
        test_name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        variant_id: item.variant_id
      }))
      
      const { error: itemsError } = await supabase
        .from('order_tests')
        .insert(orderItems)
      
      if (itemsError) {
        console.error('Error inserting order items:', itemsError)
      }
    }
    
    // Process appointment if in metadata
    if (orderData.metadata?.appointment && userId) {
      await processAppointmentFromMetadata(
        supabase as never, 
        orderData.metadata.appointment, 
        insertedOrder, 
        userId
      )
    }
    
    // Invalidate cache using new Redis system
    if (userId) {
      await queueCacheInvalidation('purchase_history', userId, userId)
      await queueCacheInvalidation('analytics', userId, userId)
      
      // Log audit event
      await supabase
        .from('patient_audit_logs')
        .insert({
          user_id: userId,
          action: 'order_created_via_webhook',
          resource: 'orders',
          resource_id: orderData.id,
          metadata: {
            order_total: orderRecord.total_amount,
            webhook_type: 'swell_order_created',
            processed_at: new Date().toISOString()
          }
        })
    }
    
    console.log('Order created successfully:', orderData.id)
    return true
  } catch (error) {
    console.error('Error processing order creation:', error)
    return false
  }
}

// Handle order updates with enhanced status tracking
async function handleOrderUpdated(orderData: OrderWebhookData) {
  const supabase = await createClient()
  
  try {
    console.log('Processing order update:', orderData.id, orderData.status)
    
    // Find existing order
    const { data: existingOrder, error: findError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderData.id)
      .maybeSingle()
    
    if (findError || !existingOrder) {
      console.log('Order not found, creating new:', orderData.id)
      return await handleOrderCreated(orderData)
    }
    
    // Update order with new data
    const updateData = {
      status: orderData.status || 'pending',
      total_amount: orderData.grand_total || orderData.total || existingOrder.total_amount,
      swell_order_data: orderData,
      metadata: {
        ...existingOrder.metadata,
        webhook_updated_at: new Date().toISOString(),
        payment_status: orderData.payment_status,
        status_history: [
          ...(existingOrder.metadata?.status_history || []),
          {
            status: orderData.status,
            timestamp: new Date().toISOString(),
            updated_via: 'webhook'
          }
        ]
      },
      updated_at: new Date().toISOString()
    }
    
    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderData.id)
    
    if (updateError) {
      console.error('Error updating order:', updateError)
      return false
    }
    
    // Update order items if provided
    if (orderData.items && orderData.items.length > 0) {
      // Delete existing items
      await supabase
        .from('order_tests')
        .delete()
        .eq('order_id', orderData.id)
      
      // Insert updated items
      const orderItems = orderData.items.map(item => ({
        order_id: orderData.id,
        test_id: item.product_id,
        test_name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        variant_id: item.variant_id
      }))
      
      await supabase
        .from('order_tests')
        .insert(orderItems)
    }
    
    // Handle status-specific actions
    if (orderData.status === 'complete' || orderData.status === 'delivered') {
      // Update related appointments
      await supabase
        .from('appointments')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderData.id)
    }
    
    // Invalidate cache and log
    if (existingOrder.user_id) {
      await queueCacheInvalidation('purchase_history', existingOrder.user_id, existingOrder.user_id)
      await queueCacheInvalidation('analytics', existingOrder.user_id, existingOrder.user_id)
      
      await supabase
        .from('patient_audit_logs')
        .insert({
          user_id: existingOrder.user_id,
          action: 'order_updated_via_webhook',
          resource: 'orders',
          resource_id: orderData.id,
          metadata: {
            status_change: {
              from: existingOrder.status,
              to: orderData.status
            },
            webhook_type: 'swell_order_updated',
            processed_at: new Date().toISOString()
          }
        })
    }
    
    console.log('Order updated successfully:', orderData.id)
    return true
  } catch (error) {
    console.error('Error processing order update:', error)
    return false
  }
}

// Handle payment status updates
async function handleOrderPaid(orderData: OrderWebhookData) {
  const supabase = await createClient()
  
  try {
    console.log('Processing payment confirmation:', orderData.id)
    
    const { data: order, error: findError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderData.id)
      .single()
    
    if (findError || !order) {
      console.log('Order not found for payment:', orderData.id)
      return await handleOrderCreated(orderData)
    }
    
    // Update payment status
    await supabase
      .from('orders')
      .update({
        status: 'processing',
        metadata: {
          ...order.metadata,
          payment_confirmed_at: new Date().toISOString(),
          payment_status: 'paid'
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', orderData.id)
    
    // Confirm appointments
    await supabase
      .from('appointments')
      .update({ 
        status: 'confirmed',
        confirmation_sent: true,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', orderData.id)
    
    // Log payment confirmation
    if (order.user_id) {
      await supabase
        .from('patient_audit_logs')
        .insert({
          user_id: order.user_id,
          action: 'payment_confirmed_via_webhook',
          resource: 'orders',
          resource_id: orderData.id,
          metadata: {
            payment_amount: orderData.grand_total || orderData.total,
            webhook_type: 'swell_order_paid',
            processed_at: new Date().toISOString()
          }
        })
      
      await queueCacheInvalidation('purchase_history', order.user_id, order.user_id)
    }
    
    console.log('Payment processed successfully:', orderData.id)
    return true
  } catch (error) {
    console.error('Error processing payment:', error)
    return false
  }
}

// Process appointment data from order metadata
async function processAppointmentFromMetadata(
  supabase: { from: (table: string) => { insert: (data: unknown) => { select: () => { single: () => Promise<{ data: unknown; error: unknown }> } } } },
  appointmentData: { selectedDate?: string; selectedTime?: string; locationId?: string; locationName?: string; staffName?: string },
  orderRecord: { id: string; total_amount?: number },
  userId: string
) {
  try {
    if (!appointmentData.selectedDate || !appointmentData.selectedTime) {
      console.log('Incomplete appointment data in metadata')
      return
    }
    
    // Create appointment record
    const appointmentRecord = {
      user_id: userId,
      order_id: orderRecord.id,
      appointment_date: appointmentData.selectedDate,
      appointment_time: appointmentData.selectedTime,
      location_id: appointmentData.locationId || null,
      status: 'scheduled',
      appointment_type: 'blood_draw',
      metadata: {
        location_name: appointmentData.locationName,
        staff_name: appointmentData.staffName,
        created_via: 'webhook',
        order_total: orderRecord.total_amount
      }
    }
    
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert([appointmentRecord])
      .select()
      .single()
    
    if (appointmentError) {
      console.error('Error creating appointment:', appointmentError)
      return
    }
    
    console.log('Appointment created from webhook:', (appointment as { id: string }).id)
    
    // Log appointment creation
    await supabase
      .from('patient_audit_logs')
      .insert({
        user_id: userId,
        action: 'appointment_created_via_webhook',
        resource: 'appointments',
        resource_id: (appointment as { id: string }).id,
        metadata: {
          appointment_date: appointmentData.selectedDate,
          location_name: appointmentData.locationName,
          created_from_order: orderRecord.id
        }
      })
  } catch (error) {
    console.error('Error processing appointment:', error)
  }
}

// Enhanced cache invalidation with order-specific targeting
// Removed unused function invalidateOrderRelatedCache

// POST /api/webhooks/swell - Enhanced webhook handler
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-swell-signature') || request.headers.get('swell-signature')
    const webhookSecret = process.env.SWELL_WEBHOOK_SECRET
    
    // Verify webhook signature in production
    if (process.env.NODE_ENV === 'production' && webhookSecret) {
      if (!signature || !verifyWebhookSignature(rawBody, signature, webhookSecret)) {
        console.error('Invalid webhook signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }
    
    let event: SwellWebhookEvent
    try {
      event = JSON.parse(rawBody)
    } catch (error) {
      console.error('Invalid webhook payload:', error)
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    
    console.log('Received Swell webhook:', event.type, event.data.id)
    
    let success = false
    
    // Route webhook to appropriate handler
    switch (event.type) {
      case 'order.created':
        success = await handleOrderCreated(event.data as unknown as OrderWebhookData)
        break
        
      case 'order.updated':
      case 'order.status_changed':
        success = await handleOrderUpdated(event.data as unknown as OrderWebhookData)
        break
        
      case 'order.paid':
      case 'payment.success':
        success = await handleOrderPaid(event.data as unknown as OrderWebhookData)
        break
        
      case 'customer.created':
      case 'customer.updated':
        // Handle customer updates - link to existing profiles
        console.log('Customer webhook received:', event.data.id)
        success = true
        break
        
      default:
        console.log('Unhandled webhook type:', event.type)
        return NextResponse.json({ 
          success: true, 
          message: 'Webhook received but not processed' 
        })
    }
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Webhook processed successfully',
        event_type: event.type,
        event_id: event.data.id
      })
    } else {
      return NextResponse.json(
        { 
          error: 'Failed to process webhook',
          event_type: event.type,
          event_id: event.data.id
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/webhooks/swell - Webhook verification endpoint
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const challenge = searchParams.get('challenge')
  
  if (challenge) {
    return NextResponse.json({ challenge })
  }
  
  return NextResponse.json({ 
    status: 'Swell webhook endpoint active',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  })
}