// Performance optimization utilities for Next.js

/**
 * Preload critical resources for faster page loading
 */
export function preloadResource(href: string, as: string, type?: string) {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  link.as = as
  if (type) link.type = type
  
  document.head.appendChild(link)
}

/**
 * Prefetch pages for improved navigation performance
 */
export function prefetchPage(href: string) {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = href
  
  document.head.appendChild(link)
}

/**
 * Lazy load images with intersection observer
 */
export function lazyLoadImage(img: HTMLImageElement, src: string) {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const image = entry.target as HTMLImageElement
          image.src = src
          image.classList.remove('lazy')
          observer.unobserve(image)
        }
      })
    })
    
    observer.observe(img)
  } else {
    // Fallback for browsers without IntersectionObserver
    img.src = src
  }
}

/**
 * Debounce function calls for performance optimization
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function calls for performance optimization
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Get connection quality for adaptive loading
 */
export function getConnectionSpeed(): 'slow' | 'fast' | 'unknown' {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return 'unknown'
  }

  const connection = (navigator as { connection?: { effectiveType?: string } }).connection
  
  if (connection) {
    const effectiveType = (connection as { effectiveType?: string }).effectiveType
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      return 'slow'
    }
    if (effectiveType === '3g' || effectiveType === '4g') {
      return 'fast'
    }
  }
  
  return 'unknown'
}

/**
 * Memory-efficient array chunking for large datasets
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  return chunks
}

/**
 * Performance-optimized virtual scrolling helpers
 */
export interface VirtualScrollOptions {
  itemHeight: number
  containerHeight: number
  overscan?: number
}

export function calculateVisibleRange(
  scrollTop: number,
  options: VirtualScrollOptions
): { start: number; end: number } {
  const { itemHeight, containerHeight, overscan = 3 } = options
  
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const end = start + visibleCount + overscan * 2
  
  return { start, end }
}

/**
 * Browser performance monitoring utilities
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  startTimer(name: string): void {
    this.metrics.set(name, performance.now())
  }

  endTimer(name: string): number {
    const startTime = this.metrics.get(name)
    if (startTime === undefined) {
      console.warn(`Timer "${name}" was not started`)
      return 0
    }

    const duration = performance.now() - startTime
    this.metrics.delete(name)
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`)
    }
    
    return duration
  }

  measureAsync<T>(name: string, asyncFn: () => Promise<T>): Promise<T> {
    this.startTimer(name)
    return asyncFn().finally(() => this.endTimer(name))
  }
}

/**
 * Resource loading strategies for improved performance
 */
export const loadingStrategies = {
  // Critical resources - load immediately
  critical: {
    fonts: ['/fonts/inter.woff2'],
    styles: ['/styles/critical.css'],
  },
  
  // Important resources - preload
  important: {
    scripts: ['/js/analytics.js'],
    images: ['/images/hero.webp'],
  },
  
  // Optional resources - prefetch
  optional: {
    pages: ['/portal', '/products'],
  },
} as const

/**
 * Initialize performance optimizations
 */
export function initializePerformanceOptimizations(): void {
  if (typeof window === 'undefined') return

  // Preload critical fonts
  loadingStrategies.critical.fonts.forEach((font) => {
    preloadResource(font, 'font', 'font/woff2')
  })

  // Preload important resources
  loadingStrategies.important.scripts.forEach((script) => {
    preloadResource(script, 'script')
  })

  // Prefetch optional pages on idle
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      loadingStrategies.optional.pages.forEach(prefetchPage)
    })
  }

  // Setup connection-aware loading
  const connectionSpeed = getConnectionSpeed()
  if (connectionSpeed === 'slow') {
    // Reduce animations and heavy resources for slow connections
    document.documentElement.classList.add('reduce-motion')
  }
}