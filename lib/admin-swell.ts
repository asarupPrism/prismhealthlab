'use client'

import { swellHelpers } from '@/lib/swell'

// Admin-specific Swell integration utilities
export interface SwellProduct {
  id: string
  name: string
  description: string
  price: number
  active: boolean
  categories: string[]
  stock_level?: number
  sku?: string
  created_at: string
  updated_at: string
}

export interface SwellOrder {
  id: string
  number: string
  status: string
  customer_name: string
  customer_email: string
  items: { id: string; name: string; quantity: number; price: number }[]
  total: number
  payment_status: string
  date_created: string
  date_updated: string
}

export interface SwellCustomer {
  id: string
  name: string
  email: string
  phone?: string
  orders_count: number
  total_spent: number
  date_created: string
}

export interface SwellAnalytics {
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

export class AdminSwellAPI {
  // Get all products for admin management
  async getProducts(options = { limit: 50, page: 1 }): Promise<SwellProduct[]> {
    try {
      const products = await swellHelpers.getProducts({
        limit: options.limit,
        page: options.page
      })
      
      return (products.results || []).map((product) => ({
        id: product.id || '',
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        active: product.active || false,
        categories: (product.categories as { name: string }[] | undefined)?.map(cat => cat.name) || [],
        stock_level: product.stock_level || 0,
        sku: product.sku || '',
        created_at: product.date_created || '',
        updated_at: product.date_updated || ''
      }))
    } catch (error) {
      console.error('Error fetching products:', error)
      return []
    }
  }

  // Get all orders for admin management
  async getOrders(): Promise<SwellOrder[]> {
    // TODO: Implement direct swell API calls for orders
    // This function is currently not used by the main admin dashboard
    // which uses admin-swell-server.ts instead
    console.warn('AdminSwellAPI.getOrders is not implemented - use admin-swell-server.ts instead')
    return []
  }

  // Get customers for admin management
  async getCustomers(): Promise<SwellCustomer[]> {
    // TODO: Implement direct swell API calls for customers
    // This function is currently not used by the main admin dashboard
    // which uses admin-swell-server.ts instead
    console.warn('AdminSwellAPI.getCustomers is not implemented - use admin-swell-server.ts instead')
    return []
  }

  // Update product
  async updateProduct(): Promise<boolean> {
    // TODO: Implement direct swell API calls for product updates
    // This function is currently not used by the main admin dashboard
    console.warn('AdminSwellAPI.updateProduct is not implemented')
    return false
  }

  // Update order status
  async updateOrderStatus(): Promise<boolean> {
    // TODO: Implement direct swell API calls for order updates
    // This function is currently not used by the main admin dashboard
    console.warn('AdminSwellAPI.updateOrderStatus is not implemented')
    return false
  }

  // Get analytics data
  async getAnalytics(): Promise<SwellAnalytics> {
    // This function is currently not used by the main admin dashboard
    // which uses admin-swell-server.ts instead
    console.warn('AdminSwellAPI.getAnalytics is not implemented - use admin-swell-server.ts instead')
    
    return {
      revenue: { today: 0, week: 0, month: 0, year: 0 },
      orders: { today: 0, week: 0, month: 0, pending: 0, completed: 0, cancelled: 0 },
      products: { total: 0, active: 0, out_of_stock: 0, low_stock: 0 },
      customers: { total: 0, new_this_month: 0, repeat_customers: 0 }
    }
  }


  // Create or update product
  async createProduct(): Promise<string | null> {
    // TODO: Implement direct swell API calls for product creation
    // This function is currently not used by the main admin dashboard
    console.warn('AdminSwellAPI.createProduct is not implemented')
    return null
  }

  // Delete product
  async deleteProduct(): Promise<boolean> {
    // TODO: Implement direct swell API calls for product deletion
    // This function is currently not used by the main admin dashboard
    console.warn('AdminSwellAPI.deleteProduct is not implemented')
    return false
  }

  // Process refund
  async processRefund(): Promise<boolean> {
    // TODO: Implement direct swell API calls for refund processing
    // This function is currently not used by the main admin dashboard
    console.warn('AdminSwellAPI.processRefund is not implemented')
    return false
  }

  // Get inventory alerts
  async getInventoryAlerts(): Promise<{ product: SwellProduct; alert_type: 'low_stock' | 'out_of_stock' }[]> {
    try {
      const products = await this.getProducts({ limit: 1000, page: 1 })
      const alerts: { product: SwellProduct; alert_type: 'low_stock' | 'out_of_stock' }[] = []

      products.forEach(product => {
        if (product.stock_level === 0) {
          alerts.push({ product, alert_type: 'out_of_stock' })
        } else if (product.stock_level && product.stock_level < 10) {
          alerts.push({ product, alert_type: 'low_stock' })
        }
      })

      return alerts
    } catch (error) {
      console.error('Error getting inventory alerts:', error)
      return []
    }
  }
}

// Helper function to create admin Swell API instance
export const createAdminSwellAPI = () => new AdminSwellAPI()