import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SupportPage() {
  const faqs = [
    {
      question: "How do I order diagnostic tests?",
      answer: "Browse our test catalog, add tests to your cart, and complete the checkout process. During checkout, you'll schedule your blood draw appointment."
    },
    {
      question: "How long does it take to get results?",
      answer: "Most test results are available within 2-3 business days after your blood draw. You'll receive a notification when results are ready."
    },
    {
      question: "Are your labs CLIA-certified?",
      answer: "Yes, all our laboratory partners are CLIA-certified, ensuring medical-grade accuracy and compliance with federal standards."
    },
    {
      question: "How do I access my test results?",
      answer: "Log into your patient portal to view, download, and share your test results securely. Results include detailed explanations and reference ranges."
    },
    {
      question: "Can I use insurance for payment?",
      answer: "We operate on a direct-pay model to keep costs low and processing fast. HSA/FSA cards are accepted for eligible expenses."
    },
    {
      question: "What should I expect during my appointment?",
      answer: "Your blood draw appointment typically takes 10-15 minutes. Our trained phlebotomists will collect samples for your ordered tests."
    }
  ];

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
            Support Center
          </h1>
          <p className="text-xl text-slate-300">
            Find answers and get help with your diagnostic testing
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          <Link
            href="/contact"
            className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 rounded-2xl p-6 hover:bg-slate-800/40 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <h3 className="text-lg font-semibold text-white">Contact Support</h3>
            </div>
            <p className="text-slate-300 text-sm mb-4">
              Get in touch with our customer support team for personalized assistance
            </p>
            <div className="flex items-center gap-2 text-emerald-300 text-sm">
              <span>Get Help</span>
              <span>→</span>
            </div>
          </Link>

          <Link
            href="/portal"
            className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 rounded-2xl p-6 hover:bg-slate-800/40 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
              <h3 className="text-lg font-semibold text-white">Patient Portal</h3>
            </div>
            <p className="text-slate-300 text-sm mb-4">
              Access your test results, appointment history, and account settings
            </p>
            <div className="flex items-center gap-2 text-cyan-300 text-sm">
              <span>Access Portal</span>
              <span>→</span>
            </div>
          </Link>

          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
              <h3 className="text-lg font-semibold text-white">Phone Support</h3>
            </div>
            <p className="text-slate-300 text-sm mb-4">
              Call our support hotline for immediate assistance
            </p>
            <div className="text-amber-300 font-mono text-lg font-bold">
              1-800-PRISM-LAB
            </div>
            <p className="text-slate-400 text-xs mt-1">7 days a week, 6AM-10PM EST</p>
          </div>
        </motion.div>

        {/* Frequently Asked Questions */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8 mb-12"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-3 h-3 bg-rose-400 rounded-full animate-pulse"></div>
            <h2 className="text-2xl font-semibold text-white">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="border-b border-slate-700/50 pb-6 last:border-b-0 last:pb-0"
              >
                <h3 className="text-lg font-semibold text-white mb-3">
                  {faq.question}
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Getting Started Guide */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            <h2 className="text-2xl font-semibold text-white">Getting Started</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Browse Tests</h3>
              <p className="text-slate-400 text-sm">
                Explore our comprehensive catalog of diagnostic tests and panels
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Order & Schedule</h3>
              <p className="text-slate-400 text-sm">
                Complete your order and schedule your blood draw appointment
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">3</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Get Results</h3>
              <p className="text-slate-400 text-sm">
                Receive your results in 2-3 days via secure patient portal
              </p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl transition-all duration-300"
            >
              <div className="w-2 h-2 bg-white rounded-full"></div>
              Start Your Health Journey
              <span className="text-white">→</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}