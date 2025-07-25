// Service Worker for Prism Health Lab PWA
// Provides offline functionality, caching, and push notifications

const CACHE_NAME = 'prism-health-v1.2.0'
const STATIC_CACHE = 'prism-static-v1.2.0'
const DYNAMIC_CACHE = 'prism-dynamic-v1.2.0'
const API_CACHE = 'prism-api-v1.2.0'

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/portal',
  '/portal/dashboard',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/notification-icon.png',
  '/sounds/notification.mp3',
  '/sounds/high-priority.mp3',
  '/sounds/urgent.mp3',
  // Add critical CSS and JS files
  '/_next/static/css/app.css',
  '/_next/static/chunks/main.js'
]

// API endpoints to cache with different strategies
const API_ENDPOINTS = {
  critical: [
    '/api/portal/purchase-history',
    '/api/portal/analytics',
    '/api/auth/session'
  ],
  background: [
    '/api/portal/appointments',
    '/api/portal/results'
  ]
}

// Cache duration configurations (in milliseconds)
const CACHE_DURATIONS = {
  static: 7 * 24 * 60 * 60 * 1000,    // 7 days
  api: 30 * 60 * 1000,                 // 30 minutes
  dynamic: 24 * 60 * 60 * 1000,        // 1 day
  offline: 30 * 24 * 60 * 60 * 1000    // 30 days for offline fallbacks
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Caching static assets')
        return cache.addAll(STATIC_ASSETS.map(url => new Request(url, {
          cache: 'reload' // Ensure fresh copy
        })))
      }),
      
      // Cache offline fallback page
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.add('/offline.html')
      })
    ]).then(() => {
      console.log('Service Worker installed successfully')
      // Skip waiting to activate immediately
      return self.skipWaiting()
    }).catch((error) => {
      console.error('Service Worker installation failed:', error)
    })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        const validCaches = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE]
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!validCaches.includes(cacheName)) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      
      // Claim all clients immediately
      self.clients.claim()
    ]).then(() => {
      console.log('Service Worker activated successfully')
      
      // Notify all clients about the update
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_ACTIVATED',
            payload: { version: CACHE_NAME }
          })
        })
      })
    })
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests and chrome extensions
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return
  }

  // Handle different types of requests with appropriate strategies
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request))
  } else if (STATIC_ASSETS.some(asset => url.pathname === asset)) {
    event.respondWith(handleStaticRequest(request))
  } else if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(handleStaticRequest(request))
  } else {
    event.respondWith(handleDynamicRequest(request))
  }
})

// Handle API requests with network-first strategy and offline fallbacks
async function handleAPIRequest(request) {
  const url = new URL(request.url)
  const isCritical = API_ENDPOINTS.critical.some(endpoint => 
    url.pathname.startsWith(endpoint)
  )
  
  try {
    // Always try network first for API requests
    const networkResponse = await fetch(request.clone())
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(API_CACHE)
      const responseClone = networkResponse.clone()
      
      // Add timestamp for cache expiration
      const responseWithTimestamp = new Response(responseClone.body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers: {
          ...Object.fromEntries(responseClone.headers.entries()),
          'sw-cached-at': Date.now().toString()
        }
      })
      
      cache.put(request, responseWithTimestamp)
    }
    
    return networkResponse
  } catch (error) {
    console.log('Network failed for API request, trying cache:', url.pathname)
    
    // Try cache as fallback
    const cache = await caches.open(API_CACHE)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      const cachedAt = parseInt(cachedResponse.headers.get('sw-cached-at') || '0')
      const age = Date.now() - cachedAt
      
      // Return cached response if within acceptable age
      if (age < CACHE_DURATIONS.api || !navigator.onLine) {
        console.log('Serving cached API response:', url.pathname)
        return cachedResponse
      }
    }
    
    // Return offline fallback for critical endpoints
    if (isCritical) {
      return new Response(JSON.stringify({
        error: 'Offline',
        message: 'This feature is not available offline',
        offline: true,
        timestamp: new Date().toISOString()
      }), {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      })
    }
    
    throw error
  }
}

// Handle static assets with cache-first strategy
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    // Serve from cache and update in background
    updateCacheInBackground(request, cache)
    return cachedResponse
  }
  
  // Fallback to network
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.error('Failed to fetch static asset:', request.url)
    throw error
  }
}

// Handle dynamic requests (pages) with stale-while-revalidate
async function handleDynamicRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  // Network request promise
  const networkPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  }).catch(async (error) => {
    console.log('Network failed for dynamic request:', request.url)
    
    // If we have a cached version, return it
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Otherwise, return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await cache.match('/offline.html')
      if (offlineResponse) {
        return offlineResponse
      }
    }
    
    throw error
  })
  
  // Return cached version immediately if available, otherwise wait for network
  return cachedResponse || networkPromise
}

