// Server-side Swell API utilities for Prism Health Lab
// For use in server components and API routes only

import 'server-only'

// Use eval to hide the import from bundler analysis
function createSwellClient() {
  const { Client } = eval('require("swell-node")')
  return new Client(
    process.env.SWELL_STORE_ID || process.env.NEXT_PUBLIC_SWELL_STORE_ID || '',
    process.env.SWELL_SECRET_KEY || ''
  )
}

// Lazy, memoized client to avoid build-time side effects
let _swellClient: any | null = null
function getSwellClient() {
  if (!_swellClient) {
    _swellClient = createSwellClient()
  }
  return _swellClient
}

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

interface SwellProduct {
  id: string
  name: string
  active: boolean
  price: number
  currency: string
  stock_level?: number
  created_at: string
  updated_at: string
}

// Direct helper functions using the ready-to-go client
export async function getSwellAnalytics(): Promise<SwellAnalytics> {
  try {
    console.log('Fetching Swell analytics data...')
    
    const today = new Date().toISOString().split('T')[0]
    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
    const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString()

    // Fetch data using the ready client
    const client = getSwellClient()

    const [allOrders, todayOrders, weekOrders, monthOrders, allProducts, allCustomers] = await Promise.all([
      client.get('/orders', { limit: 1000 }),
      client.get('/orders', { 
        limit: 1000, 
        where: { date_created: { $gte: today } }
      }),
      client.get('/orders', { 
        limit: 1000, 
        where: { date_created: { $gte: weekStart } }
      }),
      client.get('/orders', { 
        limit: 1000, 
        where: { date_created: { $gte: monthStart } }
      }),
      client.get('/products', { limit: 1000 }),
      client.get('/accounts', { limit: 1000 })
    ])

    // Process data (same logic as before)
    const orders = (allOrders as { results?: SwellOrder[] }).results || []
    const todayOrdersData = (todayOrders as { results?: SwellOrder[] }).results || []
    const weekOrdersData = (weekOrders as { results?: SwellOrder[] }).results || []
    const monthOrdersData = (monthOrders as { results?: SwellOrder[] }).results || []

    // Calculate revenue
    const todayRevenue = todayOrdersData.reduce((sum: number, order: SwellOrder) => sum + (order.total || 0), 0)
    const weekRevenue = weekOrdersData.reduce((sum: number, order: SwellOrder) => sum + (order.total || 0), 0)
    const monthRevenue = monthOrdersData.reduce((sum: number, order: SwellOrder) => sum + (order.total || 0), 0)
    const yearRevenue = orders
      .filter((order: SwellOrder) => new Date(order.created_at) >= new Date(yearStart))
      .reduce((sum: number, order: SwellOrder) => sum + (order.total || 0), 0)

    // Calculate order counts
    const pendingOrders = orders.filter((order: SwellOrder) => 
      ['pending', 'draft', 'payment_pending'].includes(order.status)
    ).length
    
    const completedOrders = orders.filter((order: SwellOrder) => 
      ['complete', 'delivered'].includes(order.status)
    ).length

    const cancelledOrders = orders.filter((order: SwellOrder) => 
      ['cancelled', 'canceled', 'refunded'].includes(order.status)
    ).length

    // Process products data
    const products = (allProducts as { results?: SwellProduct[] }).results || []
    const activeProducts = products.filter((product: SwellProduct) => product.active).length
    const outOfStockProducts = products.filter((product: SwellProduct) => 
      (product.stock_level !== undefined && product.stock_level <= 0)
    ).length
    const lowStockProducts = products.filter((product: SwellProduct) => 
      (product.stock_level !== undefined && product.stock_level > 0 && product.stock_level <= 10)
    ).length

    // Process customers data
    const customers = (allCustomers as { results?: { date_created: string; order_count: number }[] }).results || []
    const newCustomersThisMonth = customers.filter((customer) => 
      new Date(customer.date_created) >= new Date(monthStart)
    ).length
    
    const repeatCustomers = customers.filter((customer) => 
      customer.order_count > 1
    ).length

    return {
      revenue: {
        today: todayRevenue,
        week: weekRevenue,
        month: monthRevenue,
        year: yearRevenue
      },
      orders: {
        today: todayOrdersData.length,
        week: weekOrdersData.length,
        month: monthOrdersData.length,
        pending: pendingOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
        total: orders.length
      },
      products: {
        total: products.length,
        active: activeProducts,
        out_of_stock: outOfStockProducts,
        low_stock: lowStockProducts
      },
      customers: {
        total: customers.length,
        new_this_month: newCustomersThisMonth,
        repeat_customers: repeatCustomers
      }
    }
  } catch (error) {
    console.error('Error fetching Swell analytics:', error)
    
    // Return placeholder data if API fails
    return {
      revenue: { today: 0, week: 0, month: 0, year: 0 },
      orders: { today: 0, week: 0, month: 0, pending: 0, completed: 0, cancelled: 0, total: 0 },
      products: { total: 0, active: 0, out_of_stock: 0, low_stock: 0 },
      customers: { total: 0, new_this_month: 0, repeat_customers: 0 }
    }
  }
}

