import { NextRequest, NextResponse } from 'next/server';
import { getActiveLocations } from '@/lib/actions/locations';

export async function GET(request: NextRequest) {
  try {
    // Use the action to get locations
    const result = await getActiveLocations();
    
    if (!result.success) {
      console.error('Error fetching locations:', result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to fetch locations' },
        { status: 500 }
      );
    }
    
    // Transform locations for frontend use (appointment scheduler compatibility)
    const transformedLocations = result.data.map(location => ({
      id: location.id,
      name: location.name,
      address: [
        location.address_line_1,
        location.address_line_2,
        `${location.city}, ${location.state} ${location.zip_code}`
      ].filter(Boolean).join(', '),
      phone: location.phone,
      operatingHours: location.operating_hours,
      services: location.services_offered,
      capacity: location.capacity,
      acceptsWalkIns: location.accepts_walk_ins,
      isActive: true, // Only active locations are returned
      available: true // For compatibility with existing components
    }));
    
    return NextResponse.json({
      success: true,
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