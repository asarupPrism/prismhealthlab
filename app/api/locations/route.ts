import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const includeInactive = searchParams.get('include_inactive') === 'true';
    
    // Build query
    let query = supabase
      .from('locations')
      .select('*')
      .order('name', { ascending: true });
    
    // Filter by active status unless requested otherwise
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }
    
    const { data: locations, error } = await query;
    
    if (error) {
      console.error('Error fetching locations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch locations' },
        { status: 500 }
      );
    }
    
    // Transform locations for frontend use
    const transformedLocations = locations?.map((location: { 
      id: string; 
      name: string; 
      address: string; 
      phone: string; 
      operating_hours: unknown; 
      services: unknown; 
      is_active: boolean 
    }) => ({
      id: location.id,
      name: location.name,
      address: location.address,
      phone: location.phone,
      operatingHours: location.operating_hours,
      services: location.services,
      isActive: location.is_active,
      available: location.is_active // For compatibility with existing components
    })) || [];
    
    return NextResponse.json({
      locations: transformedLocations,
      count: transformedLocations.length
    });
    
  } catch (error) {
    console.error('Locations API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}