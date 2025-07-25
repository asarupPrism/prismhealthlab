'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CompactAppointmentScheduler from './CompactAppointmentScheduler'
import CombinedPaymentBillingForm from '../checkout/CombinedPaymentBillingForm'
import OrderReview from '../checkout/OrderReview'
import { Cart, CartItem } from '@/lib/swell'
import { User } from '@supabase/supabase-js'

interface StreamlinedCheckoutProps {
  cart?: Cart
  user?: User | null
  onComplete?: (allData: Record<string, unknown>) => void
  className?: string
}

export default function StreamlinedCheckout({
  cart,
  onComplete,
  className = ''
}: StreamlinedCheckoutProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [checkoutData, setCheckoutData] = useState<Record<string, unknown>>({})
  const [isLoading, setIsLoading] = useState(false)

  const totalSteps = 2
  const progressPercentage = (currentStep / totalSteps) * 100

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Complete Your Order'
      case 2:
        return 'Review & Complete'
      default:
        return 'Checkout'
    }
  }

  const handleStepData = (stepId: string, data: unknown) => {
    setCheckoutData(prev => ({ ...prev, [stepId]: data }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      await onComplete?.(checkoutData)
    } catch (error) {
      console.error('Checkout completion error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`max-w-7xl mx-auto ${className}`}>
      {/* Minimal Progress Header */}
      <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 mb-8 shadow-xl shadow-slate-900/50">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            {getStepTitle()}
          </h1>
          <span className="text-sm font-mono text-slate-300">
            Step {currentStep} of {totalSteps}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-700/50 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full shadow-lg shadow-cyan-500/25"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 1: Complete Your Order */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Main Content Area */}
              <div className="xl:col-span-3">
                <div className="grid gap-8">
                  {/* Appointment Scheduling Section */}
                  <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl shadow-slate-900/50">
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      Schedule Your Appointment
                    </h2>
                    <CompactAppointmentScheduler 
                      onData={(data) => handleStepData('appointment', data)}
                    />
                  </div>

                  {/* Billing & Payment Section */}
                  <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl shadow-slate-900/50">
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                      Billing & Payment Details
                    </h2>
                    <CombinedPaymentBillingForm 
                      onData={(data) => handleStepData('billingPayment', data)}
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary Sidebar - Matches existing checkout design */}
              <div className="xl:col-span-1">
                <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl shadow-slate-900/50 sticky top-20">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    Order Summary
                  </h3>
                  
                  {/* Cart Items */}
                  <div className="space-y-4 mb-6">
                    {cart?.items?.map((item: CartItem) => (
                      <div key={item.id} className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 rounded-xl flex items-center justify-center flex-shrink-0">
                          <div className="w-6 h-6 bg-cyan-300/50 rounded-lg flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white leading-tight mb-1">
                            {item.product?.name || 'Diagnostic Panel'}
                          </p>
                          <p className="text-xs text-slate-400 mb-2">
                            Qty: {item.quantity} × ${Number(item.price || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="border-t border-slate-700/50 pt-4 space-y-3">
                    <div className="flex justify-between text-slate-300 text-sm">
                      <span>Subtotal:</span>
                      <span>${Number(cart?.total || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300 text-sm">
                      <span>Lab Processing:</span>
                      <span>Included</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-white border-t border-slate-700/50 pt-3">
                      <span>Total:</span>
                      <span className="text-cyan-400">${Number(cart?.total || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleNext}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 flex items-center gap-2"
              >
                <span>Continue to Review</span>
                <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                  <div className="w-0 h-0 border-l-2 border-r-2 border-b-2 border-white border-l-transparent border-r-transparent transform rotate-[-90deg]"></div>
                </div>
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 2: Review & Complete */}
            <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 shadow-xl shadow-slate-900/50">
              <h2 className="text-2xl font-semibold text-white mb-8 flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                Review Your Order
              </h2>
              
              {cart && (
                <OrderReview 
                  checkoutData={checkoutData}
                  cart={cart as unknown as import('@/types/shared').Cart}
                  onData={(data) => handleStepData('review', data)}
                />
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrevious}
                  className="px-6 py-3 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-200 font-medium rounded-xl hover:bg-slate-600/60 hover:border-slate-500/60 transition-all duration-300"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">←</span>
                    Back to Details
                  </span>
                </button>

                <button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className={`px-8 py-4 font-semibold rounded-xl transition-all duration-300 flex items-center gap-3 ${
                    isLoading
                      ? 'bg-slate-700/30 border border-slate-600/30 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </div>
                      Complete Order
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}