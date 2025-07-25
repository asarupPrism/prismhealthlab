'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cart, CartItem } from '@/lib/swell'

interface AppointmentDetails {
  selectedDate?: Date
  selectedTime?: string
  locationName?: string
  staffName?: string
  locationId?: string
}

interface CustomerInfo {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
}

interface PaymentInfo {
  cardNumber?: string
  nameOnCard?: string
}

interface OrderSummaryData {
  cart?: Cart
  appointment?: AppointmentDetails
  customer?: CustomerInfo
  payment?: PaymentInfo
  couponCode?: string
  discount?: number
}

interface DynamicOrderSummaryProps {
  data: OrderSummaryData
  className?: string
  isSticky?: boolean
  showDetailedBreakdown?: boolean
  onClose?: () => void // For mobile bottom sheet
}

export default function DynamicOrderSummary({
  data,
  className = '',
  isSticky = true,
  showDetailedBreakdown = true,
  onClose
}: DynamicOrderSummaryProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const { cart, appointment, customer, payment, couponCode, discount = 0 } = data

  // Calculate totals
  const subtotal = cart?.total || 0
  const taxes = 0 // Assuming no taxes for diagnostic tests
  const total = subtotal - discount + taxes

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section)
  }

  return (
    <motion.div
      className={`backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl shadow-xl shadow-slate-900/50 ${
        isSticky ? 'sticky top-60' : ''
      } ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-700/30">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            Order Summary
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-300 transition-colors"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <div className="w-4 h-4 bg-slate-400 rounded transform rotate-45"></div>
              </div>
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Test Items */}
        <div>
          <button
            onClick={() => toggleSection('tests')}
            className="w-full flex items-center justify-between text-left"
          >
            <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
              Diagnostic Tests ({cart?.items?.length || 0})
            </h4>
            <motion.div
              animate={{ rotate: expandedSection === 'tests' ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-slate-400"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <div className="w-0 h-0 border-l-[3px] border-r-[3px] border-b-[3px] border-slate-400 border-l-transparent border-r-transparent"></div>
              </div>
            </motion.div>
          </button>

          <AnimatePresence>
            {(expandedSection === 'tests' || !showDetailedBreakdown) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-3">
                  {cart?.items?.map((item: CartItem) => (
                    <motion.div
                      key={item.id}
                      className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 rounded-xl flex items-center justify-center flex-shrink-0">
                        <div className="w-5 h-5 bg-cyan-300/50 rounded-lg flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white leading-tight mb-1">
                          {item.product?.name || 'Diagnostic Panel'}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-slate-400">
                            Qty: {item.quantity}
                          </p>
                          <p className="text-sm font-mono text-white">
                            {formatCurrency(Number(item.price || 0))}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )) || (
                    <div className="text-center py-4 text-slate-400 text-sm">
                      No tests selected
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Appointment Details */}
        {appointment && (appointment.selectedDate || appointment.locationName) && (
          <div>
            <button
              onClick={() => toggleSection('appointment')}
              className="w-full flex items-center justify-between text-left"
            >
              <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                Appointment Details
              </h4>
              <motion.div
                animate={{ rotate: expandedSection === 'appointment' ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-slate-400"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <div className="w-0 h-0 border-l-[3px] border-r-[3px] border-b-[3px] border-slate-400 border-l-transparent border-r-transparent"></div>
                </div>
              </motion.div>
            </button>

            <AnimatePresence>
              {(expandedSection === 'appointment' || !showDetailedBreakdown) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 bg-slate-900/50 rounded-lg p-4 space-y-3">
                    {appointment.selectedDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Date:</span>
                        <span className="text-sm font-medium text-white">
                          {formatDate(appointment.selectedDate)}
                        </span>
                      </div>
                    )}
                    {appointment.selectedTime && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Time:</span>
                        <span className="text-sm font-medium text-white">
                          {appointment.selectedTime}
                        </span>
                      </div>
                    )}
                    {appointment.locationName && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Location:</span>
                        <span className="text-sm font-medium text-white">
                          {appointment.locationName}
                        </span>
                      </div>
                    )}
                    {appointment.staffName && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Staff:</span>
                        <span className="text-sm font-medium text-white">
                          {appointment.staffName}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Customer Information */}
        {customer && (customer.firstName || customer.email) && (
          <div>
            <button
              onClick={() => toggleSection('customer')}
              className="w-full flex items-center justify-between text-left"
            >
              <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                Customer Information
              </h4>
              <motion.div
                animate={{ rotate: expandedSection === 'customer' ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-slate-400"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <div className="w-0 h-0 border-l-[3px] border-r-[3px] border-b-[3px] border-slate-400 border-l-transparent border-r-transparent"></div>
                </div>
              </motion.div>
            </button>

            <AnimatePresence>
              {(expandedSection === 'customer' || !showDetailedBreakdown) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 bg-slate-900/50 rounded-lg p-4 space-y-3">
                    {(customer.firstName || customer.lastName) && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Name:</span>
                        <span className="text-sm font-medium text-white">
                          {[customer.firstName, customer.lastName].filter(Boolean).join(' ')}
                        </span>
                      </div>
                    )}
                    {customer.email && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Email:</span>
                        <span className="text-sm font-medium text-white">
                          {customer.email}
                        </span>
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Phone:</span>
                        <span className="text-sm font-medium text-white">
                          {customer.phone}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Payment Method */}
        {payment && (payment.cardNumber || payment.nameOnCard) && (
          <div>
            <button
              onClick={() => toggleSection('payment')}
              className="w-full flex items-center justify-between text-left"
            >
              <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-rose-400 rounded-full"></div>
                Payment Method
              </h4>
              <motion.div
                animate={{ rotate: expandedSection === 'payment' ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-slate-400"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <div className="w-0 h-0 border-l-[3px] border-r-[3px] border-b-[3px] border-slate-400 border-l-transparent border-r-transparent"></div>
                </div>
              </motion.div>
            </button>

            <AnimatePresence>
              {(expandedSection === 'payment' || !showDetailedBreakdown) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 bg-slate-900/50 rounded-lg p-4 space-y-3">
                    {payment.cardNumber && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Card:</span>
                        <span className="text-sm font-medium text-white font-mono">
                          ••••{payment.cardNumber.slice(-4)}
                        </span>
                      </div>
                    )}
                    {payment.nameOnCard && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Name:</span>
                        <span className="text-sm font-medium text-white">
                          {payment.nameOnCard}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Total */}
        <div className="border-t border-slate-700/50 pt-4">
          <div className="space-y-2">
            <div className="flex justify-between text-slate-300 text-sm">
              <span>Subtotal:</span>
              <span className="font-mono">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-300 text-sm">
              <span>Lab Processing:</span>
              <span>Included</span>
            </div>
            {discount > 0 && couponCode && (
              <div className="flex justify-between text-emerald-400 text-sm">
                <span>Discount ({couponCode}):</span>
                <span className="font-mono">-{formatCurrency(discount)}</span>
              </div>
            )}
            {taxes > 0 && (
              <div className="flex justify-between text-slate-300 text-sm">
                <span>Taxes:</span>
                <span className="font-mono">{formatCurrency(taxes)}</span>
              </div>
            )}
            <motion.div
              className="flex justify-between text-lg font-bold text-white border-t border-slate-700/50 pt-3"
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 0.3 }}
              key={total} // Animate when total changes
            >
              <span>Total:</span>
              <span className="text-cyan-400 font-mono">{formatCurrency(total)}</span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}