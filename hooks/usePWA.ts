'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface PWAState {
  isSupported: boolean
  isInstalled: boolean
  isStandalone: boolean
  canInstall: boolean
  isOffline: boolean
  isUpdateAvailable: boolean
  pushSupported: boolean
  pushEnabled: boolean
  syncSupported: boolean
}

interface PWACapabilities {
  serviceWorker: boolean
  pushManager: boolean
  backgroundSync: boolean
  periodicSync: boolean
  badging: boolean
  webShare: boolean
  fileSystemAccess: boolean
}

interface PWAMetrics {
  cacheHitRate: number
  offlineUsage: number
  pushNotificationsReceived: number
  installPromptShown: boolean
  installCompleted: boolean
  uninstallReason?: string
}

export function usePWA() {
  const [state, setState] = useState<PWAState>({
    isSupported: false,
    isInstalled: false,
    isStandalone: false,
    canInstall: false,
    isOffline: false,
    isUpdateAvailable: false,
    pushSupported: false,
    pushEnabled: false,
    syncSupported: false
  })

  const [capabilities, setCapabilities] = useState<PWACapabilities>({
    serviceWorker: false,
    pushManager: false,
    backgroundSync: false,
    periodicSync: false,
    badging: false,
    webShare: false,
    fileSystemAccess: false
  })

  const [metrics, setMetrics] = useState<PWAMetrics>({
    cacheHitRate: 0,
    offlineUsage: 0,
    pushNotificationsReceived: 0,
    installPromptShown: false,
    installCompleted: false
  })

  const installPromptRef = useRef<any>(null)
  const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null)
  const pushSubscriptionRef = useRef<PushSubscription | null>(null)

  // Detect PWA capabilities
  useEffect(() => {
    const detectCapabilities = () => {
      setCapabilities({
        serviceWorker: 'serviceWorker' in navigator,
        pushManager: 'PushManager' in window,
        backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
        periodicSync: 'serviceWorker' in navigator && 'periodicSync' in window.ServiceWorkerRegistration.prototype,
        badging: 'setAppBadge' in navigator,
        webShare: 'share' in navigator,
        fileSystemAccess: 'showOpenFilePicker' in window
      })

      setState(prev => ({
        ...prev,
        isSupported: 'serviceWorker' in navigator,
        isStandalone: window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone === true,
        pushSupported: 'PushManager' in window,
        syncSupported: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype
      }))
    }

    detectCapabilities()
  }, [])

  // Monitor online/offline status
  useEffect(() => {
    const updateOnlineStatus = () => {
      setState(prev => ({ ...prev, isOffline: !navigator.onLine }))
      
      if (navigator.onLine) {
        // Trigger background sync when coming back online
        triggerBackgroundSync()
      }
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    updateOnlineStatus()

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  // Service Worker registration
  useEffect(() => {
    if (!capabilities.serviceWorker) return

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none'
        })

        swRegistrationRef.current = registration
        console.log('Service Worker registered:', registration.scope)

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setState(prev => ({ ...prev, isUpdateAvailable: true }))
              }
            })
          }
        })

        // Listen for service worker messages
        navigator.serviceWorker.addEventListener('message', handleSWMessage)

        // Check current push subscription
        await checkPushSubscription(registration)

      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    }

    registerSW()

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleSWMessage)
    }
  }, [capabilities.serviceWorker])

  // Install prompt handling
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      installPromptRef.current = e
      setState(prev => ({ ...prev, canInstall: true }))
      setMetrics(prev => ({ ...prev, installPromptShown: true }))
    }

    const handleAppInstalled = () => {
      setState(prev => ({ 
        ...prev, 
        isInstalled: true, 
        canInstall: false 
      }))
      setMetrics(prev => ({ ...prev, installCompleted: true }))
      installPromptRef.current = null
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  // Handle service worker messages
  const handleSWMessage = useCallback((event: MessageEvent) => {
    const { type, payload } = event.data

    switch (type) {
      case 'SW_ACTIVATED':
        console.log('Service Worker activated:', payload.version)
        break
      case 'CACHE_HIT':
        setMetrics(prev => ({
          ...prev,
          cacheHitRate: prev.cacheHitRate + 1
        }))
        break
      case 'OFFLINE_USAGE':
        setMetrics(prev => ({
          ...prev,
          offlineUsage: prev.offlineUsage + 1
        }))
        break
    }
  }, [])

  // Install PWA
  const install = useCallback(async () => {
    if (!installPromptRef.current) return false

    try {
      const result = await installPromptRef.current.prompt()
      const userChoice = await result.userChoice

      if (userChoice === 'accepted') {
        setState(prev => ({ 
          ...prev, 
          isInstalled: true, 
          canInstall: false 
        }))
        installPromptRef.current = null
        return true
      }
      
      return false
    } catch (error) {
      console.error('Install failed:', error)
      return false
    }
  }, [])

  // Update service worker
  const update = useCallback(async () => {
    if (!swRegistrationRef.current) return false

    try {
      await swRegistrationRef.current.update()
      
      if (swRegistrationRef.current && swRegistrationRef.current.waiting) {
        // Post message to skip waiting
        swRegistrationRef.current.waiting.postMessage({ type: 'SKIP_WAITING' })
        setState(prev => ({ ...prev, isUpdateAvailable: false }))
        return true
      }
      
      return false
    } catch (error) {
      console.error('Update failed:', error)
      return false
    }
  }, [])

  // Push notification subscription
  const subscribeToPush = useCallback(async () => {
    if (!capabilities.pushManager || !swRegistrationRef.current) return false

    try {
      // Request notification permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        console.log('Notification permission denied')
        return false
      }

      // Generate VAPID key (in production, this should come from your server)
      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NjsHn96YE'

      const subscription = await swRegistrationRef.current.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      })

      pushSubscriptionRef.current = subscription

      // Send subscription to server
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            subscription: subscription.toJSON()
          })
        })
      }

      setState(prev => ({ ...prev, pushEnabled: true }))
      return true

    } catch (error) {
      console.error('Push subscription failed:', error)
      return false
    }
  }, [capabilities.pushManager])

  // Unsubscribe from push notifications
  const unsubscribeFromPush = useCallback(async () => {
    if (!pushSubscriptionRef.current) return false

    try {
      await pushSubscriptionRef.current.unsubscribe()
      
      // Remove subscription from server
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id })
        })
      }

      pushSubscriptionRef.current = null
      setState(prev => ({ ...prev, pushEnabled: false }))
      return true

    } catch (error) {
      console.error('Push unsubscription failed:', error)
      return false
    }
  }, [])

  // Check current push subscription
  const checkPushSubscription = useCallback(async (registration: ServiceWorkerRegistration) => {
    try {
      const subscription = await registration.pushManager.getSubscription()
      
      if (subscription) {
        pushSubscriptionRef.current = subscription
        setState(prev => ({ ...prev, pushEnabled: true }))
      }
    } catch (error) {
      console.error('Failed to check push subscription:', error)
    }
  }, [])

  // Trigger background sync
  const triggerBackgroundSync = useCallback(async () => {
    if (!capabilities.backgroundSync || !swRegistrationRef.current) return false

    try {
      // Background sync is experimental and not available in all browsers
      const registration = swRegistrationRef.current as ServiceWorkerRegistration & {
        sync?: { register: (tag: string) => Promise<void> }
      }
      
      if (registration.sync) {
        await registration.sync.register('background-sync')
      }
      return true
    } catch (error) {
      console.error('Background sync failed:', error)
      return false
    }
  }, [capabilities.backgroundSync])

  // Cache specific URLs
  const cacheUrls = useCallback(async (urls: string[]) => {
    if (!swRegistrationRef.current) return false

    try {
      return new Promise<boolean>((resolve) => {
        const messageChannel = new MessageChannel()
        
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.success)
        }

        const worker = swRegistrationRef.current!.active
        if (worker) {
          worker.postMessage({
            type: 'CACHE_URLS',
            payload: { urls }
          }, [messageChannel.port2])
        }
      })
    } catch (error) {
      console.error('Failed to cache URLs:', error)
      return false
    }
  }, [])

  // Clear cache
  const clearCache = useCallback(async () => {
    if (!swRegistrationRef.current) return false

    try {
      return new Promise<boolean>((resolve) => {
        const messageChannel = new MessageChannel()
        
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.success)
        }

        const worker = swRegistrationRef.current!.active
        if (worker) {
          worker.postMessage({
            type: 'CLEAR_CACHE'
          }, [messageChannel.port2])
        }
      })
    } catch (error) {
      console.error('Failed to clear cache:', error)
      return false
    }
  }, [])

  // Share content using Web Share API
  const share = useCallback(async (data: { title?: string; text?: string; url?: string; files?: File[] }) => {
    if (!capabilities.webShare) return false

    try {
      await navigator.share(data)
      return true
    } catch (error) {
      console.error('Share failed:', error)
      return false
    }
  }, [capabilities.webShare])

  // Set app badge
  const setBadge = useCallback(async (count?: number) => {
    if (!capabilities.badging) return false

    try {
      if (count !== undefined) {
        await (navigator as any).setAppBadge(count)
      } else {
        await (navigator as any).clearAppBadge()
      }
      return true
    } catch (error) {
      console.error('Badge update failed:', error)
      return false
    }
  }, [capabilities.badging])

  return {
    // State
    ...state,
    capabilities,
    metrics,

    // Actions
    install,
    update,
    subscribeToPush,
    unsubscribeFromPush,
    triggerBackgroundSync,
    cacheUrls,
    clearCache,
    share,
    setBadge,

    // Utilities
    isSupported: state.isSupported,
    registration: swRegistrationRef.current,
    pushSubscription: pushSubscriptionRef.current
  }
}

// Utility function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Hook for PWA install banner
export function usePWAInstallBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const { canInstall, isInstalled, isStandalone, install } = usePWA()

  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-banner-dismissed')
    setBannerDismissed(dismissed === 'true')
  }, [])

  useEffect(() => {
    const shouldShow = canInstall && 
                      !isInstalled && 
                      !isStandalone && 
                      !bannerDismissed &&
                      window.innerWidth < 768 // Show on mobile

    setShowBanner(shouldShow)
  }, [canInstall, isInstalled, isStandalone, bannerDismissed])

  const dismissBanner = useCallback(() => {
    setBannerDismissed(true)
    setShowBanner(false)
    localStorage.setItem('pwa-banner-dismissed', 'true')
  }, [])

  const installApp = useCallback(async () => {
    const success = await install()
    if (success) {
      setShowBanner(false)
    }
    return success
  }, [install])

  return {
    showBanner,
    dismissBanner,
    installApp
  }
}