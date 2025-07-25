// Server-only Swell analytics helper
// This file should NEVER be imported by client-side code

import 'server-only' // This ensures it can only be used server-side

interface SwellAnalytics {
  revenue: {
    today: number
    week: number
    month: number
    year: number
  }
  orders: {
    today: number
    week: number
    month: number
    pending: number
    completed: number
    cancelled: number
    total: number
  }
  products: {
    total: number
    active: number
    out_of_stock: number
    low_stock: number
  }
  customers: {
    total: number
    new_this_month: number
    repeat_customers: number
  }
}

interface SwellOrder {
  id: string
  number: string
  status: string
  total: number
  currency: string
  customer_email: string
  created_at: string
  updated_at: string
}

// Server-only analytics function
export async function getSwellAnalytics(): Promise<SwellAnalytics> {
  try {
    // Use dynamic import with static method pattern
    const { AdminSwellServerAPI } = await import('./admin-swell-server')
    return await AdminSwellServerAPI.getAnalytics()
  } catch (error) {
    console.error('Server-side Swell analytics error:', error)
    // Return fallback data
    return {
      revenue: { today: 0, week: 0, month: 0, year: 0 },
      orders: { today: 0, week: 0, month: 0, pending: 0, completed: 0, cancelled: 0, total: 0 },
      products: { total: 0, active: 0, out_of_stock: 0, low_stock: 0 },
      customers: { total: 0, new_this_month: 0, repeat_customers: 0 }
    }
  }
}

// Server-only orders function
export async function getSwellOrders(limit = 10): Promise<SwellOrder[]> {
  try {
    const { AdminSwellServerAPI } = await import('./admin-swell-server')
    return await AdminSwellServerAPI.getRecentOrders(limit)
  } catch (error) {
    console.error('Server-side Swell orders error:', error)
    return []
  }
}

// Server-only order search function
export async function searchSwellOrdersByEmail(email: string): Promise<SwellOrder[]> {
  try {
    const { AdminSwellServerAPI } = await import('./admin-swell-server')
    return await AdminSwellServerAPI.searchOrdersByEmail(email)
  } catch (error) {
    console.error('Server-side Swell order search error:', error)
    return []
  }
}