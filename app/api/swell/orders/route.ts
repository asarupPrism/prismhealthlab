import { NextRequest, NextResponse } from 'next/server'
import { AdminSwellServerAPI } from '@/lib/admin-swell-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/swell/orders - Fetch recent orders from Swell with error safety
export async function GET(request: NextRequest) {
  try {
    console.log('=== SWELL ORDERS API START ===')
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const email = searchParams.get('email')
    
    let orders
    if (email) {
      console.log(`Searching orders for email: ${email}`)
      orders = await AdminSwellServerAPI.searchOrdersByEmail(email)
    } else {
      console.log(`Fetching recent orders (limit: ${limit})`)
      orders = await AdminSwellServerAPI.getRecentOrders(limit)
    }
    
    console.log(`Swell orders fetched successfully (${orders.length} orders)`)
    console.log('=== SWELL ORDERS API END ===')
    
    return NextResponse.json({ orders })
    
  } catch (error) {
    console.error('Swell orders API failed:', error)
    console.log('=== SWELL ORDERS API END (ERROR) ===')
    
    return NextResponse.json(
      { 
        orders: [],
        error: 'Orders temporarily unavailable',
        fallback: true 
      }, 
      { status: 502 }
    )
  }
}

// PUT /api/swell/orders - Update order status
export async function PUT(request: NextRequest) {
  try {
    console.log('=== SWELL ORDER UPDATE API START ===')
    
    const { orderId, status } = await request.json()
    
    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Missing orderId or status' }, 
        { status: 400 }
      )
    }
    
    const success = await AdminSwellServerAPI.updateOrderStatus(orderId, status)
    
    if (success) {
      console.log(`Order ${orderId} status updated to ${status}`)
      console.log('=== SWELL ORDER UPDATE API END ===')
      return NextResponse.json({ success: true })
    } else {
      throw new Error('Failed to update order status')
    }
    
  } catch (error) {
    console.error('Swell order update API failed:', error)
    console.log('=== SWELL ORDER UPDATE API END (ERROR) ===')
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Order update failed' 
      }, 
      { status: 502 }
    )
  }
}
