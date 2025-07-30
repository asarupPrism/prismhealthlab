/**
 * Hero Section Skeleton Component
 * 
 * Zero-layout-shift loading placeholder for ClientHeroSection.
 * Uses pure CSS animations and matches exact dimensions of the real component.
 * Extracted into @layer components for optimal critical CSS handling.
 */

import React from 'react'

export default function HeroSkeleton() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 py-20 -mt-16 pt-16">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950"></div>
      
      {/* Background dots - static version */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-slate-700 rounded-full opacity-30"></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-slate-700 rounded-full opacity-30"></div>
        <div className="absolute top-2/3 left-1/2 w-2 h-2 bg-slate-700 rounded-full opacity-30"></div>
      </div>

      <div className="relative max-w-6xl mx-auto text-center z-10">
        <div className="mb-8">
          {/* Title skeleton - matches real title dimensions */}
          <div className="mb-8">
            <div className="h-16 md:h-20 lg:h-24 bg-slate-800/50 rounded-lg mb-4 mx-auto max-w-4xl animate-pulse"></div>
            <div className="h-12 md:h-16 lg:h-20 bg-slate-800/30 rounded-lg mx-auto max-w-2xl animate-pulse"></div>
          </div>
          
          {/* Subtitle skeleton */}
          <div className="mb-12 max-w-3xl mx-auto">
            <div className="h-6 bg-slate-800/40 rounded mb-3 animate-pulse"></div>
            <div className="h-6 bg-slate-800/40 rounded mb-3 mx-auto max-w-2xl animate-pulse"></div>
            <div className="h-6 bg-slate-800/40 rounded mx-auto max-w-xl animate-pulse"></div>
          </div>

          {/* CTA buttons skeleton */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center max-w-lg mx-auto">
            <div className="flex-1">
              <div className="w-full h-12 sm:h-16 bg-slate-800/50 rounded-xl animate-pulse"></div>
            </div>
            <div className="w-full sm:w-auto">
              <div className="w-full sm:w-48 h-12 sm:h-16 bg-slate-800/30 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}