'use client'

import React, { useEffect, useState } from 'react'
// import { useDeviceCapabilities } from '@/hooks/useTouchInteractions' // Not used currently

interface AccessibilityPreferences {
  reduceMotion: boolean
  highContrast: boolean
  largeText: boolean
  screenReader: boolean
  voiceOver: boolean
  announcements: boolean
}

interface AccessibilityContextType {
  preferences: AccessibilityPreferences
  updatePreference: (key: keyof AccessibilityPreferences, value: boolean) => void
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void
  getFocusableElements: (container?: Element) => HTMLElement[]
  trapFocus: (container: Element) => () => void
}

const AccessibilityContext = React.createContext<AccessibilityContextType | null>(null)

// Hook for using accessibility context
export function useAccessibility() {
  const context = React.useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider')
  }
  return context
}

// Main accessibility provider component
export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    reduceMotion: false,
    highContrast: false,
    largeText: false,
    screenReader: false,
    voiceOver: false,
    announcements: true
  })

  // const capabilities = useDeviceCapabilities() // Not used currently

  // Detect system preferences on mount
  useEffect(() => {
    const detectPreferences = () => {
      const newPreferences: AccessibilityPreferences = {
        reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        highContrast: window.matchMedia('(prefers-contrast: high)').matches,
        largeText: window.matchMedia('(prefers-font-size: large)').matches,
        screenReader: 'speechSynthesis' in window,
        voiceOver: /VoiceOver/i.test(navigator.userAgent) || 
                  'speechSynthesis' in window && /iPhone|iPad/i.test(navigator.userAgent),
        announcements: true
      }

      setPreferences(newPreferences)

      // Store in localStorage
      localStorage.setItem('medicalAccessibilityPrefs', JSON.stringify(newPreferences))
    }

    // Load saved preferences
    const saved = localStorage.getItem('medicalAccessibilityPrefs')
    if (saved) {
      try {
        setPreferences(JSON.parse(saved))
      } catch {
        detectPreferences()
      }
    } else {
      detectPreferences()
    }

    // Listen for system preference changes
    const mediaQueries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-contrast: high)'),
      window.matchMedia('(prefers-font-size: large)')
    ]

    const handleChange = () => detectPreferences()
    mediaQueries.forEach(mq => mq.addEventListener('change', handleChange))

    return () => {
      mediaQueries.forEach(mq => mq.removeEventListener('change', handleChange))
    }
  }, [])

  // Update CSS custom properties based on preferences
  useEffect(() => {
    const root = document.documentElement

    // Apply accessibility preferences as CSS custom properties
    root.style.setProperty('--motion-duration', preferences.reduceMotion ? '0s' : '0.3s')
    root.style.setProperty('--motion-scale', preferences.reduceMotion ? '1' : '0.98')
    
    if (preferences.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    if (preferences.largeText) {
      root.classList.add('large-text')
    } else {
      root.classList.remove('large-text')
    }

    // Add medical accessibility classes
    root.classList.toggle('medical-reduced-motion', preferences.reduceMotion)
    root.classList.toggle('medical-high-contrast', preferences.highContrast)
    root.classList.toggle('medical-large-text', preferences.largeText)
    root.classList.toggle('medical-screen-reader', preferences.screenReader)
  }, [preferences])

  const updatePreference = (key: keyof AccessibilityPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value }
    setPreferences(newPreferences)
    localStorage.setItem('medicalAccessibilityPrefs', JSON.stringify(newPreferences))
  }

  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!preferences.announcements && !preferences.screenReader) return

    // Create announcement element
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  const getFocusableElements = (container?: Element): HTMLElement[] => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="tab"]:not([disabled])'
    ].join(', ')

    const searchContainer = container || document
    return Array.from(searchContainer.querySelectorAll(focusableSelectors)) as HTMLElement[]
  }

  const trapFocus = (container: Element) => {
    const focusableElements = getFocusableElements(container)
    const firstFocusable = focusableElements[0]
    const lastFocusable = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e: Event) => {
      const keyboardEvent = e as KeyboardEvent
      if (keyboardEvent.key !== 'Tab') return

      if (keyboardEvent.shiftKey) {
        if (document.activeElement === firstFocusable) {
          keyboardEvent.preventDefault()
          lastFocusable?.focus()
        }
      } else {
        if (document.activeElement === lastFocusable) {
          keyboardEvent.preventDefault()
          firstFocusable?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)

    // Focus first element
    firstFocusable?.focus()

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }

  const contextValue: AccessibilityContextType = {
    preferences,
    updatePreference,
    announceToScreenReader,
    getFocusableElements,
    trapFocus
  }

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
      <ScreenReaderAnnouncements />
      <AccessibilityStylesheet preferences={preferences} />
    </AccessibilityContext.Provider>
  )
}

// Screen reader announcements component
function ScreenReaderAnnouncements() {
  return (
    <div className="sr-only">
      <div aria-live="polite" aria-atomic="true" id="polite-announcements"></div>
      <div aria-live="assertive" aria-atomic="true" id="assertive-announcements"></div>
    </div>
  )
}

