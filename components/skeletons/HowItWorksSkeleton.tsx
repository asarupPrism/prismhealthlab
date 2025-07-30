/**
 * How It Works Skeleton Component
 * 
 * Lightweight skeleton that matches ClientHowItWorksSection dimensions exactly.
 * Prevents layout shift during dynamic component loading with CSS-only animations.
 */

import React from 'react'

export default function HowItWorksSkeleton() {
  return (
    <section id="how-it-works" className="py-20 px-6 bg-slate-900/30">
      <div className="max-w-6xl mx-auto">
        {/* Header skeleton */}
        <div className="border-l-2 border-slate-700/30 pl-6 mb-16">
          <div className="h-12 md:h-16 bg-slate-800/40 rounded-lg mb-6 max-w-md animate-pulse"></div>
          <div className="space-y-3">
            <div className="h-5 bg-slate-800/30 rounded max-w-2xl animate-pulse"></div>
            <div className="h-5 bg-slate-800/30 rounded max-w-xl animate-pulse"></div>
          </div>
        </div>

        {/* Steps grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 sm:p-6 shadow-xl shadow-slate-900/50 relative flex flex-col h-full min-h-[280px] sm:min-h-[320px]"
            >
              {/* Step number skeleton */}
              <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-700/50 animate-pulse"></div>

              {/* Icon skeleton */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-700/30 mb-4 sm:mb-6 animate-pulse"></div>

              {/* Content skeleton */}
              <div className="flex-1 flex flex-col">
                {/* Title skeleton */}
                <div className="h-6 sm:h-7 bg-slate-700/40 rounded mb-3 sm:mb-4 max-w-32 animate-pulse"></div>
                
                {/* Description skeleton */}
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-700/30 rounded animate-pulse"></div>
                  <div className="h-4 bg-slate-700/30 rounded max-w-4/5 animate-pulse"></div>
                  <div className="h-4 bg-slate-700/30 rounded max-w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-slate-700/30 rounded max-w-2/3 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}