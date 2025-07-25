'use client'

import React, { useState, useEffect, useCallback } from 'react'
import LoginPopup from '@/components/ui/LoginPopup'
import BillingPersonalInfo from './BillingPersonalInfo'
import BillingAddress from './BillingAddress'
import PaymentMethod from './PaymentMethod'

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
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false)
  
  // Collapsible section states
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    address: false,
    payment: false
  })

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

  const handleFieldTouch = (fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName))
  }

  const handleLoginSuccess = (userData: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address1: string
    address2: string
    city: string
    state: string
    zip: string
  }) => {
    setBillingData({
      ...billingData,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      address1: userData.address1,
      address2: userData.address2,
      city: userData.city,
      state: userData.state,
      zip: userData.zip
    })
    // Mark all fields as touched since they're auto-filled
    setTouchedFields(new Set([
      'firstName', 'lastName', 'email', 'phone', 
      'address1', 'city', 'state', 'zip'
    ]))
  }

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

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Handle edit - reopen completed section for editing
  const handleEdit = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: true
    }))
  }

  // Check completion status for badges (no auto-behavior)
  const isPersonalComplete = !!(
    billingData.firstName && 
    billingData.lastName && 
    billingData.email && 
    billingData.phone &&
    // Check there are no validation errors for personal fields
    !errors.firstName && 
    !errors.lastName && 
    !errors.email && 
    !errors.phone &&
    // Ensure user has interacted with all required fields
    touchedFields.has('firstName') && touchedFields.has('lastName') && 
    touchedFields.has('email') && touchedFields.has('phone')
  )
  
  const isAddressComplete = !!(
    billingData.address1 && 
    billingData.city && 
    billingData.state && 
    billingData.zip &&
    // Check there are no validation errors for address fields
    !errors.address1 && 
    !errors.city && 
    !errors.state && 
    !errors.zip &&
    // Ensure user has interacted with all required fields
    touchedFields.has('address1') && touchedFields.has('city') && 
    touchedFields.has('state') && touchedFields.has('zip')
  )
  
  const isPaymentComplete = !!(
    paymentData.cardNumber.replace(/\s/g, '').length >= 13 && 
    paymentData.expiryMonth && 
    paymentData.expiryYear && 
    paymentData.cvv.length >= 3 && 
    paymentData.nameOnCard && 
    paymentData.agreeToTerms &&
    // Check there are no validation errors for payment fields
    !errors.cardNumber && 
    !errors.expiryMonth && 
    !errors.expiryYear && 
    !errors.cvv && 
    !errors.nameOnCard && 
    !errors.agreeToTerms &&
    // Ensure user has interacted with all required fields
    touchedFields.has('cardNumber') && touchedFields.has('expiryMonth') && 
    touchedFields.has('expiryYear') && touchedFields.has('cvv') && 
    touchedFields.has('nameOnCard') && touchedFields.has('agreeToTerms')
  )

  // Auto-collapse completed sections
  React.useEffect(() => {
    if (isPersonalComplete && expandedSections.personal) {
      setTimeout(() => {
        setExpandedSections(prev => ({
          ...prev,
          personal: false
        }))
      }, 1000) // Delay to let user see completion
    }
  }, [isPersonalComplete, expandedSections.personal])

  React.useEffect(() => {
    if (isAddressComplete && expandedSections.address) {
      setTimeout(() => {
        setExpandedSections(prev => ({
          ...prev,
          address: false
        }))
      }, 1000)
    }
  }, [isAddressComplete, expandedSections.address])

  React.useEffect(() => {
    if (isPaymentComplete && expandedSections.payment) {
      setTimeout(() => {
        setExpandedSections(prev => ({
          ...prev,
          payment: false
        }))
      }, 1000)
    }
  }, [isPaymentComplete, expandedSections.payment])



  return (
    <div className={`${className}`}>
      {/* Login Button Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
            Billing & Payment Details
          </h2>
          <p className="text-slate-400 text-sm mt-1">Secure checkout for your diagnostic tests</p>
        </div>
        <button
          type="button"
          onClick={() => setIsLoginPopupOpen(true)}
          className="px-6 py-3 backdrop-blur-sm bg-purple-500/20 border border-purple-400/30 text-purple-300 text-sm font-medium rounded-xl hover:bg-purple-500/30 hover:border-purple-400/50 transition-all duration-300 flex items-center gap-3 shadow-lg shadow-purple-500/10"
        >
          <div className="w-4 h-4 bg-purple-400/50 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          Return Customer?
        </button>
      </div>

      {/* Form Sections */}
      <div className="space-y-8">
        {/* Personal Information Section */}
        <BillingPersonalInfo
          data={{
            firstName: billingData.firstName,
            lastName: billingData.lastName,
            email: billingData.email,
            phone: billingData.phone
          }}
          errors={errors}
          touchedFields={touchedFields}
          onChange={(field, value) => handleBillingChange(field, value)}
          onFieldTouch={handleFieldTouch}
          isExpanded={expandedSections.personal}
          onToggle={() => toggleSection('personal')}
          onEdit={() => handleEdit('personal')}
          isComplete={isPersonalComplete}
        />

        {/* Address Information Section */}
        <BillingAddress
          data={{
            address1: billingData.address1,
            address2: billingData.address2,
            city: billingData.city,
            state: billingData.state,
            zip: billingData.zip,
            country: billingData.country
          }}
          errors={errors}
          touchedFields={touchedFields}
          onChange={(field, value) => handleBillingChange(field, value)}
          onFieldTouch={handleFieldTouch}
          isExpanded={expandedSections.address}
          onToggle={() => toggleSection('address')}
          onEdit={() => handleEdit('address')}
          isComplete={isAddressComplete}
        />

        {/* Payment Method Section */}
        <PaymentMethod
          data={paymentData}
          errors={errors}
          touchedFields={touchedFields}
          onChange={handlePaymentChange}
          onFieldTouch={handleFieldTouch}
          formatCardNumber={formatCardNumber}
          isExpanded={expandedSections.payment}
          onToggle={() => toggleSection('payment')}
          onEdit={() => handleEdit('payment')}
          isComplete={isPaymentComplete}
        />
      </div>

      {/* Login Popup */}
      <LoginPopup
        isOpen={isLoginPopupOpen}
        onClose={() => setIsLoginPopupOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  )
}