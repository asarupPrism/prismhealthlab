'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePWAInstallBanner, usePWA } from '@/hooks/usePWA'

interface PWAInstallBannerProps {
  className?: string
  position?: 'top' | 'bottom'
  style?: 'banner' | 'modal' | 'floating'
}

export default function PWAInstallBanner({
  className = '',
  position = 'bottom',
  style = 'banner'
}: PWAInstallBannerProps) {
  const { showBanner, dismissBanner, installApp } = usePWAInstallBanner()
  const { capabilities, isOffline } = usePWA()
  const [isInstalling, setIsInstalling] = useState(false)
  const [showFeatures, setShowFeatures] = useState(false)

  const handleInstall = async () => {
    setIsInstalling(true)
    try {
      const success = await installApp()
      if (!success) {
        console.log('Installation was cancelled or failed')
      }
    } catch (_error) {
      console.error('Installation error:', _error)
    } finally {
      setIsInstalling(false)
    }
  }

  const features = [
    {
      icon: '📱',
      title: 'Native App Experience',
      description: 'Quick access from your home screen'
    },
    {
      icon: '⚡',
      title: 'Faster Loading',
      description: 'Cached content loads instantly'
    },
    {
      icon: '🔔',
      title: 'Push Notifications',
      description: 'Get notified about test results'
    },
    {
      icon: '📊',
      title: 'Offline Access',
      description: 'View your data even without internet'
    }
  ]

  if (!showBanner || !capabilities.serviceWorker) {
    return null
  }

  const BannerContent = () => (
    <div className={`
      flex items-center justify-between p-4 gap-4
      ${style === 'floating' ? 'rounded-xl' : ''}
    `}>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">📱</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm sm:text-base">
            Install Prism Health Lab
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Get faster access and offline features
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => setShowFeatures(!showFeatures)}
          className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors px-2 py-1"
        >
          {showFeatures ? 'Hide' : 'Features'}
        </button>
        
        <button
          onClick={dismissBanner}
          className="text-slate-400 hover:text-white transition-colors p-1"
          aria-label="Dismiss install banner"
        >
          ✕
        </button>
        
        <button
          onClick={handleInstall}
          disabled={isInstalling || isOffline}
          className="
            px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 
            text-white text-sm font-medium rounded-lg transition-colors
            disabled:cursor-not-allowed
          "
        >
          {isInstalling ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Installing...</span>
            </div>
          ) : (
            'Install'
          )}
        </button>
      </div>
    </div>
  )

  const FeaturesList = () => (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="border-t border-slate-700/50 bg-slate-800/30 backdrop-blur-sm"
    >
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-3"
          >
            <span className="text-lg flex-shrink-0">{feature.icon}</span>
            <div>
              <h4 className="text-white text-sm font-medium">{feature.title}</h4>
              <p className="text-slate-400 text-xs mt-1">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )

  if (style === 'modal') {
    return (
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && dismissBanner()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-2xl max-w-md w-full overflow-hidden"
            >
              <BannerContent />
              <AnimatePresence>
                {showFeatures && <FeaturesList />}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  const baseClasses = `
    fixed left-4 right-4 z-40 
    bg-slate-800/95 backdrop-blur-sm border border-slate-700/50
    ${position === 'top' ? 'top-4' : 'bottom-4'}
    ${style === 'floating' ? 'rounded-xl' : 'rounded-lg'}
    ${className}
  `

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ 
            opacity: 0, 
            y: position === 'top' ? -100 : 100,
            scale: 0.95
          }}
          animate={{ 
            opacity: 1, 
            y: 0,
            scale: 1
          }}
          exit={{ 
            opacity: 0, 
            y: position === 'top' ? -100 : 100,
            scale: 0.95
          }}
          transition={{ 
            type: 'spring',
            damping: 25,
            stiffness: 300
          }}
          className={baseClasses}
        >
          <BannerContent />
          <AnimatePresence>
            {showFeatures && <FeaturesList />}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// PWA Update Banner for when new version is available
export function PWAUpdateBanner() {
  const { isUpdateAvailable, update } = usePWA()
  const [isUpdating, setIsUpdating] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      const success = await update()
      if (success) {
        // Reload page to activate new service worker
        window.location.reload()
      }
    } catch (error) {
      console.error('Update error:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  if (!isUpdateAvailable || dismissed) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 left-4 right-4 z-50 bg-emerald-900/20 border border-emerald-700/50 rounded-xl p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          <div>
            <h4 className="text-emerald-300 font-semibold text-sm">App Update Available</h4>
            <p className="text-emerald-200 text-xs">
              New features and improvements are ready
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDismissed(true)}
            className="text-emerald-400 hover:text-emerald-300 transition-colors text-sm px-2 py-1"
          >
            Later
          </button>
          
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white text-sm rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {isUpdating ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Updating...</span>
              </div>
            ) : (
              'Update Now'
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// PWA Status Indicator
export function PWAStatusIndicator() {
  const { isStandalone, isOffline, pushEnabled } = usePWA()
  
  if (!isStandalone) return null

  return (
    <div className="fixed bottom-4 left-4 flex items-center gap-2 bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-lg px-3 py-2 text-xs">
      <div className={`w-2 h-2 rounded-full ${isOffline ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
      <span className="text-slate-300">
        {isOffline ? 'Offline' : 'Online'}
      </span>
      
      {pushEnabled && (
        <>
          <div className="w-px h-3 bg-slate-600 mx-1"></div>
          <span className="text-cyan-400">🔔</span>
        </>
      )}
    </div>
  )
}