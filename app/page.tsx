'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface PricingPanel {
  name: string;
  price: string;
  description: string;
}

const pricingPanels: PricingPanel[] = [
  {
    name: 'Routine Self-care Panel',
    price: '$59',
    description: 'Essential health monitoring for general wellness'
  },
  {
    name: 'General Hormone Panel', 
    price: '$89',
    description: 'Comprehensive hormone tracking for optimal balance'
  },
  {
    name: 'Longevity & Wellness',
    price: '$99', 
    description: 'Proactive health management and disease prevention'
  },
  {
    name: 'Male/Female Hormone Panel',
    price: '$99',
    description: 'Gender-specific hormone optimization and safety'
  },
  {
    name: 'Comprehensive Health',
    price: '$119',
    description: 'Complete health assessment with multiple biomarkers'
  },
  {
    name: 'Muscle & Performance',
    price: '$149',
    description: 'Athletic performance and recovery optimization'
  }
];

export default function HomePage() {
  const [email, setEmail] = useState('');

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email submission
    console.log('Email submitted:', email);
    setEmail('');
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20 -mt-16 pt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950"></div>
        
        {/* Background medical indicators */}
        <div className="absolute top-8 left-8 flex items-center gap-4">
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="relative max-w-6xl mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-slate-300 text-sm font-medium">CLIA-certified labs</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-slate-300 text-sm font-medium">2-3 day results</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                <span className="text-slate-300 text-sm font-medium">Save 50-70%</span>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent mb-6 leading-tight">
              Your Health, Your Data, Your Control.
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-slate-300 font-light max-w-4xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4">
              Lab-grade diagnostics, simplified. Get actionable health insights faster, easier, and more affordably than ever.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4">
              <Link href="/products" className="w-full sm:w-auto">
                <button className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 min-h-[48px]">
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-sm sm:text-base">View Diagnostic Panels</span>
                  </span>
                </button>
              </Link>
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-100 font-semibold rounded-xl hover:bg-slate-600/60 hover:border-slate-500/60 transition-all duration-300 hover:scale-105 min-h-[48px]"
              >
                <span className="text-sm sm:text-base">Learn How It Works</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why-choose-us" className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="border-l-2 border-cyan-500/30 pl-6 mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Democratizing Diagnostics for Everyone
              </h2>
              
              <p className="text-xl text-slate-300 leading-relaxed mb-8">
                Health outcomes improve when you regularly track and optimize your own health. Studies consistently show that proactive, self-directed monitoring leads to earlier detection, smarter interventions, and a longer, healthier life. We&apos;re putting this power directly into your hands.
              </p>
            </div>

            {/* Verifiable evidence cards grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* First evidence card */}
              <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/60 hover:border-slate-600/60 transition-all duration-300 shadow-xl shadow-slate-900/50">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse mt-1.5"></div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Early Detection Impact</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Regular preventive monitoring showed a <span className="text-emerald-400 font-semibold">38% increase in early disease detection</span> and <span className="text-cyan-400 font-semibold">25% fewer hospital visits</span> compared to annual physicals only.
                    </p>
                    <p className="text-slate-400 text-xs mt-3 font-mono">
                      Journal of Preventive Medicine, 2022
                    </p>
                  </div>
                </div>
              </div>

              {/* Second evidence card */}
              <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/60 hover:border-slate-600/60 transition-all duration-300 shadow-xl shadow-slate-900/50">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse mt-1.5"></div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Blood Pressure Control</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      In the ADAMPA trial (219 patients), home self-monitoring with patient-led medication titration reduced systolic BP by <span className="text-cyan-400 font-semibold">3.4 mm Hg</span> with no increase in healthcare use.
                    </p>
                    <p className="text-slate-400 text-xs mt-3 font-mono">
                      JAMA Network
                    </p>
                  </div>
                </div>
              </div>

              {/* Third evidence card */}
              <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/60 hover:border-slate-600/60 transition-all duration-300 shadow-xl shadow-slate-900/50">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse mt-1.5"></div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Life-Saving Monitoring</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      A Cochrane review (28 trials, 8,950 participants) found patient self-monitoring of anticoagulation <span className="text-amber-400 font-semibold">halved thromboembolic events</span> and <span className="text-emerald-400 font-semibold">reduced mortality</span>.
                    </p>
                    <p className="text-slate-400 text-xs mt-3 font-mono">
                      Cochrane Database
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="border-l-2 border-blue-500/30 pl-6 mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                How It Works
              </h2>
              <p className="text-xl text-slate-300 leading-relaxed">
                Get your health insights in four simple steps—no insurance hassles, no surprise costs.
              </p>
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {[
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
              ].map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 sm:p-6 hover:bg-slate-800/60 hover:border-slate-600/60 transition-all duration-300 shadow-xl shadow-slate-900/50 relative flex flex-col h-full min-h-[280px] sm:min-h-[320px]"
                >
                  {/* Step Number */}
                  <div className={`absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-slate-950 ${
                    step.color === 'cyan' ? 'bg-cyan-400' :
                    step.color === 'emerald' ? 'bg-emerald-400' :
                    step.color === 'amber' ? 'bg-amber-400' :
                    'bg-rose-400'
                  }`}>
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-4 sm:mb-6 ${
                    step.color === 'cyan' ? 'bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/30' :
                    step.color === 'emerald' ? 'bg-gradient-to-br from-emerald-400/20 to-green-500/20 border border-emerald-400/30' :
                    step.color === 'amber' ? 'bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-400/30' :
                    'bg-gradient-to-br from-rose-400/20 to-pink-500/20 border border-rose-400/30'
                  }`}>
                    <div className={`text-xl sm:text-2xl ${
                      step.color === 'cyan' ? 'text-cyan-300' :
                      step.color === 'emerald' ? 'text-emerald-300' :
                      step.color === 'amber' ? 'text-amber-300' :
                      'text-rose-300'
                    }`}>
                      {step.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-grow">
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 min-h-[2.5rem] sm:min-h-[3rem] flex items-center leading-tight">{step.title}</h3>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed min-h-[4rem] sm:min-h-[4.5rem]">{step.description}</p>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-2 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-700/30">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${
                      step.color === 'cyan' ? 'bg-cyan-400' :
                      step.color === 'emerald' ? 'bg-emerald-400' :
                      step.color === 'amber' ? 'bg-amber-400' :
                      'bg-rose-400'
                    }`}></div>
                    <span className="text-xs text-slate-400">Step {step.step}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Link href="/products">
                <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105">
                  Start Your Health Journey
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Compare the Difference Section */}
      <section className="py-20 px-6 bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="border-l-2 border-blue-500/30 pl-6 mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                How We Stack Up Against the Alternatives
              </h2>
            </div>

            {/* Comparison table */}
            <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl shadow-slate-900/50">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="text-left p-3 sm:p-6 text-slate-300 font-medium text-sm sm:text-base">Feature</th>
                      <th className="text-center p-3 sm:p-6 text-emerald-300 font-semibold">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                          <span className="text-xs sm:text-sm">Us</span>
                        </div>
                      </th>
                      <th className="text-center p-3 sm:p-6 text-amber-300 font-semibold">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                          <span className="text-xs sm:text-sm">Competitors</span>
                        </div>
                      </th>
                      <th className="text-center p-3 sm:p-6 text-slate-300 font-semibold">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                          <span className="text-xs sm:text-sm">Doctors</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        feature: "Speed & Convenience",
                        us: "Same-day testing, results in days",
                        competitors: "Kits take 1-2 weeks",
                        doctors: "Appointment needed, limited hours"
                      },
                      {
                        feature: "Price Transparency", 
                        us: "Clear, upfront pricing (starting at $59)",
                        competitors: "Hidden fees, complex pricing",
                        doctors: "Surprise costs, insurance hassles"
                      },
                      {
                        feature: "Actionable Results",
                        us: "Personalized, actionable insights", 
                        competitors: "General results, little guidance",
                        doctors: "Often clinical, hard to interpret"
                      },
                      {
                        feature: "Subscription Savings",
                        us: "Yes, quarterly monitoring discounts",
                        competitors: "Rarely offered", 
                        doctors: "Typically unavailable"
                      },
                      {
                        feature: "Direct Access to Data",
                        us: "Own your health data, easy dashboard access",
                        competitors: "Limited control or access",
                        doctors: "Often restricted or delayed"
                      }
                    ].map((row, index) => (
                      <tr key={index} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                        <td className="p-3 sm:p-6 text-slate-300 font-medium text-sm sm:text-base">{row.feature}</td>
                        <td className="p-3 sm:p-6 text-center text-emerald-300 text-xs sm:text-sm">{row.us}</td>
                        <td className="p-3 sm:p-6 text-center text-amber-300 text-xs sm:text-sm">{row.competitors}</td>
                        <td className="p-3 sm:p-6 text-center text-slate-400 text-xs sm:text-sm">{row.doctors}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="p-4 sm:p-6 border-t border-slate-700/50 text-center">
                <Link href="/products" className="inline-block w-full sm:w-auto">
                  <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 min-h-[48px]">
                    <span className="text-sm sm:text-base">Choose Your Panel Now</span>
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Affordable Pricing Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="border-l-2 border-emerald-500/30 pl-6 mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Premium Diagnostics, Without the Premium Price
              </h2>
            </div>

            {/* Pricing carousel */}
            <div className="relative">
              <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl shadow-slate-900/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  {pricingPanels.map((panel, index) => (
                    <motion.div
                      key={panel.name}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="backdrop-blur-sm bg-slate-700/40 border border-slate-600/50 rounded-xl p-4 sm:p-6 hover:bg-slate-700/60 hover:border-slate-500/60 transition-all duration-300 hover:scale-105 min-h-[180px] sm:min-h-[200px]"
                    >
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/25">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded flex items-center justify-center">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl sm:text-2xl font-bold text-white font-mono">{panel.price}</div>
                          <div className="text-xs text-slate-400">Per Panel</div>
                        </div>
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-2 leading-tight">{panel.name}</h3>
                      <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{panel.description}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="text-center">
                  <Link href="/products" className="inline-block w-full sm:w-auto">
                    <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 min-h-[48px]">
                      <span className="text-sm sm:text-base">View All Panels & Pricing</span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Join Our Health Community Section */}
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
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 flex items-center justify-center gap-2 min-h-[48px] whitespace-nowrap"
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

      {/* Footer Section */}
      <footer className="py-16 px-6 border-t border-slate-700/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Logo & Mission */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Prism Health Lab</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Empowering your health through transparency and actionable insights.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                Quick Links
              </h4>
              <div className="space-y-3">
                {['Diagnostic Panels', 'How It Works', 'Pricing', 'FAQs'].map((link) => (
                  <div key={link}>
                    <a href="#" className="text-slate-400 hover:text-slate-300 transition-colors text-sm">
                      {link}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                Resources
              </h4>
              <div className="space-y-3">
                {['Blog', 'Research & Studies', 'Health Guides', 'Community'].map((link) => (
                  <div key={link}>
                    <a href="#" className="text-slate-400 hover:text-slate-300 transition-colors text-sm">
                      {link}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Support & Legal */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                Support & Legal
              </h4>
              <div className="space-y-3">
                {['Contact Us', 'Privacy Policy', 'Terms of Service', 'HIPAA Compliance'].map((link) => (
                  <div key={link}>
                    <a href="#" className="text-slate-400 hover:text-slate-300 transition-colors text-sm">
                      {link}
                    </a>
                  </div>
                ))}
                <div>
                  <Link href="/login?redirect=/admin" className="text-slate-400 hover:text-cyan-300 transition-colors text-sm">
                    Admin Portal
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom section */}
          <div className="pt-8 border-t border-slate-700/50 flex flex-col md:flex-row justify-between items-center">
            <div className="text-slate-500 text-sm mb-4 md:mb-0">
              © 2025 Prism Health Lab. All rights reserved.
            </div>
            
            {/* Social links */}
            <div className="flex items-center gap-6">
              {['LinkedIn', 'Instagram', 'Facebook', 'Twitter'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-slate-400 hover:text-slate-300 transition-colors text-sm flex items-center gap-2"
                >
                  <div className="w-3 h-3 bg-slate-600 rounded-sm"></div>
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}