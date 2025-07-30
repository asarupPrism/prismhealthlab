'use client'

/**
 * Dynamic Homepage Components Wrapper
 * 
 * Client component that handles dynamic imports with SSR disabled.
 * This is required because `ssr: false` is not allowed in Server Components.
 */

import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { AnimationErrorBoundary } from '@/components/ErrorBoundary'
import HeroSkeleton from '@/components/skeletons/HeroSkeleton'
import HowItWorksSkeleton from '@/components/skeletons/HowItWorksSkeleton'

// Dynamic imports with SSR disabled for client-only animation components
const ClientHeroSection = dynamic(
  () => import('@/components/homepage/client/ClientHeroSection'),
  {
    ssr: false,
    loading: () => <HeroSkeleton />,
  }
)

const ClientHowItWorksSection = dynamic(
  () => import('@/components/homepage/client/ClientHowItWorksSection'),
  {
    ssr: false,
    loading: () => <HowItWorksSkeleton />,
  }
)

const EmailSignup = dynamic(
  () => import('@/components/homepage/EmailSignup'),
  {
    ssr: false,
    loading: () => (
      <section className="py-20 px-6 bg-slate-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="h-8 bg-slate-800/40 rounded mb-4 mx-auto max-w-md animate-pulse"></div>
          <div className="h-24 bg-slate-800/30 rounded animate-pulse"></div>
        </div>
      </section>
    ),
  }
)

interface PricingPanel {
  name: string;
  price: string;
  description: string;
}

interface DynamicHeroSectionProps {
  pricingPanels: PricingPanel[];
}

export function DynamicHeroSection({ pricingPanels }: DynamicHeroSectionProps) {
  return (
    <Suspense fallback={<HeroSkeleton />}>
      <AnimationErrorBoundary>
        <ClientHeroSection pricingPanels={pricingPanels} />
      </AnimationErrorBoundary>
    </Suspense>
  )
}

export function DynamicHowItWorksSection() {
  return (
    <Suspense fallback={<HowItWorksSkeleton />}>
      <AnimationErrorBoundary>
        <ClientHowItWorksSection />
      </AnimationErrorBoundary>
    </Suspense>
  )
}

export function DynamicEmailSignup() {
  return (
    <Suspense fallback={
      <section className="py-20 px-6 bg-slate-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="h-8 bg-slate-800/40 rounded mb-4 mx-auto max-w-md animate-pulse"></div>
          <div className="h-24 bg-slate-800/30 rounded animate-pulse"></div>
        </div>
      </section>
    }>
      <AnimationErrorBoundary>
        <EmailSignup />
      </AnimationErrorBoundary>
    </Suspense>
  )
}