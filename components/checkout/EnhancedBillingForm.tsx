'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context'

interface BillingData {
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

interface PaymentData {
  cardNumber: string
  nameOnCard: string
  expiryMonth: string
  expiryYear: string
  cvv: string
}

interface AccountCreationData {
  createAccount: boolean
  password?: string
  confirmPassword?: string
  marketingConsent: boolean
  termsAccepted: boolean
}

interface EnhancedBillingFormProps {
  onData: (data: { 
    billing: BillingData
    payment: PaymentData
    account?: AccountCreationData
  }) => void
  initialData?: {
    billing?: Partial<BillingData>
    payment?: Partial<PaymentData>
    account?: Partial<AccountCreationData>
  }
}

export default function EnhancedBillingForm({ onData, initialData }: EnhancedBillingFormProps) {
  const { user } = useAuth()
  const [billing, setBilling] = useState<BillingData>({
    firstName: initialData?.billing?.firstName || '',
    lastName: initialData?.billing?.lastName || '',
    email: initialData?.billing?.email || user?.email || '',
    phone: initialData?.billing?.phone || '',
    address1: initialData?.billing?.address1 || '',
    address2: initialData?.billing?.address2 || '',
    city: initialData?.billing?.city || '',
    state: initialData?.billing?.state || '',
    zip: initialData?.billing?.zip || '',
    country: initialData?.billing?.country || 'US'
  })
  
  const [payment, setPayment] = useState<PaymentData>({
    cardNumber: initialData?.payment?.cardNumber || '',
    nameOnCard: initialData?.payment?.nameOnCard || '',
    expiryMonth: initialData?.payment?.expiryMonth || '',
    expiryYear: initialData?.payment?.expiryYear || '',
    cvv: initialData?.payment?.cvv || ''
  })
  
  const [account, setAccount] = useState<AccountCreationData>({
    createAccount: !user && (initialData?.account?.createAccount ?? true),
    password: initialData?.account?.password || '',
    confirmPassword: initialData?.account?.confirmPassword || '',
    marketingConsent: initialData?.account?.marketingConsent || false,
    termsAccepted: initialData?.account?.termsAccepted || false
  })
  
  const [accountExists, setAccountExists] = useState(false)
  const [checkingAccount, setCheckingAccount] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())

  // Check if account exists when email changes
  useEffect(() => {
    const checkExistingAccount = async () => {
      if (!billing.email || billing.email === user?.email || billing.email.length < 5) return
      
      setCheckingAccount(true)
      try {
        const response = await fetch(`/api/account/create-checkout?email=${encodeURIComponent(billing.email)}`)
        const data = await response.json()
        
        if (response.ok) {
          setAccountExists(data.exists)
          if (data.exists && account.createAccount) {
            setAccount(prev => ({ ...prev, createAccount: false }))
          }
        }
      } catch (error) {
        console.error('Error checking account:', error)
      } finally {
        setCheckingAccount(false)
      }
    }
    
    const timeoutId = setTimeout(checkExistingAccount, 500)
    return () => clearTimeout(timeoutId)
  }, [billing.email, user?.email, account.createAccount])

