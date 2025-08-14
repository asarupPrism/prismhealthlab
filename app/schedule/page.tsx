'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SchedulePage() {
  const router = useRouter();

  // Auto-redirect after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/products');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-12">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950"></div>
      
      {/* Medical indicators */}
      <div className="absolute top-8 left-8 flex items-center gap-4">
        <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent mb-4">
              Appointment Booking
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Simplified workflow for your convenience
            </p>
          </div>

          {/* Workflow Explanation */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <h2 className="text-xl font-semibold text-white">How Our Process Works</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">1</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Choose Tests</h3>
                <p className="text-slate-400 text-sm">Select from our comprehensive diagnostic panel menu</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 0 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">2</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Complete Order</h3>
                <p className="text-slate-400 text-sm">Add to cart and proceed through secure checkout</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">3</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Book Appointment</h3>
                <p className="text-slate-400 text-sm">Schedule your blood draw during the checkout process</p>
              </motion.div>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-cyan-700/30 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-cyan-300 text-sm font-medium">Streamlined Experience</span>
              </div>
              <p className="text-slate-300 text-sm">
                Appointments are automatically scheduled when you order tests. This ensures coordination 
                between your test selection and blood draw scheduling.
              </p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <Link
              href="/products"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300"
            >
              <div className="w-2 h-2 bg-white rounded-full"></div>
              Browse Diagnostic Tests
              <span className="text-white">→</span>
            </Link>
            
            <div className="text-slate-400 text-sm">
              <p>Automatically redirecting in 5 seconds...</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}