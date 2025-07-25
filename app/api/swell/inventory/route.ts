import { NextRequest, NextResponse } from 'next/server'
import { AdminSwellServerAPI } from '@/lib/admin-swell-server'

// GET /api/swell/inventory - Fetch inventory alerts and products with error safety
export async function GET(request: NextRequest) {
  try {
    console.log('=== SWELL INVENTORY API START ===')
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const threshold = parseInt(searchParams.get('threshold') || '10', 10)
    const alertsOnly = searchParams.get('alerts') === 'true'
    
    let data
    if (alertsOnly) {
      console.log(`Fetching inventory alerts (threshold: ${threshold})`)
      const alerts = await AdminSwellServerAPI.getInventoryAlerts(threshold)
      data = { alerts }
    } else {
      console.log(`Fetching products (limit: ${limit})`)
      const products = await AdminSwellServerAPI.getProducts(limit)
      data = { products }
    }
    
    console.log('Swell inventory data fetched successfully')
    console.log('=== SWELL INVENTORY API END ===')
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Swell inventory API failed:', error)
    console.log('=== SWELL INVENTORY API END (ERROR) ===')
    
    return NextResponse.json(
      { 
        products: [],
        alerts: [],
        error: 'Inventory data temporarily unavailable',
        fallback: true 
      }, 
      { status: 502 }
    )
  }
}