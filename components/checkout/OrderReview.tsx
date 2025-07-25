'use client'

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { swellHelpers } from '@/lib/swell'
import { CheckoutData, Cart, CartItem } from '@/types/shared'

interface OrderReviewProps {
  checkoutData: CheckoutData
  cart: Cart
  onData?: (data: { readyToComplete: boolean }) => void
  className?: string
}

export default function OrderReview({
  checkoutData,
  cart,
  onData,
  className = ''
}: OrderReviewProps) {

  // Notify parent that review is ready
  useEffect(() => {
    onData?.({ readyToComplete: true })
  }, [onData])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }


  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <div className="space-y-8">
        
        {/* Order Summary */}
        <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl shadow-slate-900/50">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            Order Summary
          </h3>
          
          <div className="space-y-4">
            {cart.items?.map((item: CartItem, index: number) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-start gap-4 p-4 backdrop-blur-sm bg-slate-900/40 border border-slate-700/40 rounded-xl shadow-lg shadow-slate-900/30"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <div className="w-8 h-8 bg-cyan-300/50 rounded-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
                
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-white mb-2">
                    {item.name || 'Diagnostic Panel'}
                  </h4>
                  {item.description && (
                    <p className="text-sm text-slate-400 mb-3 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">
                      Quantity: {item.quantity}
                    </span>
                    <span className="text-lg font-bold text-cyan-400">
                      {swellHelpers.formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold text-white">Total</span>
              <span className="text-2xl font-bold text-cyan-400">
                {swellHelpers.formatPrice(cart.total || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        {checkoutData.appointment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl shadow-slate-900/50"
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              Your Appointment
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 backdrop-blur-sm bg-slate-900/40 border border-slate-700/40 rounded-xl shadow-lg shadow-slate-900/30">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                    <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Date</p>
                    <p className="text-white font-semibold">
                      {formatDate(checkoutData.appointment.selectedDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 backdrop-blur-sm bg-slate-900/40 border border-slate-700/40 rounded-xl shadow-lg shadow-slate-900/30">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
                    <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Time</p>
                    <p className="text-white font-semibold">
                      {checkoutData.appointment.selectedTime}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 backdrop-blur-sm bg-slate-900/40 border border-slate-700/40 rounded-xl shadow-lg shadow-slate-900/30">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                    <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Location</p>
                    <p className="text-white font-semibold">
                      {checkoutData.appointment.locationName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 backdrop-blur-sm bg-slate-900/40 border border-slate-700/40 rounded-xl shadow-lg shadow-slate-900/30">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                    <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Staff</p>
                    <p className="text-white font-semibold">
                      {checkoutData.appointment.staffName}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Account Information */}
        {checkoutData.authentication?.user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl shadow-slate-900/50"
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              Patient Account
            </h3>
            
            <div className="flex items-center gap-4 p-4 backdrop-blur-sm bg-slate-900/40 border border-slate-700/40 rounded-xl shadow-lg shadow-slate-900/30">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              <div>
                <p className="text-white font-semibold">
                  {checkoutData.authentication.user.email}
                </p>
                <p className="text-sm text-slate-400">
                  Your test results and appointment history will be saved to this account
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Billing Information */}
        {checkoutData.billing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl shadow-slate-900/50"
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              Billing Address
            </h3>
            
            <div className="p-4 bg-slate-900/30 border border-slate-700/30 rounded-xl">
              <div className="text-slate-200 space-y-1">
                <p className="font-semibold">
                  {checkoutData.billing.firstName} {checkoutData.billing.lastName}
                </p>
                <p>{checkoutData.billing.address1}</p>
                {checkoutData.billing.address2 && <p>{checkoutData.billing.address2}</p>}
                <p>
                  {checkoutData.billing.city}, {checkoutData.billing.state} {checkoutData.billing.zip}
                </p>
                <p className="text-cyan-400">{checkoutData.billing.email}</p>
                {checkoutData.billing.phone && (
                  <p className="text-slate-400">{checkoutData.billing.phone}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Payment Information */}
        {checkoutData.payment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              Payment Method
            </h3>
            
            <div className="p-4 bg-slate-900/30 border border-slate-700/30 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-lg"></div>
                  </div>
                </div>
                <div>
                  <p className="text-white font-semibold">
                    •••• •••• •••• {checkoutData.payment.cardNumber.slice(-4)}
                  </p>
                  <p className="text-sm text-slate-400">
                    Expires {checkoutData.payment.expiryDate}
                  </p>
                  <p className="text-sm text-slate-300">
                    {checkoutData.payment.nameOnCard}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Important Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="backdrop-blur-sm bg-amber-900/20 border border-amber-700/50 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
            Important Information
          </h3>
          
          <div className="space-y-3 text-sm text-slate-300">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-cyan-400/20 border border-cyan-400/30 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              </div>
              <p>
                <strong className="text-white">Appointment Preparation:</strong> Please arrive 15 minutes early for your appointment. Bring a valid ID and any relevant medical history.
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-emerald-400/20 border border-emerald-400/30 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              </div>
              <p>
                <strong className="text-white">Results Delivery:</strong> Test results will be available in your patient portal within 2-5 business days. You&apos;ll receive an email notification when ready.
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-amber-400/20 border border-amber-400/30 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
              </div>
              <p>
                <strong className="text-white">Cancellation Policy:</strong> You can reschedule or cancel your appointment up to 24 hours in advance without any fees.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Final Confirmation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="text-center py-8"
        >
          <p className="text-slate-300 mb-6 leading-relaxed">
            By completing this order, you confirm that all information is accurate and you agree 
            to our terms of service. Your payment will be processed securely, and you&apos;ll receive 
            a confirmation email with your appointment details.
          </p>
          
          <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-400/20 border border-emerald-400/30 rounded flex items-center justify-center">
                <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
              </div>
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-cyan-400/20 border border-cyan-400/30 rounded flex items-center justify-center">
                <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
              </div>
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400/20 border border-blue-400/30 rounded flex items-center justify-center">
                <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
              </div>
              <span>PCI Certified</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}