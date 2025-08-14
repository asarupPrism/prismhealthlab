import React from 'react';
import { motion } from 'framer-motion';

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-xl text-slate-300">
            How we protect and handle your personal information
          </p>
          <p className="text-slate-400 text-sm mt-4">
            Last updated: January 2025
          </p>
        </motion.div>

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          {/* Overview */}
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-semibold text-white">Privacy Overview</h2>
            </div>
            <div className="space-y-4 text-slate-300">
              <p>
                At Prism Health Lab, protecting your privacy and the security of your health information 
                is our highest priority. This Privacy Policy explains how we collect, use, and protect 
                your personal and health information in compliance with HIPAA and other applicable privacy laws.
              </p>
              <div className="p-4 bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 border border-emerald-700/30 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-emerald-300 text-sm font-medium">HIPAA Compliant</span>
                </div>
                <p className="text-slate-300 text-sm">
                  We maintain strict compliance with HIPAA regulations for all health information processing and storage.
                </p>
              </div>
            </div>
          </div>

          {/* Information We Collect */}
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-semibold text-white">Information We Collect</h2>
            </div>
            <div className="space-y-6 text-slate-300">
              <div>
                <h3 className="text-lg font-semibold text-cyan-300 mb-3">Personal Information</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Name, email address, phone number, and date of birth</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Billing and shipping addresses</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Payment information (processed securely by third-party processors)</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-emerald-300 mb-3">Health Information</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Test results and laboratory data</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Medical history relevant to testing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Appointment and scheduling information</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* How We Use Your Information */}
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-semibold text-white">How We Use Your Information</h2>
            </div>
            <div className="space-y-4 text-slate-300">
              <p>We use your information solely for the following purposes:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong className="text-white">Service Delivery:</strong> Processing test orders, scheduling appointments, and delivering results</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong className="text-white">Communication:</strong> Sending appointment reminders, result notifications, and support responses</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong className="text-white">Account Management:</strong> Maintaining your patient portal and order history</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong className="text-white">Legal Compliance:</strong> Meeting regulatory requirements and responding to lawful requests</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Data Security */}
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-rose-400 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-semibold text-white">Data Security</h2>
            </div>
            <div className="space-y-4 text-slate-300">
              <p>We implement enterprise-grade security measures to protect your information:</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-rose-300 mb-3">Technical Safeguards</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-rose-400 rounded-full"></div>
                      <span>End-to-end encryption</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-rose-400 rounded-full"></div>
                      <span>Secure data transmission (TLS)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-rose-400 rounded-full"></div>
                      <span>Multi-factor authentication</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-cyan-300 mb-3">Administrative Safeguards</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                      <span>Access controls and monitoring</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                      <span>Staff training and agreements</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                      <span>Regular security audits</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Your Rights */}
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-semibold text-white">Your Privacy Rights</h2>
            </div>
            <div className="space-y-4 text-slate-300">
              <p>You have the following rights regarding your personal information:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong className="text-white">Access:</strong> Request access to your personal information</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong className="text-white">Correction:</strong> Request correction of inaccurate information</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong className="text-white">Deletion:</strong> Request deletion of your information (subject to legal requirements)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong className="text-white">Portability:</strong> Request a copy of your information in a portable format</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Information */}
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-semibold text-white">Contact Us</h2>
            </div>
            <div className="space-y-4 text-slate-300">
              <p>
                If you have any questions about this Privacy Policy or wish to exercise your privacy rights, 
                please contact us:
              </p>
              <div className="space-y-2">
                <p><strong className="text-white">Email:</strong> privacy@prismhealthlab.com</p>
                <p><strong className="text-white">Phone:</strong> 1-800-PRISM-LAB</p>
                <p><strong className="text-white">Mail:</strong> Privacy Officer, Prism Health Lab</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}