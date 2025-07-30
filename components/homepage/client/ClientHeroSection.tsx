'use client'

/**
 * Client Hero Section Component
 * 
 * Client-only component for homepage hero with framer-motion animations.
 * Requires browser APIs (window, document) for motion animations and
 * viewport detection. Dynamically imported to avoid SSR issues.
 */

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAnimationTrigger } from '@/hooks/useViewportTrigger'
import { SECTION_PRESETS } from '@/lib/animations/variants'
import ScrollButton from '@/components/homepage/ScrollButton'

interface ClientHeroSectionProps {
  pricingPanels: Array<{
    name: string
    price: string
    description: string
  }>
}

export default function ClientHeroSection({ pricingPanels }: ClientHeroSectionProps) {
  const { ref, isInView, reducedMotion } = useAnimationTrigger({
    threshold: 0.1,
    triggerOnce: true,
  })

  return (
    <section 
      ref={ref}
      className="relative min-h-screen flex items-center justify-center px-6 py-20 -mt-16 pt-16"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-2/3 left-1/2 w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative max-w-6xl mx-auto text-center z-10">
        <motion.div
          variants={SECTION_PRESETS.hero.container}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mb-8"
        >
          <motion.h1 
            variants={SECTION_PRESETS.hero.title}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight"
          >
            Your Health,{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent animate-pulse">
              Your Data
            </span>
            , Your Control
          </motion.h1>
          
          <motion.p 
            variants={SECTION_PRESETS.hero.subtitle}
            className="text-lg md:text-xl text-slate-300 mb-12 leading-relaxed max-w-3xl mx-auto"
          >
            Lab-grade diagnostics simplified. Get actionable health insights faster, easier, and more affordably than ever—with{' '}
            <span className="text-cyan-400 font-semibold">CLIA-certified labs</span> and{' '}
            <span className="text-emerald-400 font-semibold">2–3 day results</span>.
          </motion.p>

          <motion.div 
            variants={SECTION_PRESETS.hero.cta}
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center max-w-lg mx-auto"
          >
            <Link href="/products" className="group flex-1">
              <button className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 min-h-[48px]">
                <span className="flex items-center justify-center gap-2">
                  <span className="text-sm sm:text-base">View Diagnostic Panels</span>
                </span>
              </button>
            </Link>
            <ScrollButton 
              targetId="how-it-works"
              className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-100 font-semibold rounded-xl hover:bg-slate-600/60 hover:border-slate-500/60 transition-all duration-300 hover:scale-105 min-h-[48px]"
            >
              <span className="text-sm sm:text-base">Learn How It Works</span>
            </ScrollButton>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}