export async function getSwellOrders(limit = 10): Promise<SwellOrder[]> {
  try {
    const client = getSwellClient()
    const response = await client.get('/orders', { 
      limit, 
      sort: '-date_created' 
    })
    return (response as { results?: SwellOrder[] }).results || []
  } catch (error) {
    console.error('Error fetching recent orders:', error)
    return []
  }
}

export async function getSwellProducts(limit = 50): Promise<SwellProduct[]> {
  try {
    const client = getSwellClient()
    const response = await client.get('/products', { 
      limit, 
      sort: '-date_created' 
    })
    return (response as { results?: SwellProduct[] }).results || []
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export async function getSwellOrder(orderId: string): Promise<SwellOrder | null> {
  try {
    const client = getSwellClient()
    const order = await client.get(`/orders/${orderId}`)
    return order as SwellOrder
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error)
    return null
  }
}

export async function updateSwellOrderStatus(orderId: string, status: string): Promise<boolean> {
  try {
    const client = getSwellClient()
    await client.put(`/orders/${orderId}`, { status })
    return true
  } catch (error) {
    console.error(`Error updating order ${orderId}:`, error)
    return false
  }
}

export async function searchSwellOrdersByEmail(email: string): Promise<SwellOrder[]> {
  try {
    const client = getSwellClient()
    const response = await client.get('/orders', {
      where: { 'account.email': email }
    })
    return (response as { results?: SwellOrder[] }).results || []
  } catch (error) {
    console.error(`Error searching orders for ${email}:`, error)
    return []
  }
}

export async function getSwellInventoryAlerts(threshold = 10): Promise<SwellProduct[]> {
  try {
    const client = getSwellClient()
    const response = await client.get('/products', {
      where: { 
        stock_level: { $lt: threshold },
        active: true 
      }
    })
    return (response as { results?: SwellProduct[] }).results || []
  } catch (error) {
    console.error('Error fetching inventory alerts:', error)
    return []
  }
}

// Legacy class-based API for backwards compatibility
export class AdminSwellServerAPI {
  static async getAnalytics() { return getSwellAnalytics() }
  static async getRecentOrders(limit?: number) { return getSwellOrders(limit) }
  static async getProducts(limit?: number) { return getSwellProducts(limit) }
  static async getOrder(orderId: string) { return getSwellOrder(orderId) }
  static async updateOrderStatus(orderId: string, status: string) { return updateSwellOrderStatus(orderId, status) }
  static async searchOrdersByEmail(email: string) { return searchSwellOrdersByEmail(email) }
  static async getInventoryAlerts(threshold?: number) { return getSwellInventoryAlerts(threshold) }
}
