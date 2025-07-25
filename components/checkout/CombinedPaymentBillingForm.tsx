'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

interface BillingInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  address1: string
  address2: string
  city: string
  state: string
  zip: string
  country: string
}

interface PaymentInfo {
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  nameOnCard: string
  agreeToTerms: boolean
}

interface CombinedFormData {
  billing: BillingInfo
  payment: PaymentInfo
}

interface CombinedPaymentBillingFormProps {
  onData?: (data: CombinedFormData) => void
  initialData?: Partial<CombinedFormData>
  className?: string
}

export default function CombinedPaymentBillingForm({
  onData,
  initialData,
  className = ''
}: CombinedPaymentBillingFormProps) {
  const [billingData, setBillingData] = useState<BillingInfo>({
    firstName: initialData?.billing?.firstName || '',
    lastName: initialData?.billing?.lastName || '',
    email: initialData?.billing?.email || '',
    phone: initialData?.billing?.phone || '',
    address1: initialData?.billing?.address1 || '',
    address2: initialData?.billing?.address2 || '',
    city: initialData?.billing?.city || '',
    state: initialData?.billing?.state || '',
    zip: initialData?.billing?.zip || '',
    country: initialData?.billing?.country || 'US'
  })

  const [paymentData, setPaymentData] = useState<PaymentInfo>({
    cardNumber: initialData?.payment?.cardNumber || '',
    expiryMonth: initialData?.payment?.expiryMonth || '',
    expiryYear: initialData?.payment?.expiryYear || '',
    cvv: initialData?.payment?.cvv || '',
    nameOnCard: initialData?.payment?.nameOnCard || '',
    agreeToTerms: initialData?.payment?.agreeToTerms || false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Validation function
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    // Billing validation
    if (!billingData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!billingData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!billingData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!billingData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!billingData.address1.trim()) newErrors.address1 = 'Address is required'
    if (!billingData.city.trim()) newErrors.city = 'City is required'
    if (!billingData.state.trim()) newErrors.state = 'State is required'
    if (!billingData.zip.trim()) newErrors.zip = 'ZIP code is required'

    // Payment validation
    if (!paymentData.cardNumber.replace(/\s/g, '')) {
      newErrors.cardNumber = 'Card number is required'
    } else if (paymentData.cardNumber.replace(/\s/g, '').length < 13) {
      newErrors.cardNumber = 'Please enter a valid card number'
    }
    if (!paymentData.expiryMonth) newErrors.expiryMonth = 'Expiry month is required'
    if (!paymentData.expiryYear) newErrors.expiryYear = 'Expiry year is required'
    if (!paymentData.cvv) {
      newErrors.cvv = 'CVV is required'
    } else if (paymentData.cvv.length < 3) {
      newErrors.cvv = 'CVV must be 3-4 digits'
    }
    if (!paymentData.nameOnCard.trim()) newErrors.nameOnCard = 'Cardholder name is required'
    if (!paymentData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions'

    setErrors(newErrors)
    const formIsValid = Object.keys(newErrors).length === 0
    return formIsValid
  }, [billingData, paymentData])

  // Update parent component when data changes
  useEffect(() => {
    if (validateForm()) {
      onData?.({
        billing: billingData,
        payment: paymentData
      })
    }
  }, [billingData, paymentData, onData, validateForm])

  const handleBillingChange = (field: keyof BillingInfo, value: string) => {
    setBillingData(prev => ({ ...prev, [field]: value }))
  }

  const handlePaymentChange = (field: keyof PaymentInfo, value: string | boolean) => {
    setPaymentData(prev => ({ ...prev, [field]: value }))
  }

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
  }

  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Billing Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl shadow-slate-900/50"
        >
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            Billing Information
          </h3>

          <div className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  First Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={billingData.firstName}
                  onChange={(e) => handleBillingChange('firstName', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-200"
                  placeholder="Enter your first name"
                />
                {errors.firstName && (
                  <div className="mt-1 text-sm text-rose-400 flex items-center gap-2">
                    <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/50 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse"></div>
                    </div>
                    {errors.firstName}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Last Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={billingData.lastName}
                  onChange={(e) => handleBillingChange('lastName', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-200"
                  placeholder="Enter your last name"
                />
                {errors.lastName && (
                  <div className="mt-1 text-sm text-rose-400 flex items-center gap-2">
                    <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/50 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse"></div>
                    </div>
                    {errors.lastName}
                  </div>
                )}
              </div>
            </div>

            {/* Contact Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  value={billingData.email}
                  onChange={(e) => handleBillingChange('email', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-200"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <div className="mt-1 text-sm text-rose-400 flex items-center gap-2">
                    <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/50 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse"></div>
                    </div>
                    {errors.email}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Phone Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  value={billingData.phone}
                  onChange={(e) => handleBillingChange('phone', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-200"
                  placeholder="Enter your phone number"
                />
                {errors.phone && (
                  <div className="mt-1 text-sm text-rose-400 flex items-center gap-2">
                    <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/50 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse"></div>
                    </div>
                    {errors.phone}
                  </div>
                )}
              </div>
            </div>

            {/* Address Fields */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Street Address <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={billingData.address1}
                onChange={(e) => handleBillingChange('address1', e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-200"
                placeholder="Enter your street address"
              />
              {errors.address1 && (
                <div className="mt-1 text-sm text-rose-400 flex items-center gap-2">
                  <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/50 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse"></div>
                  </div>
                  {errors.address1}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Apartment, Suite, etc. (Optional)
              </label>
              <input
                type="text"
                value={billingData.address2}
                onChange={(e) => handleBillingChange('address2', e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-200"
                placeholder="Apartment, suite, etc."
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  City <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={billingData.city}
                  onChange={(e) => handleBillingChange('city', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-200"
                  placeholder="City"
                />
                {errors.city && (
                  <div className="mt-1 text-sm text-rose-400 flex items-center gap-2">
                    <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/50 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse"></div>
                    </div>
                    {errors.city}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  State <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={billingData.state}
                  onChange={(e) => handleBillingChange('state', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-200"
                  placeholder="State"
                />
                {errors.state && (
                  <div className="mt-1 text-sm text-rose-400 flex items-center gap-2">
                    <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/50 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse"></div>
                    </div>
                    {errors.state}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  ZIP Code <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={billingData.zip}
                  onChange={(e) => handleBillingChange('zip', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-200"
                  placeholder="ZIP"
                />
                {errors.zip && (
                  <div className="mt-1 text-sm text-rose-400 flex items-center gap-2">
                    <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/50 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse"></div>
                    </div>
                    {errors.zip}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Payment Information */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl shadow-slate-900/50"
        >
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            Payment Information
          </h3>

          <div className="space-y-4">
            {/* Card Number */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Card Number <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={paymentData.cardNumber}
                onChange={(e) => handlePaymentChange('cardNumber', formatCardNumber(e.target.value))}
                maxLength={19}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-200 font-mono"
                placeholder="1234 5678 9012 3456"
              />
              {errors.cardNumber && (
                <div className="mt-1 text-sm text-rose-400 flex items-center gap-2">
                  <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/50 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse"></div>
                  </div>
                  {errors.cardNumber}
                </div>
              )}
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Month <span className="text-rose-400">*</span>
                </label>
                <select
                  value={paymentData.expiryMonth}
                  onChange={(e) => handlePaymentChange('expiryMonth', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-200"
                >
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month.toString().padStart(2, '0')}>
                      {month.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
                {errors.expiryMonth && (
                  <div className="mt-1 text-sm text-rose-400 flex items-center gap-2">
                    <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/50 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse"></div>
                    </div>
                    {errors.expiryMonth}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Year <span className="text-rose-400">*</span>
                </label>
                <select
                  value={paymentData.expiryYear}
                  onChange={(e) => handlePaymentChange('expiryYear', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-200"
                >
                  <option value="">YYYY</option>
                  {Array.from({ length: 12 }, (_, i) => new Date().getFullYear() + i).map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                {errors.expiryYear && (
                  <div className="mt-1 text-sm text-rose-400 flex items-center gap-2">
                    <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/50 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse"></div>
                    </div>
                    {errors.expiryYear}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  CVV <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={paymentData.cvv}
                  onChange={(e) => handlePaymentChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-200 font-mono"
                  placeholder="123"
                />
                {errors.cvv && (
                  <div className="mt-1 text-sm text-rose-400 flex items-center gap-2">
                    <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/50 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse"></div>
                    </div>
                    {errors.cvv}
                  </div>
                )}
              </div>
            </div>

            {/* Cardholder Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Cardholder Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={paymentData.nameOnCard}
                onChange={(e) => handlePaymentChange('nameOnCard', e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-200"
                placeholder="Enter name as it appears on card"
              />
              {errors.nameOnCard && (
                <div className="mt-1 text-sm text-rose-400 flex items-center gap-2">
                  <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/50 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse"></div>
                  </div>
                  {errors.nameOnCard}
                </div>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="mt-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymentData.agreeToTerms}
                  onChange={(e) => handlePaymentChange('agreeToTerms', e.target.checked)}
                  className="mt-1 w-4 h-4 bg-slate-900/50 border border-slate-600/50 rounded focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-0 text-cyan-400"
                />
                <span className="text-sm text-slate-300 leading-relaxed">
                  I agree to the{' '}
                  <a href="/terms" className="text-cyan-400 hover:text-cyan-300 underline">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-cyan-400 hover:text-cyan-300 underline">
                    Privacy Policy
                  </a>
                  <span className="text-rose-400 ml-1">*</span>
                </span>
              </label>
              {errors.agreeToTerms && (
                <div className="mt-1 text-sm text-rose-400 flex items-center gap-2">
                  <div className="w-3 h-3 bg-rose-400/20 border border-rose-400/50 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse"></div>
                  </div>
                  {errors.agreeToTerms}
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="mt-6 backdrop-blur-sm bg-slate-900/40 border border-slate-700/40 rounded-xl p-4 shadow-lg shadow-slate-900/30">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-white">Secure Payment</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your payment information is encrypted and secure. We use industry-standard SSL encryption to protect your data.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}