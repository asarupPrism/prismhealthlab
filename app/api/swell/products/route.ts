import { NextRequest, NextResponse } from 'next/server';
import { AdminSwellServerAPI } from '@/lib/admin-swell-server';

// GET /api/swell/products - Fetch products from Swell with error safety
export async function GET(request: NextRequest) {
  try {
    console.log('=== SWELL PRODUCTS API START ===')
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Use the static method to fetch products
    const products = await AdminSwellServerAPI.getProducts(limit)
    
    // Apply category filtering if requested (basic implementation)
    let filteredProducts = products
    if (category) {
      // Note: This is a simplified filter - in production you'd want more sophisticated category matching
      filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(category.toLowerCase())
      )
    }

    console.log(`Swell products fetched successfully (${filteredProducts.length} products)`)
    console.log('=== SWELL PRODUCTS API END ===')

    return NextResponse.json({ 
      results: filteredProducts,
      count: filteredProducts.length,
      page_count: Math.ceil(filteredProducts.length / limit)
    });
  } catch (error) {
    console.error('Swell products API failed:', error);
    console.log('=== SWELL PRODUCTS API END (ERROR) ===')
    
    return NextResponse.json(
      { 
        results: [],
        count: 0,
        page_count: 0,
        error: 'Products temporarily unavailable',
        fallback: true
      },
      { status: 502 }
    );
  }
}

// POST /api/swell/products - Create a new product (admin only)
export async function POST(request: NextRequest) {
  try {
    console.log('=== SWELL PRODUCT CREATE API START ===')
    
    const body = await request.json();
    
    // Validate required fields for diagnostic panels
    if (!body.name || !body.price) {
      return NextResponse.json(
        { error: 'Name and price are required' },
        { status: 400 }
      );
    }

    const productData = {
      name: body.name,
      price: body.price,
      description: body.description,
      active: true,
      purchasable: true,
      type: 'standard',
      categories: body.categories || [],
      attributes: {
        keyTests: body.keyTests || [],
        turnaroundTime: body.turnaroundTime || '2-3 days',
        fasting: body.fasting || false,
        sampleType: body.sampleType || 'Blood',
        biomarkers: body.biomarkers || 0,
        ...body.attributes
      },
      images: body.images || [],
      variants: body.variants || [],
    };

    // Note: The current AdminSwellServerAPI doesn't have a createProduct method
    // This would need to be added to lib/admin-swell-server.ts for full functionality
    // For now, return a placeholder response
    console.log('Product creation requested:', productData.name)
    console.log('=== SWELL PRODUCT CREATE API END ===')

    return NextResponse.json({
      id: 'temp-id-' + Date.now(),
      ...productData,
      created_at: new Date().toISOString(),
      message: 'Product creation API needs implementation in AdminSwellServerAPI'
    });
  } catch (error) {
    console.error('Swell product creation API failed:', error);
    console.log('=== SWELL PRODUCT CREATE API END (ERROR) ===')
    
    return NextResponse.json(
      { error: 'Product creation failed' },
      { status: 502 }
    );
  }
}