import React from 'react';
import { FadeIn, SlideIn, PulseIndicator } from '@/components/ui/motion';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-12">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950"></div>
      
      {/* Medical indicators */}
      <div className="absolute top-8 left-8 flex items-center gap-4">
        <PulseIndicator color="cyan" size="md" />
        <PulseIndicator color="emerald" size="sm" delay={0.5} />
        <PulseIndicator color="amber" size="sm" delay={1} />
      </div>

      <div className="relative max-w-4xl mx-auto px-6">
        {/* Header */}
        <SlideIn className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <PulseIndicator color="cyan" size="md" />
            <PulseIndicator color="emerald" size="sm" delay={0.5} />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-slate-300">
            Terms and conditions for using Prism Health Lab services
          </p>
          <p className="text-slate-400 text-sm mt-4">
            Last updated: January 2025
          </p>
        </SlideIn>

        {/* Content */}
        <FadeIn delay={0.2} className="space-y-8">
          {/* Acceptance */}
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <PulseIndicator color="emerald" size="md" />
              <h2 className="text-2xl font-semibold text-white">Acceptance of Terms</h2>
            </div>
            <div className="space-y-4 text-slate-300">
              <p>
                By accessing and using Prism Health Lab services, you accept and agree to be bound by the 
                terms and provision of this agreement. If you do not agree to abide by the above, please do 
                not use this service.
              </p>
            </div>
          </div>

          {/* Services */}
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <PulseIndicator color="cyan" size="md" />
              <h2 className="text-2xl font-semibold text-white">Our Services</h2>
            </div>
            <div className="space-y-4 text-slate-300">
              <p>
                Prism Health Lab provides direct-to-consumer diagnostic testing services through our 
                e-commerce platform. Our services include:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Online ordering of diagnostic tests</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Blood draw appointment scheduling</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Secure delivery of test results</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Patient portal access</span>
                </li>
              </ul>
            </div>
          </div>

          {/* User Responsibilities */}
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <PulseIndicator color="amber" size="md" />
              <h2 className="text-2xl font-semibold text-white">User Responsibilities</h2>
            </div>
            <div className="space-y-4 text-slate-300">
              <p>By using our services, you agree to:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Provide accurate and complete information</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Maintain the confidentiality of your account</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Follow all pre-test preparation instructions</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Consult with healthcare providers regarding test results</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Medical Disclaimer */}
          <div className="backdrop-blur-sm bg-slate-800/30 border border-red-700/30 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <PulseIndicator color="rose" size="md" />
              <h2 className="text-2xl font-semibold text-white">Medical Disclaimer</h2>
            </div>
            <div className="space-y-4 text-slate-300">
              <div className="p-4 bg-gradient-to-r from-rose-900/20 to-red-900/20 border border-rose-700/30 rounded-xl">
                <p className="text-rose-200 font-medium mb-2">Important Medical Notice</p>
                <p className="text-slate-300 text-sm">
                  Our diagnostic tests are for informational purposes only and do not constitute medical advice, 
                  diagnosis, or treatment. Always consult with a qualified healthcare provider regarding any 
                  health concerns or test results.
                </p>
              </div>
              <p>
                Prism Health Lab does not provide medical consultations, diagnoses, or treatment recommendations. 
                Test results should be reviewed with your healthcare provider for proper interpretation and 
                medical guidance.
              </p>
            </div>
          </div>

          {/* Limitation of Liability */}
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <PulseIndicator color="rose" size="md" />
              <h2 className="text-2xl font-semibold text-white">Limitation of Liability</h2>
            </div>
            <div className="space-y-4 text-slate-300">
              <p>
                Prism Health Lab's liability is limited to the cost of the diagnostic tests ordered. 
                We are not liable for any indirect, incidental, or consequential damages arising from 
                the use of our services.
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <PulseIndicator color="cyan" size="md" />
              <h2 className="text-2xl font-semibold text-white">Questions</h2>
            </div>
            <div className="space-y-4 text-slate-300">
              <p>
                If you have any questions about these Terms of Service, please contact us at 
                legal@prismhealthlab.com or call 1-800-PRISM-LAB.
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}