import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
// import { headers } from 'next/headers';

// Webhook handler for Swell events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // const headersList = await headers();
    
    // Verify webhook signature (implement based on Swell's webhook security)
    // const signature = headersList.get('swell-signature');
    
    // TODO: Implement signature verification for security
    // const isValid = verifyWebhookSignature(body, signature);
    // if (!isValid) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    const { type, data } = body;

    switch (type) {
      case 'order.created':
        await handleOrderCreated(data);
        break;
      case 'order.updated':
        await handleOrderUpdated(data);
        break;
      case 'order.paid':
        await handleOrderPaid(data);
        break;
      case 'subscription.created':
        await handleSubscriptionCreated(data);
        break;
      case 'subscription.updated':
        await handleSubscriptionUpdated(data);
        break;
      default:
        console.log(`Unhandled webhook type: ${type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Handle new order creation
async function handleOrderCreated(order: Record<string, unknown>) {
  try {
    console.log('New order created:', order.id);
    
    const supabase = getAdminClient();
    
    // Extract customer information
    const billing = order.billing as Record<string, unknown> || {};
    const account = order.account as Record<string, unknown> || {};
    const items = order.items as Record<string, unknown>[] || [];
    
    // Prepare order data for Supabase
    const orderData = {
      swell_order_id: String(order.id),
      user_id: String(account.id || 'guest'),
      customer_email: String(account.email || billing.email || ''),
      customer_name: `${billing.first_name || ''} ${billing.last_name || ''}`.trim(),
      total: Number(order.grand_total || order.sub_total || 0),
      currency: String(order.currency || 'USD'),
      status: String(order.status || 'pending'),
      payment_status: String(order.payment_status || 'pending'),
      items: items.map(item => ({
        product_id: String(item.product_id || ''),
        product_name: String((item.product as Record<string, unknown>)?.name || ''),
        quantity: Number(item.quantity || 1),
        price: Number(item.price || 0),
        variant_id: String(item.variant_id || '')
      })),
      billing_address: billing,
      shipping_address: order.shipping as Record<string, unknown> || null,
    };
    
    // Insert order into Supabase
    const { data: orderResult, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();
    
    if (orderError) {
      console.error('Error saving order to Supabase:', orderError);
      throw orderError;
    }
    
    console.log('Order saved to Supabase:', orderResult.id);
    
    // Create user profile if it doesn't exist (for guest orders)
    if (orderData.customer_email && orderData.user_id === 'guest') {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([{
          user_id: orderData.user_id,
          email: orderData.customer_email,
          first_name: String(billing.first_name || ''),
          last_name: String(billing.last_name || ''),
          phone: String(billing.phone || ''),
          address_line_1: String(billing.address1 || ''),
          address_line_2: String(billing.address2 || ''),
          city: String(billing.city || ''),
          state: String(billing.state || ''),
          zip_code: String(billing.zip || ''),
          country: String(billing.country || 'US'),
        }], {
          onConflict: 'user_id'
        });
      
      if (profileError) {
        console.error('Error creating/updating profile:', profileError);
      }
    }
    
    // TODO: Trigger appointment scheduling workflow
    // TODO: Send confirmation email
    // TODO: Create notification
    
  } catch (error) {
    console.error('Error handling order creation:', error);
    throw error;
  }
}

// Handle order updates
async function handleOrderUpdated(order: Record<string, unknown>) {
  try {
    console.log('Order updated:', order.id);
    
    const supabase = getAdminClient();
    
    // Update order in Supabase
    const updateData = {
      status: String(order.status || 'pending'),
      payment_status: String(order.payment_status || 'pending'),
      total: Number(order.grand_total || order.sub_total || 0),
      updated_at: new Date().toISOString(),
    };
    
    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('swell_order_id', String(order.id))
      .select()
      .single();
    
    if (error) {
      console.error('Error updating order in Supabase:', error);
      throw error;
    }
    
    console.log('Order updated in Supabase:', data.id);
    
    // Handle appointment scheduling based on status changes
    if (order.status === 'complete' || order.status === 'delivered') {
      // TODO: Update appointment status if needed
      // TODO: Trigger test results workflow
    }
    
  } catch (error) {
    console.error('Error handling order update:', error);
    throw error;
  }
}

// Handle order payment
async function handleOrderPaid(order: Record<string, unknown>) {
  try {
    console.log('Order paid:', order.id);
    
    const supabase = getAdminClient();
    
    // Update payment status in Supabase
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'processing',
        updated_at: new Date().toISOString(),
      })
      .eq('swell_order_id', String(order.id))
      .select()
      .single();
    
    if (orderError) {
      console.error('Error updating payment status:', orderError);
      throw orderError;
    }
    
    console.log('Payment confirmed for order:', orderData.id);
    
    // TODO: Trigger appointment scheduling workflow
    // For now, we'll create a basic appointment record that can be scheduled later
    /*
    const appointmentData = {
      user_id: orderData.user_id,
      order_id: orderData.id,
      location_id: 'default', // You'll need to set up locations
      status: 'pending_schedule',
    };
    
    const { error: appointmentError } = await supabase
      .from('appointments')
      .insert([appointmentData]);
    
    if (appointmentError) {
      console.error('Error creating appointment record:', appointmentError);
    }
    */
    
    // TODO: Send payment confirmation email
    // TODO: Generate test requisition forms
    // TODO: Create notification for user
    
  } catch (error) {
    console.error('Error handling order payment:', error);
    throw error;
  }
}

// Handle subscription creation
async function handleSubscriptionCreated(subscription: Record<string, unknown>) {
  try {
    console.log('Subscription created:', subscription.id);
    
    // TODO: Handle recurring diagnostic testing subscriptions
    // 1. Set up recurring appointment scheduling
    // 2. Create customer health monitoring profile
    // 3. Configure automated reminders
    
  } catch (error) {
    console.error('Error handling subscription creation:', error);
    throw error;
  }
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription: Record<string, unknown>) {
  try {
    console.log('Subscription updated:', subscription.id);
    
    // TODO: Handle subscription changes
    // 1. Update recurring schedules
    // 2. Handle pause/resume/cancel events
    // 3. Adjust customer notifications
    
  } catch (error) {
    console.error('Error handling subscription update:', error);
    throw error;
  }
}

// Helper function to verify webhook signatures (implement based on Swell's documentation)
// function verifyWebhookSignature(body: Record<string, unknown>, signature: string | null): boolean {
//   // TODO: Implement signature verification
//   // This is crucial for security in production
//   return true; // Temporary - always return true for development
// }