'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CouponCodeProps {
  onApplyCoupon: (code: string) => Promise<{ success: boolean; discount?: number; message?: string }>
  appliedCoupon?: string
  discount?: number
  className?: string
}

export default function CouponCode({
  onApplyCoupon,
  appliedCoupon,
  discount = 0,
  className = ''
}: CouponCodeProps) {
  const [couponCode, setCouponCode] = useState('')
  const [isApplying, setIsApplying] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [isExpanded, setIsExpanded] = useState(false)

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    
    setIsApplying(true)
    setMessage('')
    
    try {
      const result = await onApplyCoupon(couponCode.trim().toUpperCase())
      
      if (result.success) {
        setMessageType('success')
        setMessage(result.message || 'Coupon applied successfully!')
        setCouponCode('')
      } else {
        setMessageType('error')
        setMessage(result.message || 'Invalid coupon code')
      }
    } catch {
      setMessageType('error')
      setMessage('Failed to apply coupon. Please try again.')
    } finally {
      setIsApplying(false)
    }
  }

  const handleRemoveCoupon = () => {
    onApplyCoupon('') // Remove coupon by passing empty string
    setMessage('')
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const formatDiscount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-lg shadow-slate-900/30 ${className}`}
    >
      {/* Section Header */}
      <div 
        className="flex items-center justify-between cursor-pointer group"
        onClick={toggleExpanded}
      >
        <div className="flex items-center gap-3 border-l-2 border-amber-500/30 pl-4">
          <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
          <h3 className="text-lg font-semibold text-white">Coupon Code</h3>
          {appliedCoupon && discount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-medium text-emerald-300 flex items-center gap-2"
            >
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              Applied
            </motion.div>
          )}
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-6 h-6 bg-amber-400/20 border border-amber-400/30 rounded-lg flex items-center justify-center group-hover:bg-amber-400/30 transition-colors"
        >
          <div className="w-3 h-3 flex items-center justify-center">
            <div className="w-2 h-0.5 bg-amber-400"></div>
            <div className="w-0.5 h-2 bg-amber-400 absolute"></div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="pt-6">
          {/* Applied Coupon Display */}
          {appliedCoupon && discount > 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-500/10 border border-emerald-400/30 rounded-xl p-4 mb-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-400/20 border border-emerald-400/30 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-emerald-400/50 rounded flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-300">
                      {appliedCoupon}
                    </p>
                    <p className="text-xs text-emerald-400/80">
                      Discount: {formatDiscount(discount)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-emerald-400 hover:text-emerald-300 transition-colors text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          ) : (
            /* Coupon Input Form */
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    disabled={isApplying}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 hover:border-slate-500/60 transition-all duration-300 backdrop-blur-sm font-mono uppercase"
                    placeholder="Enter coupon code"
                    maxLength={20}
                  />
                </div>
                <button
                  onClick={handleApplyCoupon}
                  disabled={!couponCode.trim() || isApplying}
                  className="px-6 py-3 bg-amber-500/20 border border-amber-400/30 text-amber-300 font-medium rounded-xl hover:bg-amber-500/30 hover:border-amber-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 shadow-lg shadow-amber-500/10"
                >
                  {isApplying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin"></div>
                      Applying
                    </>
                  ) : (
                    <>
                      <div className="w-4 h-4 bg-amber-400/50 rounded flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      Apply
                    </>
                  )}
                </button>
              </div>

              {/* Message Display */}
              <AnimatePresence>
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className={`text-sm flex items-center gap-2 ${
                      messageType === 'success' 
                        ? 'text-emerald-400' 
                        : 'text-rose-400'
                    }`}
                  >
                    <div className={`w-3 h-3 ${
                      messageType === 'success' 
                        ? 'bg-emerald-400/20 border border-emerald-400/30' 
                        : 'bg-rose-400/20 border border-rose-400/30'
                    } rounded flex items-center justify-center`}>
                      <div className={`w-1 h-1 ${
                        messageType === 'success' ? 'bg-emerald-400' : 'bg-rose-400'
                      } rounded-full`}></div>
                    </div>
                    {message}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Coupon Info */}
              <div className="text-xs text-slate-400 leading-relaxed">
                <p>Enter a valid coupon code to receive a discount on your diagnostic tests.</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}