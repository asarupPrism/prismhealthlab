'use client'

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import ExpandableSection, { SectionStatus } from './ExpandableSection'
import ProgressTracker from './ProgressTracker'
import DynamicOrderSummary from './DynamicOrderSummary'
import CompactAppointmentScheduler from './CompactAppointmentScheduler'
import CombinedPaymentBillingForm from '../checkout/CombinedPaymentBillingForm'
import CouponCode from '../checkout/CouponCode'
import OrderReview from '../checkout/OrderReview'
import { swellHelpers } from '@/lib/swell'
import { Cart } from '@/lib/swell'
import { User } from '@supabase/supabase-js'

interface StreamlinedCheckoutProps {
  cart?: Cart
  user?: User | null
  onComplete?: (allData: Record<string, unknown>) => void
  className?: string
}

type SectionId = 'appointment' | 'billing' | 'review'

interface CheckoutStep {
  id: string
  title: string
  subtitle?: string
  status: SectionStatus
}

interface AppointmentData {
  selectedDate?: Date
  selectedTime?: string
  locationName?: string
  staffName?: string
  locationId?: string
  timeSlot?: {
    start: string
  }
}

interface BillingData {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  address1?: string
  address2?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}

interface PaymentData {
  cardNumber?: string
  nameOnCard?: string
  expiryMonth?: string
  expiryYear?: string
  cvv?: string
}

interface BillingPaymentData {
  billing?: BillingData
  payment?: PaymentData
}

