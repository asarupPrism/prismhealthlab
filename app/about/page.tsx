'use client'

import React from 'react';
import { motion } from 'framer-motion';

export default function AboutPage() {
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
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent mb-4">
            About Prism Health Lab
          </h1>
          <p className="text-xl text-slate-300">
            Democratizing healthcare through accessible diagnostic testing
          </p>
        </motion.div>

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          {/* Mission */}
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-semibold text-white">Our Mission</h2>
            </div>
            <p className="text-slate-300 text-lg leading-relaxed">
              Prism Health Lab is dedicated to making healthcare more accessible and affordable through 
              direct-to-consumer diagnostic testing. We believe everyone deserves access to comprehensive 
              health insights without the barriers of traditional healthcare systems.
            </p>
          </div>

          {/* Value Proposition */}
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-semibold text-white">Why Choose Prism Health Lab</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-emerald-300 mb-3">Cost Effective</h3>
                <p className="text-slate-300">50-70% savings compared to traditional healthcare labs</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cyan-300 mb-3">Fast Results</h3>
                <p className="text-slate-300">2-3 day turnaround vs industry standard 7-14 days</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-amber-300 mb-3">CLIA Certified</h3>
                <p className="text-slate-300">Medical-grade accuracy through certified laboratory partnerships</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-rose-300 mb-3">HIPAA Compliant</h3>
                <p className="text-slate-300">Enterprise-grade security and data protection</p>
              </div>
            </div>
          </div>

          {/* Target Audience */}
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-semibold text-white">Who We Serve</h2>
            </div>
            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              We serve health-conscious individuals who want to take control of their wellness journey:
            </p>
            <ul className="space-y-3 text-slate-300">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                Fitness enthusiasts tracking performance and recovery
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                Wellness-focused professionals prioritizing preventive care
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                Budget-conscious individuals seeking quality healthcare
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                Data-driven health optimizers seeking regular monitoring
              </li>
            </ul>
          </div>

          {/* Business Model */}
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-rose-400 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-semibold text-white">Our Approach</h2>
            </div>
            <p className="text-slate-300 text-lg leading-relaxed">
              As a B2C diagnostic testing e-commerce platform, we eliminate healthcare middlemen 
              while maintaining the highest standards of medical accuracy and patient privacy. 
              Our direct-pay model means transparent pricing and faster service delivery.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}