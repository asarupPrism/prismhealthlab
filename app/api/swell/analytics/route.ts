import { NextResponse } from 'next/server'
import { AdminSwellServerAPI } from '@/lib/admin-swell-server'

// GET /api/swell/analytics - Fetch analytics data from Swell with error safety
export async function GET() {
  try {
    console.log('=== SWELL ANALYTICS API START ===')
    
    // Fetch analytics data with timeout using static method
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Analytics request timeout after 15 seconds')), 15000)
    })
    
    const analyticsPromise = AdminSwellServerAPI.getAnalytics()
    
    const analytics = await Promise.race([analyticsPromise, timeoutPromise])
    
    console.log('Swell analytics fetched successfully')
    console.log('=== SWELL ANALYTICS API END ===')
    
    return NextResponse.json(analytics)
    
  } catch (error) {
    console.error('Swell analytics API failed:', error)
    console.log('=== SWELL ANALYTICS API END (ERROR) ===')
    
    // Return safe fallback data instead of 500 error
    const fallbackAnalytics = {
      revenue: { today: 0, week: 0, month: 0, year: 0 },
      orders: { today: 0, week: 0, month: 0, pending: 0, completed: 0, cancelled: 0, total: 0 },
      products: { total: 0, active: 0, out_of_stock: 0, low_stock: 0 },
      customers: { total: 0, new_this_month: 0, repeat_customers: 0 }
    }
    
    return NextResponse.json(
      { 
        ...fallbackAnalytics,
        error: 'Analytics temporarily unavailable',
        fallback: true 
      }, 
      { status: 502 }
    )
  }
}