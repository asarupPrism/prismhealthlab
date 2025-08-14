'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-12">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950"></div>
      
      {/* Medical indicators */}
      <div className="absolute top-8 left-8 flex items-center gap-4">
        <div className="w-3 h-3 bg-rose-400 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          {/* Error Header */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-3 h-3 bg-rose-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
            </div>
            
            {/* 404 Display */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-rose-400 via-amber-400 to-slate-400 bg-clip-text text-transparent mb-4">
                404
              </div>
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-rose-400 rounded-full"></div>
                <div className="w-2 h-2 bg-rose-400 rounded-full animate-pulse"></div>
                <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-rose-400 rounded-full"></div>
              </div>
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-rose-100 to-white bg-clip-text text-transparent mb-4">
              Page Not Found
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              The page you're looking for doesn't exist or has been moved
            </p>
          </div>

          {/* Error Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
              <h2 className="text-xl font-semibold text-white">What can you do?</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="text-left">
                <h3 className="text-lg font-semibold text-amber-300 mb-3">Popular Pages</h3>
                <ul className="space-y-2">
                  <li>
                    <Link 
                      href="/products"
                      className="text-slate-300 hover:text-amber-300 transition-colors inline-flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                      Browse Diagnostic Tests
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/portal"
                      className="text-slate-300 hover:text-cyan-300 transition-colors inline-flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                      Patient Portal
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/about"
                      className="text-slate-300 hover:text-emerald-300 transition-colors inline-flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/support"
                      className="text-slate-300 hover:text-rose-300 transition-colors inline-flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 bg-rose-400 rounded-full"></div>
                      Support Center
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div className="text-left">
                <h3 className="text-lg font-semibold text-cyan-300 mb-3">Get Help</h3>
                <ul className="space-y-2">
                  <li>
                    <Link 
                      href="/contact"
                      className="text-slate-300 hover:text-cyan-300 transition-colors inline-flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                      Contact Support
                    </Link>
                  </li>
                  <li>
                    <button 
                      onClick={() => router.back()}
                      className="text-slate-300 hover:text-emerald-300 transition-colors inline-flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                      Go Back
                    </button>
                  </li>
                  <li>
                    <div className="text-slate-300 inline-flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                      Call: 1-800-PRISM-LAB
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300"
              >
                <div className="w-2 h-2 bg-white rounded-full"></div>
                Go to Homepage
                <span className="text-white">→</span>
              </Link>
              
              <Link
                href="/products"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl transition-all duration-300"
              >
                <div className="w-2 h-2 bg-white rounded-full"></div>
                Browse Tests
                <span className="text-white">→</span>
              </Link>
            </div>
            
            <div className="mt-8 p-4 bg-gradient-to-r from-slate-800/30 to-slate-700/30 border border-slate-700/30 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-cyan-300 text-sm font-medium">Need Immediate Help?</span>
              </div>
              <p className="text-slate-300 text-sm">
                Our customer support team is available 7 days a week, 6AM-10PM EST to assist you.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}