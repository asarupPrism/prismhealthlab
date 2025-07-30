'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'

export default function EmailSignup() {
  const [email, setEmail] = useState('')

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle email submission
    console.log('Email submitted:', email)
    setEmail('')
  }

  return (
    <section className="py-20 px-6 bg-slate-900/30">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="border-l-2 border-amber-500/30 pl-6 mb-12 text-left max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Stay Ahead of Your Health
            </h2>
            <p className="text-xl text-slate-300 leading-relaxed">
              Sign up to get health tips, exclusive discounts, and insights straight to your inbox.
            </p>
          </div>

          <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl shadow-slate-900/50">
            <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-lg mx-auto mb-6">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 backdrop-blur-sm min-h-[48px] text-sm sm:text-base"
                required
                aria-label="Email address"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 flex items-center justify-center gap-2 min-h-[48px] whitespace-nowrap"
                aria-label="Join newsletter"
              >
                <span className="text-sm sm:text-base">Join Now</span>
                <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                  <div className="w-0 h-0 border-l-2 border-r-2 border-b-2 border-white border-l-transparent border-r-transparent transform rotate-[-90deg]"></div>
                </div>
              </button>
            </form>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span>Privacy guaranteed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span>No spam</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span>Unsubscribe anytime</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}