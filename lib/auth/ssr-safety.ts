// Utilities for SSR-safe auth handling

// Check if code is running on the server
export const isServer = typeof window === 'undefined'

// Check if code is running on the client
export const isClient = typeof window !== 'undefined'

// Safe localStorage access that won't throw during SSR
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (isServer) return null
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  
  setItem: (key: string, value: string): void => {
    if (isServer) return
    try {
      localStorage.setItem(key, value)
    } catch {
      // Silently fail
    }
  },
  
  removeItem: (key: string): void => {
    if (isServer) return
    try {
      localStorage.removeItem(key)
    } catch {
      // Silently fail
    }
  }
}

// Safe sessionStorage access that won't throw during SSR
export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    if (isServer) return null
    try {
      return sessionStorage.getItem(key)
    } catch {
      return null
    }
  },
  
  setItem: (key: string, value: string): void => {
    if (isServer) return
    try {
      sessionStorage.setItem(key, value)
    } catch {
      // Silently fail
    }
  },
  
  removeItem: (key: string): void => {
    if (isServer) return
    try {
      sessionStorage.removeItem(key)
    } catch {
      // Silently fail
    }
  }
}

// Safe document access that won't throw during SSR
export const safeDocument = {
  addEventListener: (event: string, handler: EventListener): void => {
    if (isServer) return
    document.addEventListener(event, handler)
  },
  
  removeEventListener: (event: string, handler: EventListener): void => {
    if (isServer) return
    document.removeEventListener(event, handler)
  },
  
  querySelector: (selector: string): Element | null => {
    if (isServer) return null
    return document.querySelector(selector)
  },
  
  getElementById: (id: string): HTMLElement | null => {
    if (isServer) return null
    return document.getElementById(id)
  }
}

// Safe window access that won't throw during SSR
export const safeWindow = {
  addEventListener: (event: string, handler: EventListener): void => {
    if (isServer) return
    window.addEventListener(event, handler)
  },
  
  removeEventListener: (event: string, handler: EventListener): void => {
    if (isServer) return
    window.removeEventListener(event, handler)
  },
  
  location: {
    get href(): string {
      return isServer ? '' : window.location.href
    },
    
    get pathname(): string {
      return isServer ? '' : window.location.pathname
    },
    
    get search(): string {
      return isServer ? '' : window.location.search
    },
    
    get hash(): string {
      return isServer ? '' : window.location.hash
    }
  }
}

// Create a safe timeout that works in both SSR and client environments
export const safeSetTimeout = (callback: () => void, delay: number): NodeJS.Timeout | number => {
  if (isServer) {
    // Return a dummy timeout ID for SSR
    return 0 as unknown as NodeJS.Timeout
  }
  return setTimeout(callback, delay)
}

// Create a safe interval that works in both SSR and client environments
export const safeSetInterval = (callback: () => void, delay: number): NodeJS.Timeout | number => {
  if (isServer) {
    // Return a dummy interval ID for SSR
    return 0 as unknown as NodeJS.Timeout
  }
  return setInterval(callback, delay)
}

// Clear timeout safely
export const safeClearTimeout = (timeoutId: NodeJS.Timeout | number): void => {
  if (isServer) return
  clearTimeout(timeoutId as NodeJS.Timeout)
}

// Clear interval safely
export const safeClearInterval = (intervalId: NodeJS.Timeout | number): void => {
  if (isServer) return
  clearInterval(intervalId as NodeJS.Timeout)
}

// Safe performance API access
export const safePerformance = {
  now: (): number => {
    if (isServer) return Date.now()
    return performance.now()
  },
  
  mark: (name: string): void => {
    if (isServer) return
    if ('mark' in performance) {
      performance.mark(name)
    }
  },
  
  measure: (name: string, startMark?: string, endMark?: string): void => {
    if (isServer) return
    if ('measure' in performance) {
      performance.measure(name, startMark, endMark)
    }
  }
}

// Safe navigator API access
export const safeNavigator = {
  get userAgent(): string {
    return isServer ? '' : navigator.userAgent
  },
  
  get onLine(): boolean {
    return isServer ? true : navigator.onLine
  },
  
  get language(): string {
    return isServer ? 'en-US' : navigator.language
  }
}

// Helper to create SSR-safe default values
export function createSSRSafeDefault<T>(clientValue: () => T, serverValue: T): T {
  return isServer ? serverValue : clientValue()
}

// Helper to execute code only on the client
export function clientOnly<T>(callback: () => T, fallback?: T): T | undefined {
  if (isServer) return fallback
  return callback()
}

// Helper to execute code only on the server
export function serverOnly<T>(callback: () => T, fallback?: T): T | undefined {
  if (isClient) return fallback
  return callback()
}

// Type guard for checking if we're in a browser environment
export function isBrowser(): boolean {
  return isClient && typeof window !== 'undefined' && typeof document !== 'undefined'
}

// Type guard for checking if we're in a Node.js environment
export function isNode(): boolean {
  return isServer && typeof process !== 'undefined' && process.versions && !!process.versions.node
}