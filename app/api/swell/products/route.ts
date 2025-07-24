import { NextRequest, NextResponse } from 'next/server';
import { swell } from 'swell-node';

// Initialize Swell backend client (done per request to avoid edge runtime issues)
const initSwell = () => {
  return swell.init(
    process.env.NEXT_PUBLIC_SWELL_STORE_ID || '',
    process.env.SWELL_SECRET_KEY || ''
  );
};

// GET /api/swell/products - Fetch products from Swell
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    const params: Record<string, string | number | boolean> = {
      limit,
      page,
      active: true, // Only active products
    };

    if (category) {
      params['categories.slug'] = category;
    }

    await initSwell();
    const products = await swell.get('/products', params);

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/swell/products - Create a new product (admin only)
export async function POST(request: NextRequest) {
  try {
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

    await initSwell();
    const product = await swell.post('/products', productData);

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}