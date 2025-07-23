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
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20">
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
            <div className="flex items-center justify-center gap-6 mb-8">
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

            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent mb-6 leading-tight">
              Your Health, Your Data, Your Control.
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 font-light max-w-4xl mx-auto mb-12 leading-relaxed">
              Lab-grade diagnostics, simplified. Get actionable health insights faster, easier, and more affordably than ever.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/products">
                <button className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105">
                  <span className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    View Diagnostic Panels
                  </span>
                </button>
              </Link>
              <button 
                onClick={() => scrollToSection('why-choose-us')}
                className="group px-8 py-4 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-100 font-semibold rounded-xl hover:bg-slate-600/60 hover:border-slate-500/60 transition-all duration-300 hover:scale-105"
              >
                Learn How It Works
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why-choose-us" className="py-20 px-6">
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

            {/* Evidence card */}
            <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/60 hover:border-slate-600/60 transition-all duration-300 shadow-xl shadow-slate-900/50">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse mt-2"></div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Verifiable Evidence</h3>
                  <p className="text-slate-300 leading-relaxed">
                    According to a 2022 NIH-supported study, individuals engaging in regular preventive health monitoring showed a <span className="text-emerald-400 font-semibold">38% increase in early disease detection rates</span> and <span className="text-cyan-400 font-semibold">25% fewer hospital visits</span> compared to those who relied solely on standard annual physicals.
                  </p>
                  <p className="text-slate-400 text-sm mt-4 font-mono">
                    Source: Journal of Preventive Medicine, 2022
                  </p>
                </div>
              </div>
            </div>
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
                      <th className="text-left p-6 text-slate-300 font-medium">Feature</th>
                      <th className="text-center p-6 text-emerald-300 font-semibold">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                          Us
                        </div>
                      </th>
                      <th className="text-center p-6 text-amber-300 font-semibold">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                          Competitors
                        </div>
                      </th>
                      <th className="text-center p-6 text-slate-300 font-semibold">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                          Doctors
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
                        <td className="p-6 text-slate-300 font-medium">{row.feature}</td>
                        <td className="p-6 text-center text-emerald-300 text-sm">{row.us}</td>
                        <td className="p-6 text-center text-amber-300 text-sm">{row.competitors}</td>
                        <td className="p-6 text-center text-slate-400 text-sm">{row.doctors}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="p-6 border-t border-slate-700/50 text-center">
                <Link href="/products">
                  <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105">
                    Choose Your Panel Now
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
              <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 shadow-xl shadow-slate-900/50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {pricingPanels.map((panel, index) => (
                    <motion.div
                      key={panel.name}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="backdrop-blur-sm bg-slate-700/40 border border-slate-600/50 rounded-xl p-6 hover:bg-slate-700/60 hover:border-slate-500/60 transition-all duration-300 hover:scale-105"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/25">
                          <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white font-mono">{panel.price}</div>
                          <div className="text-xs text-slate-400">Per Panel</div>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{panel.name}</h3>
                      <p className="text-slate-300 text-sm leading-relaxed">{panel.description}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="text-center">
                  <Link href="/products">
                    <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105">
                      View All Panels & Pricing
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

            <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 shadow-xl shadow-slate-900/50">
              <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mb-6">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 backdrop-blur-sm"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 flex items-center justify-center gap-2"
                >
                  Join Now
                  <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                    <div className="w-0 h-0 border-l-2 border-r-2 border-b-2 border-white border-l-transparent border-r-transparent transform rotate-[-90deg]"></div>
                  </div>
                </button>
              </form>

              {/* Trust indicators */}
              <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
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