'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { swellHelpers } from '@/lib/swell';
import { useRouter } from 'next/navigation';
import StreamlinedCheckout from '@/components/ui/StreamlinedCheckout';

export default function CheckoutPage() {
  const [, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  // Redirect if cart is empty
  useEffect(() => {
    if (!cart || cart.items?.length === 0) {
      router.push('/products');
    }
  }, [cart, router]);

  // Simplified checkout handling for streamlined flow

  const handleCheckoutComplete = async (allData: Record<string, unknown>) => {
    setIsLoading(true);
    setError(null);

    try {
      // Prepare checkout data for streamlined flow
      const appointmentData = allData.appointment as {
        selectedDate?: string;
        selectedTime?: string;
        locationName?: string;
        staffName?: string;
        locationId?: string;
      } | undefined;
      
      const billingPaymentData = allData.billingPayment as {
        billing?: Record<string, unknown>;
        payment?: Record<string, unknown>;
      } | undefined;
      
      // Map billing data to Swell's expected format
      const swellBillingData = billingPaymentData?.billing ? {
        first_name: billingPaymentData.billing.firstName,
        last_name: billingPaymentData.billing.lastName,
        email: billingPaymentData.billing.email,
        phone: billingPaymentData.billing.phone,
        address1: billingPaymentData.billing.address1,
        address2: billingPaymentData.billing.address2 || '',
        city: billingPaymentData.billing.city,
        state: billingPaymentData.billing.state,
        zip: billingPaymentData.billing.zip,
        country: billingPaymentData.billing.country || 'US'
      } : undefined;

      // Map payment data to Swell's expected format
      const swellPaymentData = billingPaymentData?.payment ? {
        card: {
          number: (billingPaymentData.payment.cardNumber as string)?.replace(/\s/g, ''),
          exp_month: billingPaymentData.payment.expiryMonth as string,
          exp_year: billingPaymentData.payment.expiryYear as string,
          cvc: billingPaymentData.payment.cvv as string
        },
        method: 'card'
      } : undefined;

      const checkoutPayload = {
        billing: swellBillingData,
        payment: swellPaymentData,
        account: user ? {
          id: user.id,
          email: user.email
        } : undefined,
        metadata: {
          appointment: appointmentData ? {
            scheduled_date: appointmentData.selectedDate,
            scheduled_time: appointmentData.selectedTime,
            location_name: appointmentData.locationName,
            staff_name: appointmentData.staffName,
            location_id: appointmentData.locationId,
            appointment_type: 'blood_draw'
          } : undefined,
          userId: user?.id
        }
      };

      // Process checkout through Swell
      const swellOrder = await swellHelpers.checkout(checkoutPayload as Record<string, unknown>);

      // Prepare data for Supabase logging
      const supabaseOrderData = {
        swellOrderId: swellOrder.id,
        billing: billingPaymentData?.billing,
        appointment: appointmentData,
        cartTotal: cart?.total || 0,
        discount: swellOrder.discount_total || 0,
        couponCode: (swellOrder as Record<string, unknown>).coupon ? 
          ((swellOrder as Record<string, unknown>).coupon as Record<string, unknown>).code as string || null : null,
        tests: cart?.items?.map(item => ({
          productId: item.productId || item.product_id,
          name: item.product?.name || 'Diagnostic Test',
          quantity: item.quantity,
          price: item.price
        })) || []
      };

      // Log order to Supabase
      try {
        const supabaseResponse = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(supabaseOrderData)
        });

        if (!supabaseResponse.ok) {
          console.error('Failed to log order to Supabase:', await supabaseResponse.text());
          // Don't fail the checkout, but log the error
        }
      } catch (supabaseError) {
        console.error('Supabase logging error:', supabaseError);
        // Don't fail the checkout, but log the error
      }

      // Clear cart and redirect to success
      clearCart();
      router.push(`/checkout/success?order=${swellOrder.id}`);

    } catch (error) {
      console.error('Checkout error:', error);
      setError('Checkout failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!cart || cart.items?.length === 0) {
    return null; // Will redirect in useEffect
  }

  // Streamlined checkout replaces the multi-step form

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 pb-20 pt-32">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent mb-4">
            Complete Your Order
          </h1>
          <p className="text-xl text-slate-300">
            Book your appointment and secure your diagnostic testing
          </p>
        </div>

        <StreamlinedCheckout
          cart={cart}
          user={user}
          onComplete={handleCheckoutComplete}
        />

        {/* Error Display */}
        {error && (
          <div className="mt-8 p-4 bg-rose-900/20 border border-rose-700/50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-rose-400 rounded-full animate-pulse"></div>
              <span className="text-rose-300 text-sm">{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}