'use client'

import React, { useState, useEffect } from 'react'

interface ClientOnlyAuthProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

// Component that only renders on the client to avoid hydration mismatches
export default function ClientOnlyAuth({ children, fallback }: ClientOnlyAuthProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return fallback || null
  }

  return <>{children}</>
}

// Hook version of ClientOnlyAuth
export function useClientOnlyAuth() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}

// Higher-order component version
export function withClientOnlyAuth<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  const ClientOnlyComponent = (props: P) => {
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
      setIsClient(true)
    }, [])

    if (!isClient) {
      return fallback || null
    }

    return <Component {...props} />
  }

  ClientOnlyComponent.displayName = `withClientOnlyAuth(${Component.displayName || Component.name})`
  
  return ClientOnlyComponent
}

// Component for conditional client-side rendering based on auth state
export function ConditionalClientAuth({
  condition,
  children,
  fallback,
  ssrFallback
}: {
  condition: () => boolean
  children: React.ReactNode
  fallback?: React.ReactNode
  ssrFallback?: React.ReactNode
}) {
  const [isClient, setIsClient] = useState(false)
  const [conditionMet, setConditionMet] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setConditionMet(condition())
  }, [condition])

  if (!isClient) {
    return ssrFallback || null
  }

  return conditionMet ? <>{children}</> : fallback || null
}