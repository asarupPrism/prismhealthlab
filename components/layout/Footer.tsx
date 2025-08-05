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

  // Different footer configurations for different user contexts
  const footerConfig = {
    public: {
      showAllSections: true,
      ctaText: 'Order Your First Test',
      ctaHref: '/products',
    },
    portal: {
      showAllSections: false,
      ctaText: 'Schedule Appointment',
      ctaHref: '/portal/appointments',
    },
    admin: {
      showAllSections: false,
      ctaText: 'Admin Dashboard',
      ctaHref: '/admin',
    }
  }

  const config = footerConfig[variant]

  return (
    <footer className="relative mt-24 bg-gradient-to-b from-slate-950 to-slate-900 border-t border-slate-800/50">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-transparent to-slate-800/30 pointer-events-none"></div>
      
      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-16"
        >
          {/* Primary CTA Section */}
          {config.showAllSections && (
            <motion.div variants={fadeUp} className="text-center max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
                  Take Control of Your Health Today
                </span>
              </h2>
              
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                Join thousands who trust Prism Health Lab for{' '}
                <span className="text-cyan-400 font-semibold">CLIA-certified diagnostics</span> and{' '}
                <span className="text-emerald-400 font-semibold">actionable insights</span>.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
                <Link href={config.ctaHref} className="group flex-1">
                  <button className="w-full px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105">
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      {config.ctaText}
                    </span>
                  </button>
                </Link>
                <Link href="/portal" className="group flex-1">
                  <button className="w-full px-8 py-4 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-100 font-semibold rounded-xl hover:bg-slate-600/60 hover:border-slate-500/60 transition-all duration-300 hover:scale-105">
                    Patient Portal Access
                  </button>
                </Link>
              </div>
            </motion.div>
          )}

          {/* Main Footer Grid */}
          <motion.div 
            variants={fadeUp}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8"
          >
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg"></div>
                <h3 className="text-2xl font-bold text-white">Prism Health Lab</h3>
              </div>
              
              <p className="text-slate-300 mb-6 leading-relaxed">
                Revolutionizing diagnostic testing with medical-grade precision, cutting-edge technology, 
                and personalized health insights that empower informed decisions.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span className="text-emerald-300 text-sm font-medium">CLIA-Certified Laboratory</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-cyan-300 text-sm font-medium">2-3 Day Results Guaranteed</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                  <span className="text-amber-300 text-sm font-medium">HIPAA-Compliant Security</span>
                </div>
              </div>
            </div>

            {/* Services */}
            {config.showAllSections && (
              <div>
                <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  Diagnostic Services
                </h4>
                <ul className="space-y-3">
                  {[
                    { name: 'Complete Blood Count', href: '/products' },
                    { name: 'Hormone Analysis', href: '/products' },
                    { name: 'Metabolic Panels', href: '/products' },
                    { name: 'Cardiac Markers', href: '/products' },
                    { name: 'Nutritional Assessment', href: '/products' },
                    { name: 'Custom Test Panels', href: '/products' },
                  ].map((service) => (
                    <li key={service.name}>
                      <Link 
                        href={service.href}
                        className="text-slate-300 hover:text-cyan-300 transition-colors duration-200 text-sm"
                      >
                        {service.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Patient Resources */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                {variant === 'portal' ? 'Your Account' : 'Patient Resources'}
              </h4>
              <ul className="space-y-3">
                {(variant === 'portal' ? [
                  { name: 'Dashboard', href: '/portal/dashboard' },
                  { name: 'Test Results', href: '/portal/results' },
                  { name: 'Appointments', href: '/portal/appointments' },
                  { name: 'Health Analytics', href: '/portal/analytics' },
                  { name: 'Account Settings', href: '/portal/settings' },
                  { name: 'Support Center', href: '/portal/support' },
                ] : [
                  { name: 'Patient Portal', href: '/portal' },
                  { name: 'Schedule Appointment', href: '/schedule' },
                  { name: 'Test Preparation', href: '/resources/preparation' },
                  { name: 'Understanding Results', href: '/resources/results' },
                  { name: 'Health Insights', href: '/resources/insights' },
                  { name: 'FAQ', href: '/resources/faq' },
                ]).map((resource) => (
                  <li key={resource.name}>
                    <Link 
                      href={resource.href}
                      className="text-slate-300 hover:text-emerald-300 transition-colors duration-200 text-sm"
                    >
                      {resource.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company & Support */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                {variant === 'admin' ? 'Admin Tools' : 'Company'}
              </h4>
              <ul className="space-y-3">
                {(variant === 'admin' ? [
                  { name: 'System Monitoring', href: '/admin/monitoring' },
                  { name: 'User Management', href: '/admin/users' },
                  { name: 'Order Management', href: '/admin/orders' },
                  { name: 'Analytics Dashboard', href: '/admin/analytics' },
                  { name: 'System Health', href: '/admin/health' },
                  { name: 'Documentation', href: '/admin/docs' },
                ] : [
                  { name: 'About Us', href: '/about' },
                  { name: 'Our Mission', href: '/mission' },
                  { name: 'Quality Standards', href: '/quality' },
                  { name: 'Careers', href: '/careers' },
                  { name: 'Contact Us', href: '/contact' },
                  { name: 'Support Center', href: '/support' },
                ]).map((item) => (
                  <li key={item.name}>
                    <Link 
                      href={item.href}
                      className="text-slate-300 hover:text-amber-300 transition-colors duration-200 text-sm"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Contact Information */}
          {config.showAllSections && (
            <motion.div 
              variants={fadeUp}
              className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center md:text-left">
                  <h5 className="text-lg font-semibold text-white mb-3 flex items-center justify-center md:justify-start gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    Customer Support
                  </h5>
                  <div className="space-y-2">
                    <p className="text-slate-300 text-sm">Available 7 days a week</p>
                    <p className="text-cyan-300 font-mono text-lg font-semibold">1-800-PRISM-LAB</p>
                    <p className="text-slate-400 text-sm">Monday-Sunday: 6 AM - 10 PM EST</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <h5 className="text-lg font-semibold text-white mb-3 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    Medical Inquiries
                  </h5>
                  <div className="space-y-2">
                    <p className="text-slate-300 text-sm">Clinical questions & consultations</p>
                    <p className="text-emerald-300 font-mono text-base font-semibold">medical@prismhealthlab.com</p>
                    <p className="text-slate-400 text-sm">Response within 4-6 hours</p>
                  </div>
                </div>
                
                <div className="text-center md:text-right">
                  <h5 className="text-lg font-semibold text-white mb-3 flex items-center justify-center md:justify-end gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    Emergency Results
                  </h5>
                  <div className="space-y-2">
                    <p className="text-slate-300 text-sm">Critical values & urgent alerts</p>
                    <p className="text-amber-300 font-mono text-lg font-semibold">24/7 Immediate</p>
                    <p className="text-slate-400 text-sm">Via phone, email & portal</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Bottom Bar */}
          <motion.div 
            variants={fadeUp}
            className="pt-8 border-t border-slate-800/50"
          >
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 text-sm text-slate-400">
                <p>© {currentYear} Prism Health Lab. All rights reserved.</p>
                <div className="flex items-center gap-6">
                  <Link href="/privacy" className="hover:text-slate-300 transition-colors">
                    Privacy Policy
                  </Link>
                  <Link href="/terms" className="hover:text-slate-300 transition-colors">
                    Terms of Service
                  </Link>
                  <Link href="/hipaa" className="hover:text-slate-300 transition-colors">
                    HIPAA Notice
                  </Link>
                  {variant !== 'public' && (
                    <Link href="/accessibility" className="hover:text-slate-300 transition-colors">
                      Accessibility
                    </Link>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-emerald-300 text-sm font-medium">System Status: Operational</span>
                </div>
                {variant === 'admin' && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <span className="text-cyan-300 text-sm font-medium">Admin Mode</span>
                  </div>
                )}
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