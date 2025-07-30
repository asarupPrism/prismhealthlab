'use client'

/**
 * Error Boundary for Dynamic Components
 * 
 * Provides graceful degradation when client components fail to load.
 * Offers retry functionality and maintains page stability.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showRetry?: boolean
  retryText?: string
}

interface State {
  hasError: boolean
  error?: Error
  retryCount: number
}

export default class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3

  constructor(props: Props) {
    super(props)
    this.state = { 
      hasError: false, 
      retryCount: 0 
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      retryCount: 0
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log to monitoring service (Sentry, etc.)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
      })
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        retryCount: prevState.retryCount + 1
      }))
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI with retry option
      return (
        <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-rose-500/20 border border-rose-400/30 flex items-center justify-center">
            <span className="text-rose-300 text-xl">⚠</span>
          </div>
          
          <h3 className="text-lg font-semibold text-white mb-2">
            Something went wrong
          </h3>
          
          <p className="text-slate-400 text-sm mb-4">
            This section failed to load. The rest of the page is working normally.
          </p>

          {this.props.showRetry !== false && this.state.retryCount < this.maxRetries && (
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/60 border border-slate-600/50 text-slate-200 text-sm font-medium rounded-lg transition-all duration-200"
            >
              <span className="text-xs">↻</span>
              {this.props.retryText || 'Try Again'}
            </button>
          )}

          {this.state.retryCount >= this.maxRetries && (
            <p className="text-slate-500 text-xs mt-2">
              Unable to load after {this.maxRetries} attempts
            </p>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

// Specialized error boundary for animation components
export function AnimationErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="py-8 text-center text-slate-400">
          <p className="text-sm">Animation unavailable</p>
          <p className="text-xs mt-1">Content loading with basic styling</p>
        </div>
      }
      onError={(error) => {
        console.warn('Animation component failed:', error.message)
      }}
      showRetry={false} // Don't show retry for animation failures
    >
      {children}
    </ErrorBoundary>
  )
}