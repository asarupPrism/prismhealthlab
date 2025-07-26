'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { usePWA } from '@/hooks/usePWA'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const { triggerBackgroundSync, cacheUrls } = usePWA()

  useEffect(() => {
    const checkOnlineStatus = () => {
      setIsOnline(navigator.onLine)
      if (navigator.onLine) {
        setLastUpdate(new Date())
        // Trigger background sync when back online
        triggerBackgroundSync()
      }
    }

    window.addEventListener('online', checkOnlineStatus)
    window.addEventListener('offline', checkOnlineStatus)
    checkOnlineStatus()

    return () => {
      window.removeEventListener('online', checkOnlineStatus)
      window.removeEventListener('offline', checkOnlineStatus)
    }
  }, [triggerBackgroundSync])

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1)
    
    try {
      // Try to load the main page
      const response = await fetch('/', { cache: 'reload' })
      if (response.ok) {
        window.location.href = '/portal'
      }
    } catch {
      console.log('Still offline, retry failed')
    }
  }

  const precacheImportantPages = async () => {
    const importantPages = [
      '/portal',
      '/portal/dashboard',
      '/portal/history',
      '/portal/results'
    ]
    
    try {
      await cacheUrls(importantPages)
      console.log('Important pages cached for offline use')
    } catch (error) {
      console.error('Failed to cache pages:', error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Offline Illustration */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="mb-8"
        >
          <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <motion.span 
              className="text-4xl"
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
●
            </motion.span>
          </div>
        </motion.div>

        {/* Status Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-2xl font-bold text-white mb-4">
{isOnline ? 'Back Online!' : 'You&apos;re Offline'}
          </h1>
          
          <p className="text-slate-400 mb-8 leading-relaxed">
            {isOnline 
              ? 'Your connection has been restored. You can now access all features.'
              : 'No internet connection detected. Some features may be limited, but you can still access your cached data.'
            }
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          {isOnline ? (
            <button
              onClick={() => window.location.href = '/portal'}
              className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
            >
              Return to Portal
            </button>
          ) : (
            <>
              <button
                onClick={handleRetry}
                disabled={isOnline}
                className="w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {retryCount > 0 ? `Retry Connection (${retryCount})` : 'Retry Connection'}
              </button>
              
              <button
                onClick={precacheImportantPages}
                className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
              >
                Prepare for Offline Use
              </button>
            </>
          )}
        </motion.div>

        {/* Offline Features */}
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 space-y-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4">
              Available Offline Features
            </h2>
            
            <div className="grid gap-4 text-left">
              <div className="flex items-start gap-3 p-4 bg-slate-800/30 rounded-lg">
                <div className="w-6 h-6 bg-cyan-500 rounded flex items-center justify-center"><span className="text-white text-sm">●</span></div>
                <div>
                  <h3 className="font-medium text-white mb-1">Cached Dashboard</h3>
                  <p className="text-sm text-slate-400">
                    View your previously loaded health data and analytics
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-slate-800/30 rounded-lg">
                <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center"><span className="text-white text-sm">+</span></div>
                <div>
                  <h3 className="font-medium text-white mb-1">Test Results</h3>
                  <p className="text-sm text-slate-400">
                    Access your downloaded test results and reports
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-slate-800/30 rounded-lg">
                <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center"><span className="text-white text-sm">→</span></div>
                <div>
                  <h3 className="font-medium text-white mb-1">Appointment History</h3>
                  <p className="text-sm text-slate-400">
                    Review your cached appointment information
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Connection Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 p-4 bg-slate-800/20 rounded-lg"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Connection Status:</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
              }`}></div>
              <span className={isOnline ? 'text-emerald-300' : 'text-rose-300'}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-slate-400">Last Update:</span>
            <span className="text-slate-300">
              {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
        </motion.div>

        {/* Tips for Offline Use */}
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-8 p-4 bg-amber-900/20 border border-amber-700/50 rounded-lg"
          >
            <h3 className="text-amber-300 font-medium mb-2 flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center"><span className="text-amber-900 text-xs">!</span></div>
              Offline Tips
            </h3>
            <ul className="text-sm text-amber-200 space-y-1 text-left">
              <li>• Your data is securely cached on this device</li>
              <li>• Changes will sync when you&apos;re back online</li>
              <li>• Critical features work without internet</li>
              <li>• Install the app for better offline experience</li>
            </ul>
          </motion.div>
        )}

        {/* Footer */}
        <div className="mt-12 text-xs text-slate-500 text-center">
          <p>Prism Health Lab • Offline Mode</p>
          <p className="mt-1">
            Your health data is always available when you need it
          </p>
        </div>
      </div>
    </div>
  )
}