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
        timeSlot?: { start: string };
        locationName?: string;
        staffName?: string;
      } | undefined;
      
      const billingPaymentData = allData.billingPayment as {
        billing?: Record<string, unknown>;
        payment?: Record<string, unknown>;
      } | undefined;
      
      const checkoutPayload = {
        billing: billingPaymentData?.billing,
        payment: billingPaymentData?.payment,
        account: user ? {
          id: user.id,
          email: user.email
        } : undefined,
        metadata: {
          appointment: appointmentData ? {
            scheduled_date: appointmentData.timeSlot?.start,
            location_name: appointmentData.locationName,
            staff_name: appointmentData.staffName,
            appointment_type: 'blood_draw'
          } : undefined,
          userId: user?.id
        }
      };

      // Process checkout through Swell
      const order = await swellHelpers.checkout(checkoutPayload as Record<string, unknown>);

      // Clear cart and redirect to success
      clearCart();
      router.push(`/checkout/success?order=${order.id}`);

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
      <div className="max-w-7xl mx-auto px-6 pb-20">
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