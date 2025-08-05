'use client'

import React, { useEffect } from 'react'
import { CartProvider } from '@/context/CartContext'
import { AuthProvider } from '@/context'
import { initializePerformanceOptimizations } from '@/lib/performance/optimization'

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    // Initialize performance optimizations on client side
    initializePerformanceOptimizations()
  }, [])

  return (
    <AuthProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </AuthProvider>
  )
}