// Dynamic accessibility stylesheet  
function AccessibilityStylesheet({ preferences }: { preferences: AccessibilityPreferences }) {
  // Use preferences parameter to avoid unused variable warning
  console.log('Accessibility preferences applied:', preferences)
  const styles = `
    /* Medical Accessibility Styles */
    .medical-reduced-motion * {
      animation-duration: 0.01s !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01s !important;
    }

    .medical-high-contrast {
      --medical-cyan-400: #00ffff;
      --medical-blue-500: #0066ff;
      --medical-emerald-500: #00ff00;
      --medical-amber-500: #ffff00;
      --medical-rose-500: #ff0066;
      --slate-800: #000000;
      --slate-700: #333333;
      --slate-600: #666666;
      --slate-200: #ffffff;
      --slate-100: #ffffff;
    }

    .medical-large-text {
      font-size: 120% !important;
    }

    .medical-large-text .medical-data {
      font-size: 140% !important;
    }

    .medical-large-text .medical-value {
      font-size: 160% !important;
    }

    /* Touch target enhancements for accessibility */
    .medical-touch-target {
      min-height: 44px;
      min-width: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Focus indicators for medical interface */
    .medical-focus-visible:focus-visible {
      outline: 3px solid var(--medical-cyan-400);
      outline-offset: 2px;
      border-radius: 4px;
    }

    /* Screen reader only content */
    .sr-only {
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    }

    /* Medical high contrast button styles */
    .medical-high-contrast button {
      border: 2px solid currentColor !important;
    }

    .medical-high-contrast .bg-slate-800 {
      background-color: #000000 !important;
      border: 1px solid #ffffff !important;
    }

    /* Medical data display accessibility */
    .medical-data-accessible {
      font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
      letter-spacing: 0.025em;
      line-height: 1.6;
    }

    /* Skip link for keyboard navigation */
    .medical-skip-link {
      position: absolute;
      top: -40px;
      left: 6px;
      background: var(--medical-cyan-400);
      color: black;
      padding: 8px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      z-index: 9999;
    }

    .medical-skip-link:focus {
      top: 6px;
    }

    /* Medical alert accessibility */
    .medical-alert-accessible {
      border-left: 4px solid currentColor;
      padding-left: 16px;
    }

    .medical-alert-accessible::before {
      content: "Alert: ";
      font-weight: 600;
      speak: literal;
    }
  `

  return <style dangerouslySetInnerHTML={{ __html: styles }} />
}

// Keyboard navigation component
export function KeyboardNavigation({ children }: { children: React.ReactNode }) {
  const { announceToScreenReader } = useAccessibility()

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // ESC key handling
      if (e.key === 'Escape') {
        const activeModal = document.querySelector('[role="dialog"]')
        if (activeModal) {
          const closeButton = activeModal.querySelector('[aria-label*="close"], [aria-label*="Close"]') as HTMLElement
          closeButton?.click()
          announceToScreenReader('Modal closed')
        }
      }

      // Tab navigation announcements
      if (e.key === 'Tab') {
        setTimeout(() => {
          const activeElement = document.activeElement as HTMLElement
          const ariaLabel = activeElement?.getAttribute('aria-label')
          const role = activeElement?.getAttribute('role')
          
          if (ariaLabel) {
            announceToScreenReader(`Focused: ${ariaLabel}`)
          } else if (role) {
            announceToScreenReader(`Focused: ${role}`)
          }
        }, 100)
      }
    }

    document.addEventListener('keydown', handleKeyboard)
    return () => document.removeEventListener('keydown', handleKeyboard)
  }, [announceToScreenReader])

  return <>{children}</>
}

// Medical form accessibility enhancements
export function AccessibleFormField({
  label,
  error,
  hint,
  required,
  children,
  className = ''
}: {
  label: string
  error?: string
  hint?: string
  required?: boolean
  children: React.ReactElement<React.InputHTMLAttributes<HTMLInputElement>>
  className?: string
}) {
  const fieldId = React.useId()
  const errorId = error ? `${fieldId}-error` : undefined
  const hintId = hint ? `${fieldId}-hint` : undefined

  const enhancedChild = React.cloneElement(children, {
    id: fieldId,
    'aria-describedby': [hintId, errorId].filter(Boolean).join(' ') || undefined,
    'aria-invalid': error ? 'true' : undefined,
    className: `medical-focus-visible medical-touch-target ${error ? 'border-rose-500' : 'border-slate-600'} ${children.props.className || ''}`
  })

  return (
    <div className={`medical-form-field ${className}`}>
      <label 
        htmlFor={fieldId}
        className="block text-sm font-medium text-slate-200 mb-2 medical-focus-visible"
      >
        {label}
        {required && (
          <span className="text-rose-400 ml-1" aria-label="required">*</span>
        )}
      </label>
      
      {hint && (
        <p id={hintId} className="text-xs text-slate-400 mb-2">
          {hint}
        </p>
      )}
      
      <div className="relative">
        {enhancedChild}
      </div>
      
      {error && (
        <p id={errorId} className="text-rose-400 text-xs mt-1 medical-alert-accessible" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// Medical skip navigation
export function SkipNavigation() {
  return (
    <>
      <a href="#main-content" className="medical-skip-link">
        Skip to main content
      </a>
      <a href="#medical-navigation" className="medical-skip-link">
        Skip to navigation
      </a>
    </>
  )
}

// Medical screen reader utilities
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>
}

export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>
}

// Medical live region for dynamic content updates
export function MedicalLiveRegion({ 
  children, 
  priority = 'polite',
  atomic = true,
  className = ''
}: { 
  children: React.ReactNode
  priority?: 'polite' | 'assertive'
  atomic?: boolean
  className?: string
}) {
  return (
    <div 
      aria-live={priority}
      aria-atomic={atomic}
      className={`sr-only ${className}`}
    >
      {children}
    </div>
  )
}