'use client'

import React from 'react'
import { CartProvider } from '@/context/CartContext'
import { AuthProvider } from '@/context/AuthContext'

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </AuthProvider>
  )
}