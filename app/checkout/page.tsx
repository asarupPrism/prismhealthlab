'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { swellHelpers, swellAuth } from '@/lib/swell';
import { useRouter } from 'next/navigation';

interface BillingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  [key: string]: string;
}

interface PaymentInfo {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  nameOnCard: string;
}

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  
  const [step, setStep] = useState(1); // 1: Billing, 2: Payment, 3: Review
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US'
  });

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    nameOnCard: ''
  });

  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState('');

  // Redirect if cart is empty
  useEffect(() => {
    if (!cart || cart.items?.length === 0) {
      router.push('/products');
    }
  }, [cart, router]);

  const handleBillingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate billing info
    const required = ['firstName', 'lastName', 'email', 'address1', 'city', 'state', 'zip'];
    const missing = required.filter(field => !billingInfo[field as keyof BillingInfo]);
    
    if (missing.length > 0) {
      setError(`Please fill in: ${missing.join(', ')}`);
      return;
    }

    if (!billingInfo.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setStep(2);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate payment info
    if (!paymentInfo.cardNumber || !paymentInfo.expiryMonth || !paymentInfo.expiryYear || !paymentInfo.cvv) {
      setError('Please fill in all payment details');
      return;
    }

    if (!agreeToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setStep(3);
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Create account if requested
      if (createAccount && password) {
        await swellAuth.createAccount({
          firstName: billingInfo.firstName,
          lastName: billingInfo.lastName,
          email: billingInfo.email,
          password: password
        });
      }

      // Process checkout
      const order = await swellHelpers.checkout({
        billing: billingInfo,
        account: createAccount ? {
          email: billingInfo.email,
          password: password
        } : undefined
      });

      // Clear cart and redirect to success
      clearCart();
      router.push(`/checkout/success?order=${order.id}`);

    } catch (error) {
      console.error('Checkout error:', error);
      setError('Payment failed. Please check your details and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!cart || cart.items?.length === 0) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-8">
      <div className="max-w-4xl mx-auto px-6 pb-20">
        {/* Header */}
        <div className="border-l-2 border-cyan-500/30 pl-6 mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Secure Checkout</h1>
          <p className="text-slate-300">Complete your diagnostic panel order</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((stepNum) => (
            <React.Fragment key={stepNum}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                step >= stepNum 
                  ? 'bg-cyan-500 border-cyan-500 text-white' 
                  : 'border-slate-600 text-slate-400'
              }`}>
                {stepNum}
              </div>
              {stepNum < 3 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  step > stepNum ? 'bg-cyan-500' : 'bg-slate-600'
                }`}></div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl shadow-slate-900/50">
              
              {/* Step 1: Billing Information */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    Billing Information
                  </h2>

                  <form onSubmit={handleBillingSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">First Name *</label>
                        <input
                          type="text"
                          value={billingInfo.firstName}
                          onChange={(e) => setBillingInfo(prev => ({ ...prev, firstName: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Last Name *</label>
                        <input
                          type="text"
                          value={billingInfo.lastName}
                          onChange={(e) => setBillingInfo(prev => ({ ...prev, lastName: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Email Address *</label>
                      <input
                        type="email"
                        value={billingInfo.email}
                        onChange={(e) => setBillingInfo(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={billingInfo.phone}
                        onChange={(e) => setBillingInfo(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Address *</label>
                      <input
                        type="text"
                        placeholder="Street address"
                        value={billingInfo.address1}
                        onChange={(e) => setBillingInfo(prev => ({ ...prev, address1: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 mb-2"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Apartment, suite, etc. (optional)"
                        value={billingInfo.address2}
                        onChange={(e) => setBillingInfo(prev => ({ ...prev, address2: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">City *</label>
                        <input
                          type="text"
                          value={billingInfo.city}
                          onChange={(e) => setBillingInfo(prev => ({ ...prev, city: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">State *</label>
                        <input
                          type="text"
                          value={billingInfo.state}
                          onChange={(e) => setBillingInfo(prev => ({ ...prev, state: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">ZIP Code *</label>
                        <input
                          type="text"
                          value={billingInfo.zip}
                          onChange={(e) => setBillingInfo(prev => ({ ...prev, zip: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300"
                          required
                        />
                      </div>
                    </div>

                    {/* Account Creation Option */}
                    <div className="border-t border-slate-700/50 pt-6 mt-6">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={createAccount}
                          onChange={(e) => setCreateAccount(e.target.checked)}
                          className="w-4 h-4 text-cyan-600 bg-slate-900 border-slate-600 rounded focus:ring-cyan-500"
                        />
                        <span className="text-slate-300">Create an account to track your orders and results</span>
                      </label>
                      
                      {createAccount && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4"
                        >
                          <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300"
                            placeholder="Choose a strong password"
                            required={createAccount}
                          />
                        </motion.div>
                      )}
                    </div>

                    {error && (
                      <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                        <p className="text-rose-400 text-sm">{error}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25"
                    >
                      Continue to Payment
                    </button>
                  </form>
                </motion.div>
              )}

              {/* Step 2: Payment Information */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    Payment Information
                  </h2>

                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Card Number *</label>
                      <input
                        type="text"
                        value={paymentInfo.cardNumber}
                        onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardNumber: e.target.value }))}
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Name on Card *</label>
                      <input
                        type="text"
                        value={paymentInfo.nameOnCard}
                        onChange={(e) => setPaymentInfo(prev => ({ ...prev, nameOnCard: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Month *</label>
                        <select
                          value={paymentInfo.expiryMonth}
                          onChange={(e) => setPaymentInfo(prev => ({ ...prev, expiryMonth: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300"
                          required
                        >
                          <option value="">MM</option>
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                              {String(i + 1).padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Year *</label>
                        <select
                          value={paymentInfo.expiryYear}
                          onChange={(e) => setPaymentInfo(prev => ({ ...prev, expiryYear: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300"
                          required
                        >
                          <option value="">YYYY</option>
                          {Array.from({ length: 10 }, (_, i) => (
                            <option key={i} value={new Date().getFullYear() + i}>
                              {new Date().getFullYear() + i}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">CVV *</label>
                        <input
                          type="text"
                          value={paymentInfo.cvv}
                          onChange={(e) => setPaymentInfo(prev => ({ ...prev, cvv: e.target.value }))}
                          placeholder="123"
                          maxLength={4}
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300"
                          required
                        />
                      </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="border-t border-slate-700/50 pt-6 mt-6">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agreeToTerms}
                          onChange={(e) => setAgreeToTerms(e.target.checked)}
                          className="w-4 h-4 text-cyan-600 bg-slate-900 border-slate-600 rounded focus:ring-cyan-500 mt-1"
                          required
                        />
                        <span className="text-slate-300 text-sm">
                          I agree to the{' '}
                          <a href="/terms" className="text-cyan-400 hover:text-cyan-300 underline">
                            Terms of Service
                          </a>{' '}
                          and{' '}
                          <a href="/privacy" className="text-cyan-400 hover:text-cyan-300 underline">
                            Privacy Policy
                          </a>
                        </span>
                      </label>
                    </div>

                    {error && (
                      <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                        <p className="text-rose-400 text-sm">{error}</p>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 px-6 py-3 border border-slate-600 text-slate-300 font-semibold rounded-lg hover:bg-slate-700/50 transition-all duration-300"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25"
                      >
                        Review Order
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Step 3: Review Order */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    Review Your Order
                  </h2>

                  <div className="space-y-6">
                    {/* Billing Address */}
                    <div>
                      <h3 className="text-lg font-medium text-white mb-3">Billing Address</h3>
                      <div className="p-4 bg-slate-700/20 rounded-lg text-slate-300 text-sm">
                        <p>{billingInfo.firstName} {billingInfo.lastName}</p>
                        <p>{billingInfo.address1}</p>
                        {billingInfo.address2 && <p>{billingInfo.address2}</p>}
                        <p>{billingInfo.city}, {billingInfo.state} {billingInfo.zip}</p>
                        <p>{billingInfo.email}</p>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <h3 className="text-lg font-medium text-white mb-3">Payment Method</h3>
                      <div className="p-4 bg-slate-700/20 rounded-lg text-slate-300 text-sm">
                        <p>Card ending in {paymentInfo.cardNumber.slice(-4)}</p>
                        <p>Expires {paymentInfo.expiryMonth}/{paymentInfo.expiryYear}</p>
                      </div>
                    </div>

                    {error && (
                      <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                        <p className="text-rose-400 text-sm">{error}</p>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        disabled={isLoading}
                        className="flex-1 px-6 py-3 border border-slate-600 text-slate-300 font-semibold rounded-lg hover:bg-slate-700/50 transition-all duration-300 disabled:opacity-50"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleFinalSubmit}
                        disabled={isLoading}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-lg hover:from-emerald-400 hover:to-green-500 transition-all duration-300 shadow-lg shadow-emerald-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            Complete Order
                            <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl shadow-slate-900/50 sticky top-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                Order Summary
              </h3>

              <div className="space-y-4 mb-6">
                {cart.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="w-5 h-5 bg-cyan-300/50 rounded flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {item.product?.name || 'Diagnostic Panel'}
                      </p>
                      <p className="text-xs text-slate-400">
                        Qty: {item.quantity} × {swellHelpers.formatPrice(item.price || 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-700/50 pt-4 space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal:</span>
                  <span>{swellHelpers.formatPrice(cart.total || 0)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-white border-t border-slate-700/50 pt-2">
                  <span>Total:</span>
                  <span>{swellHelpers.formatPrice(cart.total || 0)}</span>
                </div>
              </div>

              {/* Security badges */}
              <div className="mt-6 pt-6 border-t border-slate-700/50">
                <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-emerald-400/20 border border-emerald-400/30 rounded flex items-center justify-center">
                      <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                    </div>
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-cyan-400/20 border border-cyan-400/30 rounded flex items-center justify-center">
                      <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                    </div>
                    <span>HIPAA Compliant</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}