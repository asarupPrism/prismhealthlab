'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function Navigation() {
  const [isDropdownOpen, setIsDropdownOpen] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const diagnosticPanels = [
    { name: 'Performance & Recovery', href: '/products?category=performance' },
    { name: 'Wellness & Longevity', href: '/products?category=wellness' },
    { name: 'Hormone Health', href: '/products?category=hormones' },
    { name: 'Comprehensive Health', href: '/products?category=comprehensive' },
    { name: 'Sexual Health', href: '/products?category=sexual' }
  ];

  const resources = [
    { name: 'Blog', href: '/blog' },
    { name: 'Research & Studies', href: '/research' },
    { name: 'FAQs', href: '/faqs' },
    { name: 'Community', href: '/community' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-slate-950/80 border-b border-slate-700/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
              Prism Health Lab
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {/* Diagnostic Panels Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setIsDropdownOpen('panels')}
              onMouseLeave={() => setIsDropdownOpen(null)}
            >
              <button className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors font-medium">
                Diagnostic Panels
                <div className="w-0 h-0 border-l-2 border-r-2 border-t-2 border-slate-400 border-l-transparent border-r-transparent"></div>
              </button>
              
              {isDropdownOpen === 'panels' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 pt-1 w-64"
                  onMouseEnter={() => setIsDropdownOpen('panels')}
                  onMouseLeave={() => setIsDropdownOpen(null)}
                >
                  <div className="backdrop-blur-lg bg-slate-800/90 border border-slate-700/50 rounded-xl shadow-xl shadow-slate-900/50 py-2">
                    {diagnosticPanels.map((panel) => (
                      <Link
                        key={panel.name}
                        href={panel.href}
                        className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
                      >
                        <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                        <span className="text-sm font-medium">{panel.name}</span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Primary Links */}
            <Link href="/how-it-works" className="text-slate-300 hover:text-white transition-colors font-medium">
              How It Works
            </Link>
            <Link href="/pricing" className="text-slate-300 hover:text-white transition-colors font-medium">
              Pricing
            </Link>

            {/* Resources Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setIsDropdownOpen('resources')}
              onMouseLeave={() => setIsDropdownOpen(null)}
            >
              <button className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors font-medium">
                Resources
                <div className="w-0 h-0 border-l-2 border-r-2 border-t-2 border-slate-400 border-l-transparent border-r-transparent"></div>
              </button>

              {isDropdownOpen === 'resources' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 pt-1 w-48"
                  onMouseEnter={() => setIsDropdownOpen('resources')}
                  onMouseLeave={() => setIsDropdownOpen(null)}
                >
                  <div className="backdrop-blur-lg bg-slate-800/90 border border-slate-700/50 rounded-xl shadow-xl shadow-slate-900/50 py-2">
                    {resources.map((resource) => (
                      <Link
                        key={resource.name}
                        href={resource.href}
                        className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
                      >
                        <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                        <span className="text-sm font-medium">{resource.name}</span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-4">
            <Link href="/login" className="text-slate-300 hover:text-white transition-colors font-medium">
              Log In
            </Link>
            <Link href="/get-started">
              <button className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 flex items-center gap-2 min-h-[44px]">
                <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                Get Started
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-white transition-colors"
          >
            <div className="w-6 h-6 flex flex-col justify-center gap-1">
              <div className={`w-full h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
              <div className={`w-full h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></div>
              <div className={`w-full h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden backdrop-blur-sm bg-slate-800/40 border-t border-slate-700/30 mt-4 rounded-xl overflow-hidden"
            >
              <div className="py-4 space-y-1">
                {/* Mobile Diagnostic Panels */}
                <div className="px-4 py-2">
                  <div className="text-slate-400 text-sm font-semibold mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    Diagnostic Panels
                  </div>
                  <div className="ml-4 space-y-1">
                    {diagnosticPanels.map((panel) => (
                      <Link
                        key={panel.name}
                        href={panel.href}
                        className="block py-3 text-slate-300 hover:text-white transition-colors text-sm min-h-[44px] flex items-center"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {panel.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Mobile Primary Links */}
                <Link
                  href="/how-it-works"
                  className="block px-4 py-3 text-slate-300 hover:text-white transition-colors font-medium min-h-[48px] flex items-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  How It Works
                </Link>
                <Link
                  href="/pricing"
                  className="block px-4 py-3 text-slate-300 hover:text-white transition-colors font-medium min-h-[48px] flex items-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pricing
                </Link>

                {/* Mobile Resources */}
                <div className="px-4 py-2">
                  <div className="text-slate-400 text-sm font-semibold mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    Resources
                  </div>
                  <div className="ml-4 space-y-1">
                    {resources.map((resource) => (
                      <Link
                        key={resource.name}
                        href={resource.href}
                        className="block py-3 text-slate-300 hover:text-white transition-colors text-sm min-h-[44px] flex items-center"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {resource.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Mobile CTAs */}
                <div className="px-4 pt-4 pb-2 border-t border-slate-700/30 space-y-3">
                  <Link
                    href="/login"
                    className="block py-3 text-slate-300 hover:text-white transition-colors font-medium min-h-[48px] flex items-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link href="/get-started" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 min-h-[48px]">
                      <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      Get Started
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}