// Update cache in background
async function updateCacheInBackground(request, cache) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
  } catch (error) {
    // Silent fail for background updates
    console.log('Background cache update failed:', request.url)
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Push notification received')
  
  if (!event.data) {
    return
  }
  
  try {
    const data = event.data.json()
    const options = {
      body: data.body || 'You have a new notification',
      icon: '/icons/notification-icon.png',
      badge: '/icons/badge-icon.png',
      image: data.image,
      vibrate: getVibrationPattern(data.priority),
      data: {
        url: data.url || '/portal',
        timestamp: Date.now(),
        id: data.id || Math.random().toString(36).substr(2, 9)
      },
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/icons/view-icon.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icons/dismiss-icon.png'
        }
      ],
      requireInteraction: data.priority === 'high' || data.priority === 'urgent',
      silent: false,
      tag: data.tag || 'prism-notification'
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Prism Health Lab', options)
    )
  } catch (error) {
    console.error('Error handling push notification:', error)
    
    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('Prism Health Lab', {
        body: 'You have a new notification',
        icon: '/icons/notification-icon.png'
      })
    )
  }
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification.tag)
  
  event.notification.close()
  
  const action = event.action
  const data = event.notification.data || {}
  
  if (action === 'dismiss') {
    return
  }
  
  // Handle notification click
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      const url = data.url || '/portal'
      
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus()
        }
      }
      
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    }).catch(error => {
      console.error('Error handling notification click:', error)
    })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

// Perform background sync operations
async function doBackgroundSync() {
  try {
    // Sync offline actions stored in IndexedDB
    const offlineActions = await getOfflineActions()
    
    for (const action of offlineActions) {
      try {
        await syncAction(action)
        await removeOfflineAction(action.id)
      } catch (error) {
        console.error('Failed to sync action:', action, error)
      }
    }
    
    // Refresh critical data
    await refreshCriticalData()
    
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// Utility functions
function getVibrationPattern(priority) {
  switch (priority) {
    case 'urgent':
      return [200, 100, 200, 100, 200]
    case 'high':
      return [100, 50, 100]
    case 'medium':
      return [100]
    default:
      return [50]
  }
}

// IndexedDB operations for offline storage
async function getOfflineActions() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('prism-offline', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['actions'], 'readonly')
      const store = transaction.objectStore('actions')
      const getAllRequest = store.getAll()
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result || [])
      getAllRequest.onerror = () => reject(getAllRequest.error)
    }
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('actions')) {
        const store = db.createObjectStore('actions', { keyPath: 'id' })
        store.createIndex('timestamp', 'timestamp', { unique: false })
      }
    }
  })
}

async function removeOfflineAction(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('prism-offline', 1)
    
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['actions'], 'readwrite')
      const store = transaction.objectStore('actions')
      const deleteRequest = store.delete(id)
      
      deleteRequest.onsuccess = () => resolve()
      deleteRequest.onerror = () => reject(deleteRequest.error)
    }
  })
}

async function syncAction(action) {
  const response = await fetch(action.url, {
    method: action.method || 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...action.headers
    },
    body: action.data ? JSON.stringify(action.data) : undefined
  })
  
  if (!response.ok) {
    throw new Error(`Sync failed: ${response.status}`)
  }
  
  return response
}

async function refreshCriticalData() {
  const criticalEndpoints = API_ENDPOINTS.critical
  const cache = await caches.open(API_CACHE)
  
  for (const endpoint of criticalEndpoints) {
    try {
      const request = new Request(endpoint)
      const response = await fetch(request)
      
      if (response.ok) {
        cache.put(request, response.clone())
      }
    } catch (error) {
      console.log('Failed to refresh critical data:', endpoint, error)
    }
  }
}

// Message handling from main thread
self.addEventListener('message', (event) => {
  const { type, payload } = event.data
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting()
      break
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME })
      break
      
    case 'CLEAR_CACHE':
      event.waitUntil(
        caches.keys().then(cacheNames => {
          return Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          )
        }).then(() => {
          event.ports[0].postMessage({ success: true })
        })
      )
      break
      
    case 'CACHE_URLS':
      if (payload?.urls) {
        event.waitUntil(
          caches.open(DYNAMIC_CACHE).then(cache => {
            return cache.addAll(payload.urls)
          }).then(() => {
            event.ports[0].postMessage({ success: true })
          })
        )
      }
      break
  }
})

console.log('Service Worker loaded successfully')