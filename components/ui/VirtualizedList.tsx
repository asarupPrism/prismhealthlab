'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface VirtualizedListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number, isVisible: boolean) => React.ReactNode
  onLoadMore?: () => void
  hasNextPage?: boolean
  isLoading?: boolean
  overscan?: number
  className?: string
  itemKey?: (item: T, index: number) => string
  loadingComponent?: React.ReactNode
  emptyComponent?: React.ReactNode
  onScroll?: (scrollTop: number, scrollDirection: 'up' | 'down') => void
  estimatedItemHeight?: boolean
  maintainScrollPosition?: boolean
}

interface VirtualItem {
  index: number
  start: number
  end: number
  height: number
}

export default function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  onLoadMore,
  hasNextPage = false,
  isLoading = false,
  overscan = 5,
  className = '',
  itemKey,
  loadingComponent,
  emptyComponent,
  onScroll,
  estimatedItemHeight = false,
  maintainScrollPosition = true
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const [lastScrollDirection, setLastScrollDirection] = useState<'up' | 'down'>('down')
  
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollElementRef = useRef<HTMLDivElement>(null)
  const lastScrollTop = useRef(0)
  const resizeObserver = useRef<ResizeObserver>()
  const isScrolling = useRef(false)
  const scrollTimeout = useRef<NodeJS.Timeout>()

  // Calculate virtual items based on scroll position
  const virtualItems = useMemo(() => {
    if (items.length === 0) return []

    const getItemHeight = (index: number) => {
      if (estimatedItemHeight && itemHeights.has(index)) {
        return itemHeights.get(index)!
      }
      return itemHeight
    }

    let start = 0
    let currentTop = 0
    
    // Find start index
    while (start < items.length && currentTop < scrollTop - overscan * itemHeight) {
      currentTop += getItemHeight(start)
      start++
    }

    // Calculate visible items
    const virtualItems: VirtualItem[] = []
    let index = Math.max(0, start - overscan)
    let top = 0
    
    // Calculate top offset for starting position
    for (let i = 0; i < index; i++) {
      top += getItemHeight(i)
    }

    // Generate virtual items
    while (index < items.length && top < scrollTop + containerHeight + overscan * itemHeight) {
      const height = getItemHeight(index)
      virtualItems.push({
        index,
        start: top,
        end: top + height,
        height
      })
      top += height
      index++
    }

    return virtualItems
  }, [items.length, scrollTop, containerHeight, itemHeight, overscan, itemHeights, estimatedItemHeight])

  // Calculate total height
  const totalHeight = useMemo(() => {
    if (estimatedItemHeight) {
      return items.reduce((height, _, index) => {
        return height + (itemHeights.get(index) || itemHeight)
      }, 0)
    }
    return items.length * itemHeight
  }, [items.length, itemHeight, itemHeights, estimatedItemHeight])

  // Handle scroll events
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop
    setScrollTop(scrollTop)
    
    // Determine scroll direction
    const direction = scrollTop > lastScrollTop.current ? 'down' : 'up'
    if (direction !== lastScrollDirection) {
      setLastScrollDirection(direction)
    }
    lastScrollTop.current = scrollTop
    
    // Call onScroll callback
    onScroll?.(scrollTop, direction)
    
    // Set scrolling state
    isScrolling.current = true
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current)
    }
    scrollTimeout.current = setTimeout(() => {
      isScrolling.current = false
    }, 150)

    // Load more data when near bottom
    if (
      onLoadMore &&
      hasNextPage &&
      !isLoading &&
      scrollTop + containerHeight >= totalHeight - itemHeight * 3
    ) {
      onLoadMore()
    }
  }, [onLoadMore, hasNextPage, isLoading, totalHeight, containerHeight, itemHeight, onScroll, lastScrollDirection])

  // Handle item height measurement for estimated heights
  const measureItemHeight = useCallback(() => {
    // This would be used for dynamic height calculations
    // Currently simplified for basic virtualization
  }, [])

  // Resize observer for container width
  useEffect(() => {
    if (!containerRef.current) return

    resizeObserver.current = new ResizeObserver(() => {
      // Container width tracking would go here if needed
    })

    resizeObserver.current.observe(containerRef.current)
    
    return () => {
      resizeObserver.current?.disconnect()
    }
  }, [])

  // Maintain scroll position when items change
  useEffect(() => {
    if (maintainScrollPosition && scrollElementRef.current) {
      const element = scrollElementRef.current
      const currentScrollTop = element.scrollTop
      
      // Small delay to allow for DOM updates
      requestAnimationFrame(() => {
        if (element && Math.abs(element.scrollTop - currentScrollTop) > 1) {
          element.scrollTop = currentScrollTop
        }
      })
    }
  }, [items.length, maintainScrollPosition])

  // Cleanup
  useEffect(() => {
    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }
    }
  }, [])

  // Item wrapper component for height measurement
  const ItemWrapper = React.memo<{
    virtualItem: VirtualItem
    item: T
    children: React.ReactNode
  }>(({ virtualItem, item, children }) => {
    const itemRef = useRef<HTMLDivElement>(null)
    
    useEffect(() => {
      if (estimatedItemHeight && itemRef.current) {
        const height = itemRef.current.offsetHeight
        measureItemHeight(virtualItem.index, height)
      }
    }, [virtualItem.index, item, estimatedItemHeight, measureItemHeight])

    return (
      <div
        ref={itemRef}
        style={{
          position: 'absolute',
          top: virtualItem.start,
          left: 0,
          right: 0,
          height: estimatedItemHeight ? 'auto' : virtualItem.height,
          minHeight: estimatedItemHeight ? virtualItem.height : 'auto'
        }}
        data-index={virtualItem.index}
      >
        {children}
      </div>
    )
  })

  ItemWrapper.displayName = 'VirtualizedListItemWrapper'

  // Empty state
  if (items.length === 0 && !isLoading) {
    return (
      <div 
        ref={containerRef}
        className={`relative ${className}`} 
        style={{ height: containerHeight }}
      >
        {emptyComponent || (
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <p>No items to display</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`} 
      style={{ height: containerHeight }}
    >
      <div
        ref={scrollElementRef}
        className="h-full overflow-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-500"
        onScroll={handleScroll}
        style={{
          '--scrollbar-width': '8px',
          scrollbarWidth: 'thin'
        } as React.CSSProperties}
      >
        {/* Virtual container */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          <AnimatePresence mode="popLayout">
            {virtualItems.map((virtualItem) => {
              const item = items[virtualItem.index]
              const key = itemKey ? itemKey(item, virtualItem.index) : virtualItem.index
              const isVisible = virtualItem.start <= scrollTop + containerHeight && 
                              virtualItem.end >= scrollTop

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ 
                    duration: 0.2,
                    ease: 'easeOut'
                  }}
                  layout={false} // Disable layout animations for performance
                >
                  <ItemWrapper virtualItem={virtualItem} item={item}>
                    {renderItem(item, virtualItem.index, isVisible)}
                  </ItemWrapper>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {/* Loading indicator */}
          {isLoading && (
            <div
              style={{
                position: 'absolute',
                top: totalHeight,
                left: 0,
                right: 0,
                height: itemHeight
              }}
              className="flex items-center justify-center py-4"
            >
              {loadingComponent || (
                <div className="flex items-center gap-3 text-slate-400">
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Loading more items...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Scroll indicators */}
      {items.length > 0 && (
        <>
          {/* Scroll position indicator */}
          <div className="absolute top-2 right-2 bg-slate-800/80 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-slate-300 pointer-events-none">
            {Math.round((scrollTop / Math.max(totalHeight - containerHeight, 1)) * 100)}%
          </div>
          
          {/* Scroll direction indicator */}
          {isScrolling.current && (
            <div className="absolute top-2 left-2 bg-slate-800/80 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-slate-300 pointer-events-none">
              {lastScrollDirection === 'down' ? '↓' : '↑'}
            </div>
          )}
        </>
      )}

      {/* Performance metrics (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-2 left-2 bg-slate-800/80 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-slate-300 pointer-events-none font-mono">
          <div>Items: {items.length}</div>
          <div>Rendered: {virtualItems.length}</div>
          <div>Height: {totalHeight}px</div>
          <div>Scroll: {Math.round(scrollTop)}px</div>
        </div>
      )}
    </div>
  )
}

// Hook for managing virtualized list state
export function useVirtualizedList<T>({
  initialItems = [],
  // pageSize, itemHeight, estimatedItemHeight removed - not used
  fetchMore
}: {
  initialItems?: T[]
  pageSize?: number
  fetchMore?: (page: number) => Promise<{ items: T[], hasNextPage: boolean }>
  itemHeight?: number
  estimatedItemHeight?: boolean
}) {
  const [items, setItems] = useState<T[]>(initialItems)
  const [loading, setLoading] = useState(false)
  const [hasNextPage, setHasNextPage] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)

  const loadMore = useCallback(async () => {
    if (!fetchMore || loading || !hasNextPage) return

    try {
      setLoading(true)
      setError(null)
      
      const result = await fetchMore(page + 1)
      
      setItems(prevItems => [...prevItems, ...result.items])
      setHasNextPage(result.hasNextPage)
      setPage(prevPage => prevPage + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more items')
      console.error('Error loading more items:', err)
    } finally {
      setLoading(false)
    }
  }, [fetchMore, loading, hasNextPage, page])

  const refresh = useCallback(async () => {
    if (!fetchMore) return

    try {
      setLoading(true)
      setError(null)
      setPage(1)
      
      const result = await fetchMore(1)
      
      setItems(result.items)
      setHasNextPage(result.hasNextPage)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh items')
      console.error('Error refreshing items:', err)
    } finally {
      setLoading(false)
    }
  }, [fetchMore])

  const addItems = useCallback((newItems: T[], prepend = false) => {
    setItems(prevItems => prepend ? [...newItems, ...prevItems] : [...prevItems, ...newItems])
  }, [])

  const updateItem = useCallback((index: number, updatedItem: T) => {
    setItems(prevItems => {
      const newItems = [...prevItems]
      newItems[index] = updatedItem
      return newItems
    })
  }, [])

  const removeItem = useCallback((index: number) => {
    setItems(prevItems => prevItems.filter((_, i) => i !== index))
  }, [])

  return {
    items,
    loading,
    hasNextPage,
    error,
    loadMore,
    refresh,
    addItems,
    updateItem,
    removeItem,
    // Computed properties
    isEmpty: items.length === 0 && !loading,
    totalCount: items.length
  }
}