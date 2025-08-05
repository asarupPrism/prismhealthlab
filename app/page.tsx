import React from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import StructuredData from '@/components/seo/StructuredData'
import { 
  DynamicHeroSection, 
  DynamicHowItWorksSection, 
  DynamicEmailSignup 
} from '@/components/homepage/DynamicHomepageComponents'

// Enable static generation now that we've fixed the SSR issues
export const revalidate = 86400 // 24 hours

interface PricingPanel {
  name: string;
  price: string;
  description: string;
}

export const metadata: Metadata = {
  title: 'Prism Health Lab - Your Health, Your Data, Your Control',
  description: 'Lab-grade diagnostics simplified. Get actionable health insights faster, easier, and more affordably than ever. CLIA-certified labs with 2-3 day results.',
  keywords: 'diagnostic testing, health lab, blood work, hormone testing, wellness panels, medical diagnostics, preventive health, lab tests',
  openGraph: {
    title: 'Prism Health Lab - Your Health, Your Data, Your Control',
    description: 'Lab-grade diagnostics simplified. Get actionable health insights faster, easier, and more affordably than ever.',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Prism Health Lab - Diagnostic Testing',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prism Health Lab - Your Health, Your Data, Your Control',
    description: 'Lab-grade diagnostics simplified. Get actionable health insights faster, easier, and more affordably than ever.',
  },
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
  return (
    <div className="min-h-screen bg-slate-950">
      {/* SEO-critical content remains server-side */}
      <StructuredData type="homepage" />
      
      {/* Hero Section - Dynamic with Error Boundary and Suspense */}
      <DynamicHeroSection pricingPanels={pricingPanels} />

      {/* Why Choose Us Section - Server-rendered for SEO */}
      <section className="py-20 px-6 bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="border-l-2 border-emerald-500/30 pl-6 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose Prism Health Lab?
            </h2>
            <p className="text-xl text-slate-300 leading-relaxed">
              We&apos;re redefining healthcare accessibility with cutting-edge diagnostics and patient-centric service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Trust and Credibility */}
            <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/60 hover:border-slate-600/60 transition-all duration-300">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse mt-1.5"></div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">CLIA-Certified Excellence</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    All tests processed through <span className="text-emerald-400 font-semibold">CLIA-certified laboratories</span>, ensuring the highest standards of accuracy and reliability for your health data.
                  </p>
                  <p className="text-slate-400 text-xs mt-3 font-mono">
                    Clinical Laboratory Improvement Amendments
                  </p>
                </div>
              </div>
            </div>

            {/* Speed and Convenience */}
            <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/60 hover:border-slate-600/60 transition-all duration-300">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse mt-1.5"></div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Lightning-Fast Results</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Get your comprehensive health insights in just <span className="text-cyan-400 font-semibold">2–3 business days</span>—significantly faster than traditional healthcare systems.
                  </p>
                  <p className="text-slate-400 text-xs mt-3 font-mono">
                    Average industry time: 7-14 days
                  </p>
                </div>
              </div>
            </div>

            {/* Evidence-Based Impact */}
            <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/60 hover:border-slate-600/60 transition-all duration-300">
              <div className="flex items-start gap-4 mb-6">
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
        </div>
      </section>

      {/* How It Works Section - Dynamic with viewport loading */}
      <DynamicHowItWorksSection />

      {/* Pricing Section - Server-rendered for SEO */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="border-l-2 border-cyan-500/30 pl-6 mb-16 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Transparent, Affordable Pricing
            </h2>
            <p className="text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto">
              No hidden fees, no insurance hassles, no surprise bills. Just clear, upfront pricing for comprehensive health insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {pricingPanels.map((panel) => (
              <div
                key={panel.name}
                className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/60 hover:border-slate-600/60 transition-all duration-300 shadow-xl shadow-slate-900/50 relative group"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 mb-6">
                    <span className="text-2xl text-cyan-300">◆</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{panel.name}</h3>
                  <div className="text-3xl font-bold text-cyan-400 mb-4">{panel.price}</div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-6">{panel.description}</p>
                  
                  <Link href="/products">
                    <button className="w-full px-6 py-3 bg-gradient-to-r from-slate-700/50 to-slate-600/50 border border-slate-600/50 text-slate-100 font-semibold rounded-xl hover:from-cyan-500/20 hover:to-blue-500/20 hover:border-cyan-400/50 transition-all duration-300 group-hover:scale-105">
                      Learn More
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section - Dynamic */}
      <DynamicEmailSignup />
    </div>
  );
}