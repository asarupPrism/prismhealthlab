'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const [orderData, setOrderData] = useState<Record<string, unknown> | null>(null);
  const orderId = searchParams.get('order');

  useEffect(() => {
    // In a real implementation, you would fetch order details from Swell
    // For now, we'll simulate some order data
    if (orderId) {
      setOrderData({
        id: orderId,
        number: `PHL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        total: 149.00,
        items: [
          {
            name: 'Muscle & Performance Panel',
            price: 149.00,
            quantity: 1
          }
        ],
        email: 'customer@example.com'
      });
    }
  }, [orderId]);

  return (
    <div className="min-h-screen bg-slate-950 pt-8">
      <div className="max-w-4xl mx-auto px-6 pb-20">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-12"
        >
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="w-8 h-8 text-white font-bold text-2xl"
            >
              ✓
            </motion.div>
          </div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Order Confirmed!
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto"
          >
            Thank you for your order. Your diagnostic tests have been scheduled and we&apos;ll send you confirmation details shortly.
          </motion.p>
        </motion.div>

        {/* Order Details */}
        {orderData && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 shadow-xl shadow-slate-900/50 mb-8"
          >
            <div className="border-l-2 border-emerald-500/30 pl-6 mb-6">
              <h2 className="text-2xl font-semibold text-white mb-2">Order Details</h2>
              <p className="text-slate-300">Order #{String(orderData.number)}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Order Items */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  Diagnostic Panels Ordered
                </h3>
                <div className="space-y-3">
                  {(orderData.items as Array<Record<string, unknown>>).map((item: Record<string, unknown>, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-700/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 rounded-lg flex items-center justify-center">
                          <div className="w-5 h-5 bg-cyan-300/50 rounded flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                        <div>
                          <p className="text-white font-medium">{String(item.name)}</p>
                          <p className="text-slate-400 text-sm">Quantity: {String(item.quantity)}</p>
                        </div>
                      </div>
                      <p className="text-white font-mono">${Number(item.price).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-700/50 mt-4 pt-4">
                  <div className="flex justify-between items-center text-lg font-bold text-white">
                    <span>Total Paid:</span>
                    <span className="font-mono">${Number(orderData.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  What Happens Next?
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-slate-700/20 rounded-lg">
                    <div className="w-6 h-6 bg-cyan-400/20 border border-cyan-400/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-cyan-400 text-xs font-bold">1</span>
                    </div>
                    <div>
                      <p className="text-white font-medium mb-1">Confirmation Email</p>
                      <p className="text-slate-400 text-sm">We&apos;ll send detailed instructions to {String(orderData.email)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-slate-700/20 rounded-lg">
                    <div className="w-6 h-6 bg-emerald-400/20 border border-emerald-400/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-emerald-400 text-xs font-bold">2</span>
                    </div>
                    <div>
                      <p className="text-white font-medium mb-1">Schedule Your Visit</p>
                      <p className="text-slate-400 text-sm">Book your blood draw appointment at our Schaumburg, IL clinic</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-slate-700/20 rounded-lg">
                    <div className="w-6 h-6 bg-amber-400/20 border border-amber-400/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-amber-400 text-xs font-bold">3</span>
                    </div>
                    <div>
                      <p className="text-white font-medium mb-1">Get Your Results</p>
                      <p className="text-slate-400 text-sm">Secure access to your results within 2-3 business days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/portal" className="flex-1 sm:flex-none">
            <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 flex items-center justify-center gap-2">
              <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span>Access Patient Portal</span>
            </button>
          </Link>

          <Link href="/products" className="flex-1 sm:flex-none">
            <button className="w-full sm:w-auto px-8 py-4 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-100 font-semibold rounded-xl hover:bg-slate-600/60 hover:border-slate-500/60 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2">
              <span>Order More Tests</span>
              <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                <div className="w-0 h-0 border-l-2 border-r-2 border-b-2 border-white border-l-transparent border-r-transparent transform rotate-[-90deg]"></div>
              </div>
            </button>
          </Link>
        </motion.div>

        {/* Additional Information */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="backdrop-blur-sm bg-slate-800/20 border border-slate-700/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
              Need Help?
            </h3>
            <p className="text-slate-300 mb-4">
              Our customer support team is here to assist you with any questions about your order or testing process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-400/20 border border-emerald-400/30 rounded flex items-center justify-center">
                  <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                </div>
                <span>Email: support@prismhealthlab.com</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-cyan-400/20 border border-cyan-400/30 rounded flex items-center justify-center">
                  <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                </div>
                <span>Phone: (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-400/20 border border-amber-400/30 rounded flex items-center justify-center">
                  <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
                </div>
                <span>Hours: Mon-Fri 9AM-6PM CT</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mb-4"></div>
          <p className="text-slate-400">Loading order details...</p>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}