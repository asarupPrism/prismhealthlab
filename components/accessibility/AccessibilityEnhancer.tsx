'use client'

import { useEffect, useState } from 'react'

export default function AccessibilityEnhancer() {
  const [highContrast, setHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [fontSize, setFontSize] = useState('normal')

  useEffect(() => {
    // Check system preferences
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)')
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    setHighContrast(highContrastQuery.matches)
    setReducedMotion(reducedMotionQuery.matches)

    // Listen for preference changes
    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setHighContrast(e.matches)
    }

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }

    highContrastQuery.addEventListener('change', handleHighContrastChange)
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange)

    // Load saved preferences
    const savedFontSize = localStorage.getItem('fontSize')
    if (savedFontSize) {
      setFontSize(savedFontSize)
    }

    return () => {
      highContrastQuery.removeEventListener('change', handleHighContrastChange)
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange)
    }
  }, [])

  useEffect(() => {
    // Apply accessibility classes to document
    const root = document.documentElement

    // High contrast mode
    if (highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // Reduced motion
    if (reducedMotion) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }

    // Font size
    root.classList.remove('font-small', 'font-normal', 'font-large', 'font-xlarge')
    root.classList.add(`font-${fontSize}`)

    // Save preference
    localStorage.setItem('fontSize', fontSize)
  }, [highContrast, reducedMotion, fontSize])

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Accessibility Controls Toggle */}
      <details className="group">
        <summary className="w-12 h-12 bg-slate-800 border border-slate-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-700 transition-colors focus:ring-2 focus:ring-cyan-400 focus:outline-none">
          <span className="sr-only">Accessibility Options</span>
          {/* Accessibility icon */}
          <svg 
            className="w-6 h-6 text-slate-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </summary>

        <div className="absolute bottom-14 right-0 w-64 bg-slate-800 border border-slate-600 rounded-lg shadow-xl p-4 space-y-4">
          <h3 className="text-lg font-semibold text-white mb-3">Accessibility Options</h3>
          
          {/* Font Size Control */}
          <div>
            <label htmlFor="font-size" className="block text-sm font-medium text-slate-300 mb-2">
              Font Size
            </label>
            <select
              id="font-size"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:ring-2 focus:ring-cyan-400 focus:outline-none"
            >
              <option value="small">Small</option>
              <option value="normal">Normal</option>
              <option value="large">Large</option>
              <option value="xlarge">Extra Large</option>
            </select>
          </div>

          {/* High Contrast Toggle */}
          <div className="flex items-center justify-between">
            <label htmlFor="high-contrast" className="text-sm font-medium text-slate-300">
              High Contrast
            </label>
            <button
              id="high-contrast"
              type="button"
              role="switch"
              aria-checked={highContrast}
              onClick={() => setHighContrast(!highContrast)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                highContrast ? 'bg-cyan-600' : 'bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  highContrast ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Reduced Motion Toggle */}
          <div className="flex items-center justify-between">
            <label htmlFor="reduced-motion" className="text-sm font-medium text-slate-300">
              Reduce Motion
            </label>
            <button
              id="reduced-motion"
              type="button"
              role="switch"
              aria-checked={reducedMotion}
              onClick={() => setReducedMotion(!reducedMotion)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                reducedMotion ? 'bg-cyan-600' : 'bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  reducedMotion ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Skip Links */}
          <div className="pt-3 border-t border-slate-600">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Quick Navigation</h4>
            <div className="space-y-1">
              <a
                href="#main-content"
                className="block px-2 py-1 text-sm text-cyan-400 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded"
              >
                Skip to main content
              </a>
              <a
                href="#navigation"
                className="block px-2 py-1 text-sm text-cyan-400 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded"
              >
                Skip to navigation
              </a>
              <a
                href="#footer"
                className="block px-2 py-1 text-sm text-cyan-400 hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded"
              >
                Skip to footer
              </a>
            </div>
          </div>
        </div>
      </details>
    </div>
  )
}