  // Validation
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        return value.trim() ? '' : 'This field is required'
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Invalid email address'
      case 'phone':
        return /^\+?[\d\s\-\(\)]{10,}$/.test(value.replace(/\s/g, '')) ? '' : 'Invalid phone number'
      case 'address1':
      case 'city':
        return value.trim() ? '' : 'This field is required'
      case 'state':
        return value.length === 2 ? '' : 'Please enter a valid state code'
      case 'zip':
        return /^\d{5}(-\d{4})?$/.test(value) ? '' : 'Invalid ZIP code'
      case 'cardNumber':
        return /^\d{13,19}$/.test(value.replace(/\s/g, '')) ? '' : 'Invalid card number'
      case 'nameOnCard':
        return value.trim() ? '' : 'Name on card is required'
      case 'expiryMonth':
        return /^(0[1-9]|1[0-2])$/.test(value) ? '' : 'Invalid month'
      case 'expiryYear':
        const currentYear = new Date().getFullYear() % 100
        const year = parseInt(value)
        return year >= currentYear && year <= currentYear + 20 ? '' : 'Invalid year'
      case 'cvv':
        return /^\d{3,4}$/.test(value) ? '' : 'Invalid CVV'
      case 'password':
        if (!account.createAccount) return ''
        return value.length >= 8 ? '' : 'Password must be at least 8 characters'
      case 'confirmPassword':
        if (!account.createAccount) return ''
        return value === account.password ? '' : 'Passwords do not match'
      default:
        return ''
    }
  }

  const handleBillingChange = (name: keyof BillingData, value: string) => {
    setBilling(prev => ({ ...prev, [name]: value }))
    setTouchedFields(prev => new Set(prev).add(name))
    
    const error = validateField(name, value)
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const handlePaymentChange = (name: keyof PaymentData, value: string) => {
    // Format card number
    if (name === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
    }
    
    setPayment(prev => ({ ...prev, [name]: value }))
    setTouchedFields(prev => new Set(prev).add(name))
    
    const error = validateField(name, value)
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const handleAccountChange = (name: keyof AccountCreationData, value: string | boolean) => {
    setAccount(prev => ({ ...prev, [name]: value }))
    
    if (typeof value === 'string') {
      setTouchedFields(prev => new Set(prev).add(name))
      const error = validateField(name, value)
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }

  // Update parent component
  useEffect(() => {
    const isValid = Object.values(errors).every(error => !error) && 
                   Object.keys(billing).every(key => billing[key as keyof BillingData].trim() !== '') &&
                   Object.keys(payment).every(key => payment[key as keyof PaymentData].trim() !== '') &&
                   (!account.createAccount || (account.password && account.confirmPassword && account.termsAccepted))
    
    if (isValid) {
      onData({
        billing,
        payment,
        ...(account.createAccount && !user && { account })
      })
    }
  }, [billing, payment, account, errors, user, onData])

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ]

  const currentYear = new Date().getFullYear() % 100
  const years = Array.from({ length: 21 }, (_, i) => currentYear + i)

  return (
    <div className="space-y-8">
      {/* Account Creation Section */}
      {!user && (
        <div className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
            <h3 className="text-lg font-semibold text-white">Account</h3>
          </div>
          
          {accountExists && (
            <div className="mb-4 p-3 bg-amber-900/20 border border-amber-700/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span className="text-amber-300 text-sm font-medium">Account Found</span>
              </div>
              <p className="text-amber-200 text-sm">
                An account with this email already exists. Please sign in to link your order, or use a different email.
              </p>
            </div>
          )}
          
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={account.createAccount && !accountExists}
                onChange={(e) => handleAccountChange('createAccount', e.target.checked)}
                disabled={accountExists}
                className="sr-only"
              />
              <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
                account.createAccount && !accountExists
                  ? 'bg-cyan-500 border-cyan-500' 
                  : 'border-slate-500'
              } ${accountExists ? 'opacity-50' : ''}`}>
                {account.createAccount && !accountExists && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <span className={`text-slate-300 text-sm ${accountExists ? 'opacity-50' : ''}`}>
                Create an account to track your orders and results
              </span>
              {checkingAccount && (
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
              )}
            </label>
            
            <AnimatePresence>
              {account.createAccount && !accountExists && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">
                        Password *
                      </label>
                      <input
                        type="password"
                        value={account.password}
                        onChange={(e) => handleAccountChange('password', e.target.value)}
                        className={`w-full px-3 py-2 bg-slate-800/50 border text-white rounded-lg focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-colors ${
                          errors.password && touchedFields.has('password')
                            ? 'border-rose-400/50'
                            : 'border-slate-600/50 focus:border-cyan-400/50'
                        }`}
                        placeholder="Enter password"
                      />
                      {errors.password && touchedFields.has('password') && (
                        <p className="text-rose-300 text-xs mt-1">{errors.password}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        value={account.confirmPassword}
                        onChange={(e) => handleAccountChange('confirmPassword', e.target.value)}
                        className={`w-full px-3 py-2 bg-slate-800/50 border text-white rounded-lg focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-colors ${
                          errors.confirmPassword && touchedFields.has('confirmPassword')
                            ? 'border-rose-400/50'
                            : 'border-slate-600/50 focus:border-cyan-400/50'
                        }`}
                        placeholder="Confirm password"
                      />
                      {errors.confirmPassword && touchedFields.has('confirmPassword') && (
                        <p className="text-rose-300 text-xs mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={account.termsAccepted}
                        onChange={(e) => handleAccountChange('termsAccepted', e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 border-2 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        account.termsAccepted
                          ? 'bg-cyan-500 border-cyan-500' 
                          : 'border-slate-500'
                      }`}>
                        {account.termsAccepted && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span className="text-slate-300 text-sm">
                        I agree to the <a href="/terms" className="text-cyan-400 hover:text-cyan-300">Terms of Service</a> and <a href="/privacy" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</a> *
                      </span>
                    </label>
                    
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={account.marketingConsent}
                        onChange={(e) => handleAccountChange('marketingConsent', e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 border-2 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        account.marketingConsent
                          ? 'bg-cyan-500 border-cyan-500' 
                          : 'border-slate-500'
                      }`}>
                        {account.marketingConsent && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span className="text-slate-300 text-sm">
                        I would like to receive health insights and product updates via email
                      </span>
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Billing Information */}
      <div className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
          <h3 className="text-lg font-semibold text-white">Billing Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={billing.firstName}
              onChange={(e) => handleBillingChange('firstName', e.target.value)}
              className={`w-full px-3 py-2 bg-slate-800/50 border text-white rounded-lg focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-colors ${
                errors.firstName && touchedFields.has('firstName')
                  ? 'border-rose-400/50'
                  : 'border-slate-600/50 focus:border-cyan-400/50'
              }`}
              placeholder="John"
            />
            {errors.firstName && touchedFields.has('firstName') && (
              <p className="text-rose-300 text-xs mt-1">{errors.firstName}</p>
            )}
          </div>
          
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={billing.lastName}
              onChange={(e) => handleBillingChange('lastName', e.target.value)}
              className={`w-full px-3 py-2 bg-slate-800/50 border text-white rounded-lg focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-colors ${
                errors.lastName && touchedFields.has('lastName')
                  ? 'border-rose-400/50'
                  : 'border-slate-600/50 focus:border-cyan-400/50'
              }`}
              placeholder="Doe"
            />
            {errors.lastName && touchedFields.has('lastName') && (
              <p className="text-rose-300 text-xs mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={billing.email}
              onChange={(e) => handleBillingChange('email', e.target.value)}
              className={`w-full px-3 py-2 bg-slate-800/50 border text-white rounded-lg focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-colors ${
                errors.email && touchedFields.has('email')
                  ? 'border-rose-400/50'
                  : 'border-slate-600/50 focus:border-cyan-400/50'
              }`}
              placeholder="john@example.com"
            />
            {errors.email && touchedFields.has('email') && (
              <p className="text-rose-300 text-xs mt-1">{errors.email}</p>
            )}
          </div>
          
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={billing.phone}
              onChange={(e) => handleBillingChange('phone', e.target.value)}
              className={`w-full px-3 py-2 bg-slate-800/50 border text-white rounded-lg focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-colors ${
                errors.phone && touchedFields.has('phone')
                  ? 'border-rose-400/50'
                  : 'border-slate-600/50 focus:border-cyan-400/50'
              }`}
              placeholder="(555) 123-4567"
            />
            {errors.phone && touchedFields.has('phone') && (
              <p className="text-rose-300 text-xs mt-1">{errors.phone}</p>
            )}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-slate-300 text-sm font-medium mb-2">
            Address *
          </label>
          <input
            type="text"
            value={billing.address1}
            onChange={(e) => handleBillingChange('address1', e.target.value)}
            className={`w-full px-3 py-2 bg-slate-800/50 border text-white rounded-lg focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-colors ${
              errors.address1 && touchedFields.has('address1')
                ? 'border-rose-400/50'
                : 'border-slate-600/50 focus:border-cyan-400/50'
            }`}
            placeholder="123 Main Street"
          />
          {errors.address1 && touchedFields.has('address1') && (
            <p className="text-rose-300 text-xs mt-1">{errors.address1}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-slate-300 text-sm font-medium mb-2">
            Address Line 2
          </label>
          <input
            type="text"
            value={billing.address2}
            onChange={(e) => handleBillingChange('address2', e.target.value)}
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 text-white rounded-lg focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-colors"
            placeholder="Apartment, suite, etc. (optional)"
          />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-slate-300 text-sm font-medium mb-2">
              City *
            </label>
            <input
              type="text"
              value={billing.city}
              onChange={(e) => handleBillingChange('city', e.target.value)}
              className={`w-full px-3 py-2 bg-slate-800/50 border text-white rounded-lg focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-colors ${
                errors.city && touchedFields.has('city')
                  ? 'border-rose-400/50'
                  : 'border-slate-600/50 focus:border-cyan-400/50'
              }`}
              placeholder="New York"
            />
            {errors.city && touchedFields.has('city') && (
              <p className="text-rose-300 text-xs mt-1">{errors.city}</p>
            )}
          </div>
          
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              State *
            </label>
            <select
              value={billing.state}
              onChange={(e) => handleBillingChange('state', e.target.value)}
              className={`w-full px-3 py-2 bg-slate-800/50 border text-white rounded-lg focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-colors ${
                errors.state && touchedFields.has('state')
                  ? 'border-rose-400/50'
                  : 'border-slate-600/50 focus:border-cyan-400/50'
              }`}
            >
              <option value="">Select</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {errors.state && touchedFields.has('state') && (
              <p className="text-rose-300 text-xs mt-1">{errors.state}</p>
            )}
          </div>
          
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              ZIP Code *
            </label>
            <input
              type="text"
              value={billing.zip}
              onChange={(e) => handleBillingChange('zip', e.target.value)}
              className={`w-full px-3 py-2 bg-slate-800/50 border text-white rounded-lg focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-colors ${
                errors.zip && touchedFields.has('zip')
                  ? 'border-rose-400/50'
                  : 'border-slate-600/50 focus:border-cyan-400/50'
              }`}
              placeholder="10001"
            />
            {errors.zip && touchedFields.has('zip') && (
              <p className="text-rose-300 text-xs mt-1">{errors.zip}</p>
            )}
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
          <h3 className="text-lg font-semibold text-white">Payment Information</h3>
        </div>
        
        <div className="mb-4">
          <label className="block text-slate-300 text-sm font-medium mb-2">
            Card Number *
          </label>
          <input
            type="text"
            value={payment.cardNumber}
            onChange={(e) => handlePaymentChange('cardNumber', e.target.value)}
            className={`w-full px-3 py-2 bg-slate-800/50 border text-white rounded-lg focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-colors font-mono ${
              errors.cardNumber && touchedFields.has('cardNumber')
                ? 'border-rose-400/50'
                : 'border-slate-600/50 focus:border-cyan-400/50'
            }`}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
          />
          {errors.cardNumber && touchedFields.has('cardNumber') && (
            <p className="text-rose-300 text-xs mt-1">{errors.cardNumber}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-slate-300 text-sm font-medium mb-2">
            Name on Card *
          </label>
          <input
            type="text"
            value={payment.nameOnCard}
            onChange={(e) => handlePaymentChange('nameOnCard', e.target.value)}
            className={`w-full px-3 py-2 bg-slate-800/50 border text-white rounded-lg focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-colors ${
              errors.nameOnCard && touchedFields.has('nameOnCard')
                ? 'border-rose-400/50'
                : 'border-slate-600/50 focus:border-cyan-400/50'
            }`}
            placeholder="John Doe"
          />
          {errors.nameOnCard && touchedFields.has('nameOnCard') && (
            <p className="text-rose-300 text-xs mt-1">{errors.nameOnCard}</p>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Expiry Month *
            </label>
            <select
              value={payment.expiryMonth}
              onChange={(e) => handlePaymentChange('expiryMonth', e.target.value)}
              className={`w-full px-3 py-2 bg-slate-800/50 border text-white rounded-lg focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-colors ${
                errors.expiryMonth && touchedFields.has('expiryMonth')
                  ? 'border-rose-400/50'
                  : 'border-slate-600/50 focus:border-cyan-400/50'
              }`}
            >
              <option value="">MM</option>
              {Array.from({ length: 12 }, (_, i) => {
                const month = (i + 1).toString().padStart(2, '0')
                return <option key={month} value={month}>{month}</option>
              })}
            </select>
            {errors.expiryMonth && touchedFields.has('expiryMonth') && (
              <p className="text-rose-300 text-xs mt-1">{errors.expiryMonth}</p>
            )}
          </div>
          
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Expiry Year *
            </label>
            <select
              value={payment.expiryYear}
              onChange={(e) => handlePaymentChange('expiryYear', e.target.value)}
              className={`w-full px-3 py-2 bg-slate-800/50 border text-white rounded-lg focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-colors ${
                errors.expiryYear && touchedFields.has('expiryYear')
                  ? 'border-rose-400/50'
                  : 'border-slate-600/50 focus:border-cyan-400/50'
              }`}
            >
              <option value="">YY</option>
              {years.map(year => (
                <option key={year} value={year.toString().padStart(2, '0')}>
                  {year.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
            {errors.expiryYear && touchedFields.has('expiryYear') && (
              <p className="text-rose-300 text-xs mt-1">{errors.expiryYear}</p>
            )}
          </div>
          
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              CVV *
            </label>
            <input
              type="text"
              value={payment.cvv}
              onChange={(e) => handlePaymentChange('cvv', e.target.value)}
              className={`w-full px-3 py-2 bg-slate-800/50 border text-white rounded-lg focus:ring-2 focus:ring-cyan-400/20 focus:outline-none transition-colors font-mono ${
                errors.cvv && touchedFields.has('cvv')
                  ? 'border-rose-400/50'
                  : 'border-slate-600/50 focus:border-cyan-400/50'
              }`}
              placeholder="123"
              maxLength={4}
            />
            {errors.cvv && touchedFields.has('cvv') && (
              <p className="text-rose-300 text-xs mt-1">{errors.cvv}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}