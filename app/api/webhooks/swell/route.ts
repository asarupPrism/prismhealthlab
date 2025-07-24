import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { sendAppointmentConfirmation } from '@/lib/email';
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
    const metadata = order.metadata as Record<string, unknown> || {};
    
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
      metadata: metadata,
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

    // Process appointment data from metadata
    await processAppointmentFromMetadata(supabase, metadata, orderResult, orderData.user_id);
    
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
    
    // Process appointment from order metadata when payment is confirmed
    if (order.metadata) {
      await processAppointmentFromMetadata(
        supabase, 
        order.metadata as Record<string, unknown>, 
        orderData, 
        orderData.user_id
      );
    }
    
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

// Helper function to process appointment data from cart metadata
async function processAppointmentFromMetadata(
  supabase: ReturnType<typeof getAdminClient>,
  metadata: Record<string, unknown>,
  orderData: Record<string, unknown>,
  userId: string
) {
  try {
    // Check if appointment data exists in metadata
    const appointmentData = metadata.appointment as Record<string, unknown>;
    if (!appointmentData) {
      console.log('No appointment data found in order metadata');
      return;
    }

    console.log('Processing appointment from metadata:', appointmentData);

    // Extract appointment details
    const {
      scheduled_date,
      location_name,
      location_address,
      staff_name,
      appointment_type = 'blood_draw'
    } = appointmentData;

    if (!scheduled_date) {
      console.error('No scheduled_date in appointment metadata');
      return;
    }

    // Find or create location
    let locationId: string;
    
    if (location_name) {
      // Try to find existing location by name
      const { data: existingLocation } = await supabase
        .from('locations')
        .select('id')
        .eq('name', String(location_name))
        .single();

      if (existingLocation) {
        locationId = existingLocation.id;
      } else {
        // Create new location if it doesn't exist
        const { data: newLocation, error: locationCreateError } = await supabase
          .from('locations')
          .insert([{
            name: String(location_name),
            address: String(location_address || ''),
            phone: '(555) 123-4567', // Default phone
            hours: {
              monday: { start: '09:00', end: '17:00', closed: false },
              tuesday: { start: '09:00', end: '17:00', closed: false },
              wednesday: { start: '09:00', end: '17:00', closed: false },
              thursday: { start: '09:00', end: '17:00', closed: false },
              friday: { start: '09:00', end: '17:00', closed: false },
              saturday: { start: '09:00', end: '15:00', closed: false },
              sunday: { start: '10:00', end: '14:00', closed: true }
            },
            active: true
          }])
          .select('id')
          .single();

        if (locationCreateError) {
          console.error('Error creating location:', locationCreateError);
          locationId = 'default'; // Fallback to default location
        } else {
          locationId = newLocation.id;
          console.log('Created new location:', locationId);
        }
      }
    } else {
      locationId = 'default'; // Fallback to default location
    }

    // Create appointment record
    const appointmentRecord = {
      user_id: userId,
      order_id: orderData.id,
      location_id: locationId,
      scheduled_date: new Date(String(scheduled_date)).toISOString(),
      appointment_type: String(appointment_type),
      status: 'confirmed',
      staff_name: staff_name ? String(staff_name) : null,
      notes: `Appointment scheduled via checkout for order #${orderData.swell_order_id}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert([appointmentRecord])
      .select(`
        *,
        locations(name, address),
        orders(swell_order_id, total)
      `)
      .single();

    if (appointmentError) {
      console.error('Error creating appointment:', appointmentError);
      throw appointmentError;
    }

    console.log('Appointment created successfully:', {
      appointment_id: appointment.id,
      scheduled_date: appointment.scheduled_date,
      location: appointment.locations?.name,
      order_id: appointment.order_id
    });

    // Send appointment confirmation email
    await sendAppointmentConfirmationEmail(appointment, orderData);
    
    // TODO: Add to calendar integrations
    // TODO: Set up reminder notifications

  } catch (error) {
    console.error('Error processing appointment from metadata:', error);
    // Don't throw here to avoid failing the entire webhook
    // The order should still be processed even if appointment creation fails
  }
}

// Helper function to send appointment confirmation email
async function sendAppointmentConfirmationEmail(
  appointment: Record<string, unknown>,
  orderData: Record<string, unknown>
) {
  try {
    // Extract customer information
    const customerEmail = String(orderData.customer_email || '');
    const customerName = String(orderData.customer_name || 'Valued Customer');
    
    if (!customerEmail) {
      console.warn('No customer email available for appointment confirmation');
      return;
    }

    // Prepare appointment date/time
    const appointmentDate = new Date(String(appointment.scheduled_date));
    
    // Extract test names from order items
    const orderItems = orderData.items as Array<Record<string, unknown>> || [];
    const testNames = orderItems.map(item => String(item.product_name || 'Diagnostic Test'));
    
    // Prepare email data
    const emailData = {
      customerName,
      customerEmail,
      appointmentDate: appointmentDate.toISOString().split('T')[0],
      appointmentTime: appointmentDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      locationName: (appointment.locations as Record<string, unknown>)?.name as string || 'Prism Health Lab',
      locationAddress: (appointment.locations as Record<string, unknown>)?.address as string || 'Downtown Medical Center',
      orderNumber: String(orderData.swell_order_id || orderData.id || 'N/A'),
      testNames
    };

    // Send the confirmation email
    const emailSent = await sendAppointmentConfirmation(emailData);
    
    if (emailSent) {
      console.log('Appointment confirmation email sent successfully to:', customerEmail);
    } else {
      console.error('Failed to send appointment confirmation email to:', customerEmail);
    }

  } catch (error) {
    console.error('Error sending appointment confirmation email:', error);
    // Don't throw error to avoid failing the webhook
  }
}

// Helper function to verify webhook signatures (implement based on Swell's documentation)
// function verifyWebhookSignature(body: Record<string, unknown>, signature: string | null): boolean {
//   // TODO: Implement signature verification
//   // This is crucial for security in production
//   return true; // Temporary - always return true for development
// }