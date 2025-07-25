import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/admin/check - Check if user is admin (server-side with service role)
export async function POST(request: NextRequest) {
  try {
    console.log('=== SERVER ADMIN CHECK API START ===')
    
    const { userId } = await request.json()
    
    if (!userId) {
      console.log('No userId provided in request')
      return NextResponse.json({ isAdmin: false, error: 'No userId provided' }, { status: 400 })
    }

    console.log('Server API: Checking admin for user:', userId)
    
    // Create server-side Supabase client (uses service role, can bypass RLS)
    const supabase = await createClient()
    
    // Query staff table using server-side client with service role permissions
    console.log('Server API: Querying staff table...')
    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    console.log('Server API: Staff query completed!')
    console.log('Server API: Staff query result:', { staffData, staffError })

    if (staffError) {
      console.error('Server API: Staff query failed:', staffError)
      return NextResponse.json({ isAdmin: false, error: staffError.message }, { status: 500 })
    }

    if (!staffData) {
      console.log('Server API: No staff record found - user is not admin')
      return NextResponse.json({ isAdmin: false })
    }

    console.log('Server API: Staff record found:', staffData)

    // Check basic admin flags
    const hasAdminAccess = staffData.can_access_admin === true
    const isActive = staffData.is_active === true
    
    console.log('Server API: Admin access check:', {
      hasAdminAccess,
      isActive,
      canProceed: hasAdminAccess && isActive
    })

    const isAdmin = hasAdminAccess && isActive

    if (isAdmin) {
      console.log('✅ Server API: User has admin access!')
    } else {
      console.log('Server API: Staff exists but lacks admin access or is inactive')
    }
    
    console.log('=== SERVER ADMIN CHECK API END ===')
    
    return NextResponse.json({ isAdmin })
    
  } catch (error) {
    console.error('Server API: Error in admin check:', error)
    console.log('=== SERVER ADMIN CHECK API END (ERROR) ===')
    return NextResponse.json({ isAdmin: false, error: 'Internal server error' }, { status: 500 })
  }
}