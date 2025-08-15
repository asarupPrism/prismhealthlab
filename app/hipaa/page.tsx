'use client'

import React from 'react';
import { motion } from 'framer-motion';

export default function HipaaPage() {
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
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent mb-4">
            HIPAA Notice of Privacy Practices
          </h1>
          <p className="text-xl text-slate-300">
            Your health information privacy rights and how we protect them
          </p>
          <p className="text-slate-400 text-sm mt-4">
            Effective Date: January 2025
          </p>
        </motion.div>

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          {/* HIPAA Compliance */}
          <div className="backdrop-blur-sm bg-slate-800/30 border border-emerald-700/30 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-semibold text-white">HIPAA Compliance Commitment</h2>
            </div>
            <div className="space-y-4 text-slate-300">
              <div className="p-4 bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border border-emerald-700/30 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-emerald-300 text-sm font-medium">HIPAA Covered Entity</span>
                </div>
                <p className="text-slate-300 text-sm">
                  Prism Health Lab is a HIPAA covered entity committed to protecting your Protected Health Information (PHI) 
                  in accordance with federal privacy regulations.
                </p>
              </div>
              <p>
                This notice describes how medical information about you may be used and disclosed and how you can 
                get access to this information. Please review it carefully. We are required by law to maintain 
                the privacy of your health information and to provide you with this notice.
              </p>
            </div>
          </div>

          {/* Protected Health Information */}
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-semibold text-white">Protected Health Information (PHI)</h2>
            </div>
            <div className="space-y-4 text-slate-300">
              <p>
                Protected Health Information includes any individually identifiable health information that we 
                collect, create, receive, or maintain about you. This includes:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-cyan-300 mb-3">Medical Information</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Laboratory test results</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Test orders and requisitions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Medical history information</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-emerald-300 mb-3">Personal Information</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Name, address, phone numbers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Date of birth and demographics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Insurance and payment information</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Permitted Uses */}
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-semibold text-white">How We Use Your Health Information</h2>
            </div>
            <div className="space-y-6 text-slate-300">
              <div>
                <h3 className="text-lg font-semibold text-amber-300 mb-3">Treatment</h3>
                <p className="text-sm">
                  We may use your health information to provide, coordinate, or manage your diagnostic testing services.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cyan-300 mb-3">Payment</h3>
                <p className="text-sm">
                  We may use and disclose your health information to obtain payment for services we provide to you.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-emerald-300 mb-3">Healthcare Operations</h3>
                <p className="text-sm">
                  We may use and disclose your health information for our healthcare operations, including quality 
                  assessment and improvement activities.
                </p>
              </div>
            </div>
          </div>

          {/* Your Rights */}
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-rose-400 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-semibold text-white">Your HIPAA Rights</h2>
            </div>
            <div className="space-y-4 text-slate-300">
              <p>You have the following rights regarding your Protected Health Information:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-rose-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong className="text-white">Right to Access:</strong> You have the right to inspect and copy 
                    your health information
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-rose-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong className="text-white">Right to Amend:</strong> You have the right to request amendments 
                    to your health information
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-rose-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong className="text-white">Right to Restrict:</strong> You have the right to request restrictions 
                    on uses and disclosures
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-rose-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong className="text-white">Right to Accounting:</strong> You have the right to receive an 
                    accounting of disclosures
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-rose-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong className="text-white">Right to Complain:</strong> You have the right to file a complaint 
                    about our privacy practices
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Security Measures */}
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-semibold text-white">Security Safeguards</h2>
            </div>
            <div className="space-y-4 text-slate-300">
              <p>We maintain appropriate administrative, physical, and technical safeguards to protect your PHI:</p>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-cyan-300 mb-3">Administrative</h3>
                  <ul className="space-y-1 text-sm">
                    <li>Staff training programs</li>
                    <li>Access management</li>
                    <li>Security policies</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-emerald-300 mb-3">Physical</h3>
                  <ul className="space-y-1 text-sm">
                    <li>Secure facilities</li>
                    <li>Controlled access</li>
                    <li>Device protection</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-300 mb-3">Technical</h3>
                  <ul className="space-y-1 text-sm">
                    <li>Data encryption</li>
                    <li>Access controls</li>
                    <li>Audit logging</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Contact for Privacy */}
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-semibold text-white">Privacy Officer Contact</h2>
            </div>
            <div className="space-y-4 text-slate-300">
              <p>
                For questions about this notice or to exercise your HIPAA rights, contact our Privacy Officer:
              </p>
              <div className="space-y-2">
                <p><strong className="text-white">Email:</strong> privacy@prismhealthlab.com</p>
                <p><strong className="text-white">Phone:</strong> 1-800-PRISM-LAB</p>
                <p><strong className="text-white">Mail:</strong> Privacy Officer, Prism Health Lab</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 border border-emerald-700/30 rounded-xl">
                <p className="text-emerald-300 text-sm font-medium mb-1">No Retaliation Policy</p>
                <p className="text-slate-300 text-sm">
                  We will not retaliate against you for filing a complaint or exercising your HIPAA rights.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}