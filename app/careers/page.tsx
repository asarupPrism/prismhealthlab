import React from 'react';
import { FadeIn, SlideIn, PulseIndicator, GlassCard } from '@/components/ui/motion';

export default function CareersPage() {
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
        <SlideIn className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent mb-4">
            Join Our Team
          </h1>
          <p className="text-xl text-slate-300">
            Help us democratize healthcare through innovative diagnostic solutions
          </p>
        </SlideIn>

        {/* Mission */}
        <GlassCard delay={0.2} className="p-8 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            <h2 className="text-2xl font-semibold text-white">Why Prism Health Lab?</h2>
          </div>
          <div className="space-y-4 text-slate-300">
            <p>
              We're on a mission to make healthcare more accessible and affordable. Join a team that's 
              revolutionizing the diagnostic testing industry through technology, innovation, and a 
              commitment to patient-centered care.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="text-lg font-semibold text-emerald-300 mb-3">Impact</h3>
                <p className="text-sm">Make a difference in people's health journeys every day</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-cyan-300 mb-3">Innovation</h3>
                <p className="text-sm">Work with cutting-edge healthcare technology and processes</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-amber-300 mb-3">Growth</h3>
                <p className="text-sm">Develop your career in a fast-growing company</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-rose-300 mb-3">Culture</h3>
                <p className="text-sm">Join a collaborative, mission-driven team</p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Open Positions */}
        <GlassCard delay={0.4} className="p-8 mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
            <h2 className="text-2xl font-semibold text-white">Current Opportunities</h2>
          </div>
          
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-6 bg-slate-700/50 rounded-2xl flex items-center justify-center">
              <div className="w-8 h-8 relative">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse absolute top-2 left-2" style={{animationDelay: '0.3s'}}></div>
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse absolute top-4 left-1" style={{animationDelay: '0.6s'}}></div>
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">We're Growing!</h3>
            <p className="text-slate-300 mb-6">
              We're actively expanding our team. Check back soon for new opportunities or reach out 
              to learn about upcoming positions.
            </p>
            <div className="space-y-4">
              <div className="backdrop-blur-sm bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-emerald-300 mb-2">Areas of Interest</h4>
                <div className="grid md:grid-cols-2 gap-3 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                    <span>Software Engineering</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                    <span>Clinical Operations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                    <span>Customer Success</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-rose-400 rounded-full"></div>
                    <span>Product Management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                    <span>Laboratory Operations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                    <span>Data Analysis</span>
                  </div>
                </div>
              </div>
              
              <button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                Join Our Talent Network
                <span className="text-white">→</span>
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Benefits */}
        <GlassCard delay={0.6} className="p-8 mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
            <h2 className="text-2xl font-semibold text-white">Benefits & Perks</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-amber-300 mb-4">Health & Wellness</h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                  <span>Comprehensive health insurance</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                  <span>Free diagnostic testing</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                  <span>Mental health support</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                  <span>Wellness programs</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-cyan-300 mb-4">Work-Life Balance</h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                  <span>Flexible work arrangements</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                  <span>Generous PTO policy</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                  <span>Professional development budget</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                  <span>Remote work options</span>
                </li>
              </ul>
            </div>
          </div>
        </GlassCard>

        {/* Contact */}
        <GlassCard delay={0.8} className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-rose-400 rounded-full animate-pulse"></div>
            <h2 className="text-2xl font-semibold text-white">Get in Touch</h2>
          </div>
          <div className="space-y-4 text-slate-300">
            <p>
              Interested in joining our team? We'd love to hear from you! Send us your resume and 
              a note about what interests you about Prism Health Lab.
            </p>
            <div className="space-y-2">
              <p><strong className="text-white">Email:</strong> careers@prismhealthlab.com</p>
              <p><strong className="text-white">Subject Line:</strong> [Position/Interest] - Your Name</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-rose-900/20 to-red-900/20 border border-rose-700/30 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 bg-rose-400 rounded-full animate-pulse"></div>
                <span className="text-rose-300 text-sm font-medium">Equal Opportunity Employer</span>
              </div>
              <p className="text-slate-300 text-sm">
                Prism Health Lab is committed to creating a diverse and inclusive workplace where all team 
                members can thrive regardless of race, gender, age, religion, identity, or experience.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}