export default function StreamlinedCheckout({
  cart,
  onComplete,
  className = ''
}: StreamlinedCheckoutProps) {
  const [expandedSection, setExpandedSection] = useState<SectionId>('appointment')
  const [checkoutData, setCheckoutData] = useState<Record<string, unknown>>({})
  const [sectionStatuses, setSectionStatuses] = useState<Record<SectionId, SectionStatus>>({
    appointment: 'in_progress',
    billing: 'pending',
    review: 'pending'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<string>('')
  const [discount, setDiscount] = useState<number>(0)


  // Progress tracking steps
  const steps: CheckoutStep[] = [
    {
      id: 'appointment',
      title: 'Schedule Appointment',
      subtitle: 'Select date, time & location',
      status: sectionStatuses.appointment
    },
    {
      id: 'billing',
      title: 'Billing & Payment',
      subtitle: 'Personal info & payment method',
      status: sectionStatuses.billing
    },
    {
      id: 'review',
      title: 'Review & Complete',
      subtitle: 'Confirm order details',
      status: sectionStatuses.review
    }
  ]

  const handleSectionToggle = useCallback((sectionId: string) => {
    setExpandedSection(sectionId as SectionId)
  }, [])

  const handleSectionEdit = useCallback((sectionId: string) => {
    const sectionIdTyped = sectionId as SectionId
    setExpandedSection(sectionIdTyped)
    
    // Reset section status to in_progress when editing
    setSectionStatuses(prev => ({
      ...prev,
      [sectionIdTyped]: 'in_progress',
      // Reset subsequent sections to pending
      ...(sectionIdTyped === 'appointment' && {
        billing: 'pending',
        review: 'pending'
      }),
      ...(sectionIdTyped === 'billing' && {
        review: 'pending'
      })
    }))
  }, [])

  const handleStepData = useCallback((stepId: string, data: unknown) => {
    setCheckoutData(prev => ({ ...prev, [stepId]: data }))
    
    // Update section statuses and collapse completed sections
    if (stepId === 'appointment' && data) {
      setSectionStatuses(prev => ({
        ...prev,
        appointment: 'completed'
      }))
      // Auto-collapse completed appointment section
      setExpandedSection('billing')
    } else if (stepId === 'billingPayment' && data) {
      setSectionStatuses(prev => ({
        ...prev,
        billing: 'completed'
      }))
      // Auto-collapse completed billing section  
      setExpandedSection('review')
    }
  }, [])

  // Handle coupon application
  const handleApplyCoupon = async (code: string) => {
    try {
      if (!code) {
        // Remove coupon
        await swellHelpers.removeCoupon()
        setAppliedCoupon('')
        setDiscount(0)
        return { success: true, message: 'Coupon removed' }
      }

      const updatedCart = await swellHelpers.applyCoupon(code)
      const couponDiscount = (updatedCart as Record<string, unknown>).coupon_total as number || 0
      
      if (couponDiscount > 0) {
        setAppliedCoupon(code)
        setDiscount(couponDiscount)
        return { 
          success: true, 
          discount: couponDiscount,
          message: `Coupon applied! You saved $${couponDiscount.toFixed(2)}` 
        }
      } else {
        return { success: false, message: 'Invalid or expired coupon code' }
      }
    } catch (error) {
      console.error('Coupon application error:', error)
      return { success: false, message: 'Failed to apply coupon. Please try again.' }
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      await onComplete?.(checkoutData)
      setSectionStatuses(prev => ({
        ...prev,
        review: 'completed'
      }))
    } catch (error) {
      console.error('Checkout completion error:', error)
      setSectionStatuses(prev => ({
        ...prev,
        review: 'error'
      }))
    } finally {
      setIsLoading(false)
    }
  }

  // Format appointment data for summary
  const appointmentData = checkoutData.appointment as AppointmentData | undefined
  const appointmentSummary = appointmentData ? (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-slate-400">Date:</span>
        <span className="text-white">
          {appointmentData.selectedDate ? 
            new Date(appointmentData.selectedDate).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short', 
              day: 'numeric'
            }) : 'Not selected'}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-400">Time:</span>
        <span className="text-white">{appointmentData.selectedTime || 'Not selected'}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-400">Location:</span>
        <span className="text-white">{appointmentData.locationName || 'Not selected'}</span>
      </div>
    </div>
  ) : null

  // Format billing data for summary
  const billingPaymentData = checkoutData.billingPayment as BillingPaymentData | undefined
  const billingSummary = billingPaymentData ? (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-slate-400">Name:</span>
        <span className="text-white">
          {[billingPaymentData.billing?.firstName, billingPaymentData.billing?.lastName]
            .filter(Boolean).join(' ') || 'Not provided'}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-400">Email:</span>
        <span className="text-white">{billingPaymentData.billing?.email || 'Not provided'}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-400">Payment:</span>
        <span className="text-white">
          {billingPaymentData.payment?.cardNumber ? 
            `••••${billingPaymentData.payment.cardNumber.slice(-4)}` : 'Not provided'}
        </span>
      </div>
    </div>
  ) : null

  // Create order summary data
  const orderSummaryData = {
    cart,
    appointment: appointmentData ? {
      selectedDate: appointmentData.selectedDate ? 
        new Date(appointmentData.selectedDate) : undefined,
      selectedTime: appointmentData.selectedTime,
      locationName: appointmentData.locationName,
      staffName: appointmentData.staffName,
      locationId: appointmentData.locationId
    } : undefined,
    customer: billingPaymentData ? {
      firstName: billingPaymentData.billing?.firstName,
      lastName: billingPaymentData.billing?.lastName,
      email: billingPaymentData.billing?.email,
      phone: billingPaymentData.billing?.phone
    } : undefined,
    payment: billingPaymentData ? {
      cardNumber: billingPaymentData.payment?.cardNumber,
      nameOnCard: billingPaymentData.payment?.nameOnCard
    } : undefined,
    couponCode: appliedCoupon,
    discount: discount
  }

  return (
    <div className={`${className}`}>
      {/* Floating Progress Tracker */}
      <div className="fixed top-16 left-0 right-0 z-40 backdrop-blur-md bg-slate-900/80 border-b border-slate-700/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <ProgressTracker 
            steps={steps}
            currentStepId={expandedSection}
            compact={true}
            orientation="horizontal"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Expandable Sections */}
        <div className="xl:col-span-3 space-y-6 pb-20">
          {/* Appointment Section */}
          <ExpandableSection
            id="appointment"
            title="Schedule Your Appointment"
            subtitle="Select your preferred date, time, and location for blood draw"
            status={sectionStatuses.appointment}
            isExpanded={expandedSection === 'appointment'}
            completedSummary={appointmentSummary}
            onToggle={handleSectionToggle}
            onEdit={handleSectionEdit}
            priority="high"
          >
            <CompactAppointmentScheduler 
              onData={(data) => handleStepData('appointment', data)}
            />
          </ExpandableSection>

          {/* Billing & Payment Section */}
          <ExpandableSection
            id="billing"
            title="Billing & Payment Information"
            subtitle="Personal details and payment method for your order"
            status={sectionStatuses.billing}
            isExpanded={expandedSection === 'billing'}
            isDisabled={sectionStatuses.appointment !== 'completed'}
            completedSummary={billingSummary}
            onToggle={handleSectionToggle}
            onEdit={handleSectionEdit}
            priority="high"
          >
            <div className="space-y-8">
              {/* Coupon Code Section */}
              <CouponCode
                onApplyCoupon={handleApplyCoupon}
                appliedCoupon={appliedCoupon}
                discount={discount}
              />
              
              {/* Billing Form */}
              <CombinedPaymentBillingForm 
                onData={(data) => handleStepData('billingPayment', data)}
              />
            </div>
          </ExpandableSection>

          {/* Review Section */}
          <ExpandableSection
            id="review"
            title="Review & Complete Order"
            subtitle="Confirm all details and finalize your diagnostic test order"
            status={sectionStatuses.review}
            isExpanded={expandedSection === 'review'}
            isDisabled={sectionStatuses.billing !== 'completed'}
            onToggle={handleSectionToggle}
            priority="high"
          >
            <div>
              {cart && (
                <OrderReview 
                  checkoutData={checkoutData}
                  cart={cart as unknown as import('@/types/shared').Cart}
                  onData={(data) => handleStepData('review', data)}
                />
              )}

              {/* Complete Order Button */}
              <div className="mt-8 flex justify-end">
                <motion.button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className={`px-8 py-4 font-semibold rounded-xl transition-all duration-300 flex items-center gap-3 ${
                    isLoading
                      ? 'bg-slate-700/30 border border-slate-600/30 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </div>
                      Complete Order
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </ExpandableSection>
        </div>

          {/* Dynamic Order Summary - Desktop */}
          <div className="xl:col-span-1 hidden xl:block">
            <DynamicOrderSummary 
              data={orderSummaryData}
              isSticky={true}
              showDetailedBreakdown={true}
            />
          </div>
        </div>

        {/* Mobile Order Summary - Bottom Sheet */}
        <div className="xl:hidden mt-8">
          <DynamicOrderSummary 
            data={orderSummaryData}
            isSticky={false}
            showDetailedBreakdown={false}
          />
        </div>
      </div>
    </div>
  )
}