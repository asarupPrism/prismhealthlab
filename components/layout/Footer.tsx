'use client'

/**
 * Medical-Grade Footer Component
 * 
 * Industry best-in-class footer following the Prism Health Lab design system.
 * Serves potential clients, current patients, and admin users with appropriate
 * information architecture and medical-grade styling.
 */

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer } from '@/lib/animations/variants'

interface FooterProps {
  variant?: 'public' | 'portal' | 'admin'
}

export default function Footer({ variant = 'public' }: FooterProps) {
  const currentYear = new Date().getFullYear()

  // Note: config logic simplified - now handled inline with variant checks

  return (
    <footer className="relative mt-24 bg-gradient-to-b from-slate-950 to-slate-900 border-t border-slate-800/50">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-transparent to-slate-800/30 pointer-events-none"></div>
      
      <div className="relative max-w-7xl mx-auto px-6 py-12">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-8"
        >
          {/* Main Footer Grid */}
          <motion.div 
            variants={fadeUp}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
          >
            {/* Brand & Trust Section */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <motion.div 
                  className="flex space-x-1"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </motion.div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
                  Prism Health Lab
                </h3>
              </div>
              
              <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                Medical-grade diagnostics with CLIA certification and HIPAA compliance.
              </p>
              
              {/* Trust Indicators */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-emerald-300 text-xs font-medium">CLIA-Certified Laboratory</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <span className="text-cyan-300 text-xs font-medium">HIPAA-Compliant Security</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                  <span className="text-amber-300 text-xs font-medium">System Operational</span>
                </div>
              </div>
            </div>

            {/* Essential Links - Context Aware */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                {variant === 'portal' ? 'Your Account' : variant === 'admin' ? 'Admin Tools' : 'Essential Links'}
              </h4>
              <ul className="space-y-2">
                {(variant === 'portal' ? [
                  { name: 'Dashboard', href: '/portal' },
                  { name: 'My Results', href: '/portal/results' },
                  { name: 'Appointments', href: '/portal/appointments' },
                  { name: 'Order More Tests', href: '/products' },
                ] : variant === 'admin' ? [
                  { name: 'System Monitoring', href: '/admin/monitoring' },
                  { name: 'User Management', href: '/admin/users' },
                  { name: 'Order Management', href: '/admin/orders' },
                  { name: 'Documentation', href: '/admin/docs' },
                ] : [
                  { name: 'Browse Tests', href: '/products' },
                  { name: 'Book Appointment', href: '/schedule' },
                  { name: 'Patient Portal', href: '/portal' },
                  { name: 'Support', href: '/support' },
                  { name: 'Admin Portal', href: '/login?redirect=/admin' },
                ]).map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-slate-300 hover:text-emerald-300 transition-colors duration-200 text-sm flex items-center gap-2"
                    >
                      <div className="w-1 h-1 bg-emerald-400/50 rounded-full"></div>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company & Contact */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                {variant === 'admin' ? 'System Status' : 'Company'}
              </h4>
              
              {variant === 'admin' ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-emerald-300 text-xs font-medium">Admin Mode Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <span className="text-cyan-300 text-xs font-medium">System Operational</span>
                  </div>
                </div>
              ) : (
                <ul className="space-y-2">
                  {[
                    { name: 'About Us', href: '/about' },
                    { name: 'Careers', href: '/careers' },
                    { name: 'Contact', href: '/contact' },
                  ].map((item) => (
                    <li key={item.name}>
                      <Link 
                        href={item.href}
                        className="text-slate-300 hover:text-amber-300 transition-colors duration-200 text-sm flex items-center gap-2"
                      >
                        <div className="w-1 h-1 bg-amber-400/50 rounded-full"></div>
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              
              {/* Quick Contact */}
              {variant !== 'admin' && (
                <div className="mt-6 p-4 backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <span className="text-cyan-300 text-xs font-semibold">Customer Support</span>
                  </div>
                  <p className="text-white font-mono text-sm font-bold">1-800-PRISM-LAB</p>
                  <p className="text-slate-400 text-xs">7 days a week, 6AM-10PM EST</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Simplified Bottom Bar */}
          <motion.div 
            variants={fadeUp}
            className="pt-6 border-t border-slate-800/50"
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-slate-400">
                <p>© {currentYear} Prism Health Lab. All rights reserved.</p>
                <div className="flex items-center gap-4">
                  <Link href="/privacy" className="hover:text-slate-300 transition-colors">
                    Privacy
                  </Link>
                  <Link href="/terms" className="hover:text-slate-300 transition-colors">
                    Terms
                  </Link>
                  <Link href="/hipaa" className="hover:text-slate-300 transition-colors">
                    HIPAA
                  </Link>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-300 text-xs font-medium">
                  {variant === 'admin' ? 'Admin Mode Active' : 'System Operational'}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  )
}

// Specialized footer variants for different contexts
export function PublicFooter() {
  return <Footer variant="public" />
}

export function PortalFooter() {
  return <Footer variant="portal" />
}

export function AdminFooter() {
  return <Footer variant="admin" />
}