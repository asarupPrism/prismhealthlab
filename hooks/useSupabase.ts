'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type Tables = Database['public']['Tables']
type TableName = keyof Tables

// Generic hook for Supabase operations
export function useSupabase() {
  const supabase = createClient()
  
  return {
    supabase,
    
    // Generic fetch function with simplified return type
    async fetch(
      table: string,
      options?: {
        select?: string
        filter?: Record<string, unknown>
        orderBy?: { column: string; ascending?: boolean }
        limit?: number
      }
    ) {
      let query = supabase.from(table).select(options?.select || '*')
      
      // Apply filters
      if (options?.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }
      
      // Apply ordering
      if (options?.orderBy) {
        query = query.order(options.orderBy.column, { 
          ascending: options.orderBy.ascending ?? true 
        })
      }
      
      // Apply limit
      if (options?.limit) {
        query = query.limit(options.limit)
      }
      
      return await query
    },
    
    // Generic insert function
    async insert(
      table: string,
      data: Record<string, unknown> | Record<string, unknown>[]
    ) {
      return await supabase.from(table).insert(data).select()
    },
    
    // Generic update function
    async update(
      table: string,
      data: Record<string, unknown>,
      filter: Record<string, unknown>
    ) {
      let query = supabase.from(table).update(data)
      
      Object.entries(filter).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
      
      return await query.select()
    },
    
    // Generic delete function
    async remove(
      table: string,
      filter: Record<string, unknown>
    ) {
      let query = supabase.from(table).delete()
      
      Object.entries(filter).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
      
      return await query
    }
  }
}

// Hook for real-time subscriptions
export function useRealtimeSubscription(
  table: string,
  callback: (payload: unknown) => void,
  filter?: Record<string, unknown>
) {
  const supabase = createClient()
  
  useEffect(() => {
    let channel = supabase
      .channel(`${table}_changes`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: table,
        filter: filter ? Object.entries(filter).map(([key, value]) => `${key}=eq.${value}`).join(',') : undefined,
      }, callback)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, callback, filter])
}

// Hook for loading data with state management
export function useSupabaseQuery(
  table: string,
  options?: {
    select?: string
    filter?: Record<string, unknown>
    orderBy?: { column: string; ascending?: boolean }
    limit?: number
    enabled?: boolean
  }
) {
  const [data, setData] = useState<unknown[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)
  
  const { fetch } = useSupabase()
  
  useEffect(() => {
    if (options?.enabled === false) return
    
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      
      const result = await fetch(table, options)
      
      if (result.error) {
        setError(result.error)
      } else {
        setData(result.data)
      }
      
      setLoading(false)
    }
    
    fetchData()
  }, [table, JSON.stringify(options)])
  
  const refetch = async () => {
    setLoading(true)
    setError(null)
    
    const result = await fetch(table, options)
    
    if (result.error) {
      setError(result.error)
    } else {
      setData(result.data)
    }
    
    setLoading(false)
  }
  
  return {
    data,
    loading,
    error,
    refetch,
  }
}