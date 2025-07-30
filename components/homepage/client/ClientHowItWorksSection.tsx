'use client'

/**
 * Client How It Works Section Component
 * 
 * Client-only component with complex step animations and viewport triggers.
 * Uses framer-motion for staggered card animations and interactive hover states.
 * Requires browser APIs for intersection observer and motion calculations.
 */

import React from 'react'
import { motion } from 'framer-motion'
import { useAnimationTrigger } from '@/hooks/useViewportTrigger'
import { SECTION_PRESETS, staggerContainer, medicalDataReveal } from '@/lib/animations/variants'

const steps = [
  {
    step: "01",
    icon: "◆",
    title: "Order Your Test(s)",
    description: "Choose the diagnostic panel(s) that fit your goals and complete your secure purchase online in under two minutes.",
    color: "cyan"
  },
  {
    step: "02", 
    icon: "●",
    title: "Schedule Your Visit",
    description: "Pick a date and time that works for you at our Schaumburg, IL clinic—no insurance needed.",
    color: "emerald"
  },
  {
    step: "03",
    icon: "▲",
    title: "Get Your Sample Collected", 
    description: "A licensed phlebotomist will draw your blood quickly and professionally.",
    color: "amber"
  },
  {
    step: "04",
    icon: "■",
    title: "Receive Actionable Results",
    description: "Log in to your secure portal to view clear, personalized insights within 2–3 days.",
    color: "rose"
  }
]

export default function ClientHowItWorksSection() {
  const { ref, isInView } = useAnimationTrigger({
    threshold: 0.2,
    triggerOnce: true,
  })

  return (
    <section id="how-it-works" ref={ref} className="py-20 px-6 bg-slate-900/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <motion.div 
            variants={medicalDataReveal}
            className="border-l-2 border-blue-500/30 pl-6 mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              How It Works
            </h2>
            <p className="text-xl text-slate-300 leading-relaxed">
              Get your health insights in four simple steps—no insurance hassles, no surprise costs.
            </p>
          </motion.div>

          {/* Steps Grid */}
          <motion.div 
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                variants={medicalDataReveal}
                whileHover={{ 
                  scale: 1.02,
                  y: -5,
                  transition: { type: 'spring', stiffness: 300 }
                }}
                className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 sm:p-6 hover:bg-slate-800/60 hover:border-slate-600/60 transition-all duration-300 shadow-xl shadow-slate-900/50 relative flex flex-col h-full min-h-[280px] sm:min-h-[320px] cursor-pointer"
              >
                {/* Step Number */}
                <motion.div 
                  className={`absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-slate-950 ${
                    step.color === 'cyan' ? 'bg-cyan-400' :
                    step.color === 'emerald' ? 'bg-emerald-400' :
                    step.color === 'amber' ? 'bg-amber-400' :
                    'bg-rose-400'
                  }`}
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : { scale: 0 }}
                  transition={{ delay: index * 0.1 + 0.5, type: 'spring', stiffness: 300 }}
                >
                  {step.step}
                </motion.div>

                {/* Icon */}
                <motion.div 
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-4 sm:mb-6 ${
                    step.color === 'cyan' ? 'bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/30' :
                    step.color === 'emerald' ? 'bg-gradient-to-br from-emerald-400/20 to-green-500/20 border border-emerald-400/30' :
                    step.color === 'amber' ? 'bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/30' :
                    'bg-gradient-to-br from-rose-400/20 to-pink-500/20 border border-rose-400/30'
                  }`}
                  whileHover={{ 
                    boxShadow: step.color === 'cyan' ? '0 0 20px rgba(6, 182, 212, 0.4)' :
                               step.color === 'emerald' ? '0 0 20px rgba(16, 185, 129, 0.4)' :
                               step.color === 'amber' ? '0 0 20px rgba(245, 158, 11, 0.4)' :
                               '0 0 20px rgba(244, 63, 94, 0.4)'
                  }}
                >
                  <div className={`text-xl sm:text-2xl ${
                    step.color === 'cyan' ? 'text-cyan-300' :
                    step.color === 'emerald' ? 'text-emerald-300' :
                    step.color === 'amber' ? 'text-amber-300' :
                    'text-rose-300'
                  }`}>
                    {step.icon}
                  </div>
                </motion.div>

                {/* Content */}
                <div className="flex-1 flex flex-col">
                  <motion.h3 
                    className={`text-lg sm:text-xl font-bold mb-3 sm:mb-4 ${
                      step.color === 'cyan' ? 'text-cyan-300' :
                      step.color === 'emerald' ? 'text-emerald-300' :
                      step.color === 'amber' ? 'text-amber-300' :
                      'text-rose-300'
                    }`}
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ delay: index * 0.1 + 0.7 }}
                  >
                    {step.title}
                  </motion.h3>
                  <motion.p 
                    className="text-slate-300 text-sm sm:text-base leading-relaxed flex-1"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ delay: index * 0.1 + 0.9 }}
                  >
                    {step.description}
                  </motion.p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}