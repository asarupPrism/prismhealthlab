'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { swellHelpers } from '@/lib/swell';
import { useRouter } from 'next/navigation';
import MultiStepForm, { Step } from '@/components/ui/MultiStepForm';
import AppointmentScheduler, { AppointmentData } from '@/components/ui/AppointmentScheduler';
import AuthForm from '@/components/auth/AuthForm';
import BillingForm from '@/components/checkout/BillingForm';
import PaymentForm from '@/components/checkout/PaymentForm';
import OrderReview from '@/components/checkout/OrderReview';
import { CheckoutData, User, Cart } from '@/types/shared';

export default function CheckoutPage() {
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({});
  const [, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { cart, clearCart, updateCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  // Redirect if cart is empty
  useEffect(() => {
    if (!cart || cart.items?.length === 0) {
      router.push('/products');
    }
  }, [cart, router]);

  // Update step validation based on data
  const getStepValidation = (stepId: string): boolean => {
    switch (stepId) {
      case 'appointment':
        return Boolean(checkoutData.appointment);
      case 'auth':
        return user !== null || Boolean(checkoutData.authentication?.isAuthenticated);
      case 'billing':
        return Boolean(checkoutData.billing);
      case 'payment':
        return Boolean(checkoutData.payment);
      default:
        return false;
    }
  };

  const handleStepData = (stepId: string, data: unknown) => {
    const newData = { ...checkoutData, [stepId]: data };
    setCheckoutData(newData);

    // Update cart metadata with appointment and user data
    if (stepId === 'appointment' && data) {
      const appointmentData = data as AppointmentData;
      updateCart({
        metadata: {
          ...cart?.metadata,
          appointment: {
            staffId: appointmentData.staffId,
            staffName: appointmentData.staffName,
            locationId: appointmentData.locationId,
            locationName: appointmentData.locationName,
            start: appointmentData.timeSlot.start.toISOString(),
            end: appointmentData.timeSlot.end.toISOString(),
          }
        }
      });
    }

    if (stepId === 'auth' && data && typeof data === 'object' && 'user' in data && data.user && typeof data.user === 'object' && 'id' in data.user) {
      updateCart({
        metadata: {
          ...cart?.metadata,
          userId: (data.user as User).id
        }
      });
    }
  };

  const handleCheckoutComplete = async (allData: CheckoutData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Prepare checkout data with all collected information
      const checkoutPayload = {
        billing: allData.billing,
        account: allData.authentication?.user ? {
          id: allData.authentication.user.id,
          email: allData.authentication.user.email
        } : undefined,
        metadata: {
          appointment: allData.appointment ? {
            scheduled_date: new Date(allData.appointment.selectedDate.getTime() + 
              parseInt(allData.appointment.selectedTime.split(':')[0]) * 60 * 60 * 1000 +
              parseInt(allData.appointment.selectedTime.split(':')[1]) * 60 * 1000
            ).toISOString(),
            location_name: allData.appointment.locationName,
            location_address: allData.appointment.locationAddress,
            staff_name: allData.appointment.staffName,
            appointment_type: 'blood_draw'
          } : undefined,
          userId: allData.authentication?.user?.id
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

  // Define the checkout steps
  const steps: Step[] = [
    {
      id: 'appointment',
      title: 'Schedule Your Visit',
      description: 'Choose your preferred appointment date and time',
      component: <AppointmentScheduler onData={(data) => handleStepData('appointment', data)} />,
      isValid: getStepValidation('appointment'),
      isRequired: true
    },
    {
      id: 'auth',
      title: 'Create Your Account',
      description: 'Sign in or create a new patient account',
      component: (
        <div className="max-w-2xl mx-auto">
          {user ? (
            // User is already logged in
            <div className="backdrop-blur-sm bg-emerald-900/20 border border-emerald-700/50 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                <h3 className="text-lg font-semibold text-white">Welcome back!</h3>
              </div>
              <p className="text-slate-300 mb-4">
                You&apos;re signed in as <span className="text-emerald-300">{user.email}</span>
              </p>
              <div className="text-sm text-slate-400">
                Your appointment and results will be linked to this account.
              </div>
            </div>
          ) : (
            <AuthForm
              initialMode="signup"
              onData={(data) => handleStepData('auth', data)}
            />
          )
        }
        </div>
      ),
      isValid: getStepValidation('auth'),
      isRequired: true
    },
    {
      id: 'billing',
      title: 'Billing Information',
      description: 'Enter your billing and contact details',
      component: <BillingForm onData={(data) => handleStepData('billing', data)} />,
      isValid: getStepValidation('billing'),
      isRequired: true
    },
    {
      id: 'payment',
      title: 'Payment Method',
      description: 'Securely enter your payment information',
      component: <PaymentForm onData={(data) => handleStepData('payment', data)} />,
      isValid: getStepValidation('payment'),
      isRequired: true
    },
    {
      id: 'review',
      title: 'Review & Complete',
      description: 'Review your order and complete your purchase',
      component: (
        <OrderReview 
          checkoutData={checkoutData}
          cart={cart as unknown as Cart}
          onData={(data) => handleStepData('review', data)}
        />
      ),
      isValid: true,
      isRequired: false
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 pt-8">
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

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Checkout Form */}
          <div className="xl:col-span-3">
            <MultiStepForm
              steps={steps}
              onComplete={handleCheckoutComplete}
              onStepChange={(currentStep, stepData) => {
                console.log('Step changed:', currentStep, stepData);
              }}
              showProgressBar={true}
              showStepNumbers={false}
            />
          </div>

          {/* Order Summary Sidebar */}
          <div className="xl:col-span-1">
            <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl shadow-slate-900/50 sticky top-8">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                Order Summary
              </h3>

              <div className="space-y-4 mb-6">
                {cart.items?.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <div className="w-6 h-6 bg-cyan-300/50 rounded-lg flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white leading-tight mb-1">
                        {item.product?.name || 'Diagnostic Panel'}
                      </p>
                      <p className="text-xs text-slate-400 mb-2">
                        Qty: {item.quantity} × {swellHelpers.formatPrice(item.price || 0)}
                      </p>
                      {item.product?.description && typeof item.product.description === 'string' ? (
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {item.product.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-700/50 pt-4 space-y-3">
                <div className="flex justify-between text-slate-300 text-sm">
                  <span>Subtotal:</span>
                  <span>{swellHelpers.formatPrice(cart.total || 0)}</span>
                </div>
                <div className="flex justify-between text-slate-300 text-sm">
                  <span>Lab Processing:</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between text-slate-300 text-sm">
                  <span>Appointment Booking:</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-white border-t border-slate-700/50 pt-3">
                  <span>Total:</span>
                  <span className="text-cyan-400">{swellHelpers.formatPrice(cart.total || 0)}</span>
                </div>
              </div>

              {/* Appointment Summary */}
              {checkoutData.appointment && (
                <div className="mt-6 pt-6 border-t border-slate-700/30">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    Your Appointment
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-300">
                      <span>Date:</span>
                      <span className="text-white">
                        {checkoutData.appointment.selectedDate.toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Time:</span>
                      <span className="text-white">
                        {checkoutData.appointment.selectedTime}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Location:</span>
                      <span className="text-white text-right">{checkoutData.appointment.locationName}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Security badges */}
              <div className="mt-6 pt-6 border-t border-slate-700/50">
                <div className="grid grid-cols-1 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="w-3 h-3 bg-emerald-400/20 border border-emerald-400/30 rounded flex items-center justify-center">
                      <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                    </div>
                    <span>256-bit SSL Encryption</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="w-3 h-3 bg-cyan-400/20 border border-cyan-400/30 rounded flex items-center justify-center">
                      <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                    </div>
                    <span>HIPAA Compliant Platform</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="w-3 h-3 bg-blue-400/20 border border-blue-400/30 rounded flex items-center justify-center">
                      <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                    </div>
                    <span>PCI DSS Certified</span>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mt-6 p-4 bg-rose-900/20 border border-rose-700/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                    <span className="text-rose-300 text-sm">{error}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}