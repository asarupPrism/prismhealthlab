import React from 'react';
import { motion } from 'framer-motion';

export default function ContactPage() {
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
            Contact Us
          </h1>
          <p className="text-xl text-slate-300">
            Get in touch with our customer support team
          </p>
        </motion.div>

        {/* Contact Options */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-8 mb-12"
        >
          {/* Phone Support */}
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <h2 className="text-xl font-semibold text-white">Phone Support</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-emerald-300 text-2xl font-bold font-mono">1-800-PRISM-LAB</p>
                <p className="text-slate-400 text-sm">(1-800-774-7652)</p>
              </div>
              <div>
                <p className="text-white font-medium">Hours</p>
                <p className="text-slate-300">7 days a week, 6AM-10PM EST</p>
              </div>
              <div className="p-3 bg-emerald-900/20 border border-emerald-700/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-emerald-300 text-sm font-medium">Available Now</span>
                </div>
                <p className="text-slate-300 text-sm">Customer support representatives are standing by</p>
              </div>
            </div>
          </div>

          {/* Email Support */}
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
              <h2 className="text-xl font-semibold text-white">Email Support</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-white font-medium">General Inquiries</p>
                <p className="text-cyan-300 font-mono">support@prismhealthlab.com</p>
              </div>
              <div>
                <p className="text-white font-medium">Medical Questions</p>
                <p className="text-cyan-300 font-mono">clinical@prismhealthlab.com</p>
              </div>
              <div>
                <p className="text-white font-medium">Response Time</p>
                <p className="text-slate-300">Within 24 hours</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
            <h2 className="text-xl font-semibold text-white">Send us a Message</h2>
          </div>
          
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-slate-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-slate-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                  placeholder="Enter your last name"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                placeholder="Enter your email address"
              />
            </div>
            
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-2">
                Subject
              </label>
              <select
                id="subject"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
              >
                <option value="">Select a topic</option>
                <option value="general">General Inquiry</option>
                <option value="orders">Order Support</option>
                <option value="results">Test Results</option>
                <option value="appointments">Appointments</option>
                <option value="technical">Technical Support</option>
                <option value="billing">Billing</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                Message
              </label>
              <textarea
                id="message"
                rows={6}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all resize-none"
                placeholder="How can we help you?"
              ></textarea>
            </div>
            
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-3"
            >
              <div className="w-2 h-2 bg-white rounded-full"></div>
              Send Message
            </button>
          </form>
        </motion.div>

        {/* Additional Information */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-rose-400 rounded-full animate-pulse"></div>
            <h2 className="text-xl font-semibold text-white">Important Information</h2>
          </div>
          <div className="space-y-4 text-slate-300">
            <p>
              <strong className="text-white">Medical Emergencies:</strong> If you are experiencing a medical emergency, 
              please call 911 or visit your nearest emergency room immediately.
            </p>
            <p>
              <strong className="text-white">Business Hours:</strong> Our customer support team is available 
              7 days a week from 6AM to 10PM EST. For urgent matters outside these hours, please leave a message 
              and we will respond as soon as possible.
            </p>
            <p>
              <strong className="text-white">Response Time:</strong> We typically respond to all inquiries 
              within 24 hours. During peak periods, response times may be slightly longer.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}