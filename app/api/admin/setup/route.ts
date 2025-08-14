import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

// POST /api/admin/setup - Initialize admin tables and seed data
export async function POST() {
  try {
    console.log('=== ADMIN SETUP API START ===')
    
    // Verify the request is from an authenticated user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.log('Setup API: No authenticated user')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Setup API: Authenticated user:', user.id)

    // Use admin client with service role for setup operations
    const adminClient = getAdminClient()
    
    // Execute setup directly without file reading
    console.log('Setup API: Executing SQL setup...')
    await executeSetupSections(adminClient)

    // Verify the setup by checking if roles and departments exist
    const { data: rolesCheck } = await adminClient
      .from('staff_roles')
      .select('id, name')
      .limit(1)

    const { data: deptCheck } = await adminClient
      .from('staff_departments')
      .select('id, name')
      .limit(1)

    console.log('Setup API: Verification - Roles found:', rolesCheck?.length || 0)
    console.log('Setup API: Verification - Departments found:', deptCheck?.length || 0)

    console.log('=== ADMIN SETUP API END ===')
    
    return NextResponse.json({ 
      success: true,
      message: 'Admin tables initialized successfully',
      rolesCreated: rolesCheck?.length || 0,
      departmentsCreated: deptCheck?.length || 0
    })
    
  } catch (error) {
    console.error('Setup API: Unexpected error:', error)
    console.log('=== ADMIN SETUP API END (ERROR) ===')
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }, { status: 500 })
  }
}

// Execute setup sections directly with RLS handling
async function executeSetupSections(adminClient: ReturnType<typeof getAdminClient>) {
  try {
    console.log('Setup API: Executing SQL sections with RLS handling...')

    // Enhanced table accessibility check with better diagnostics
    console.log('Setup API: Running comprehensive table accessibility check...')
    
    try {
      // Test departments table
      const { count: deptCount, error: deptAccessError } = await adminClient
        .from('staff_departments')
        .select('*', { count: 'exact', head: true })
      
      if (deptAccessError) {
        console.error('Setup API: Departments table access error:', deptAccessError)
        if (deptAccessError.message?.includes('infinite recursion')) {
          throw new Error(`RLS Recursion in departments table: ${deptAccessError.message}. Run: /database/GOLD_STANDARD_RLS_FIX.sql`)
        }
      } else {
        console.log('Setup API: Departments table accessible, current count:', deptCount)
      }

      // Test roles table  
      const { count: rolesCount, error: rolesAccessError } = await adminClient
        .from('staff_roles')
        .select('*', { count: 'exact', head: true })
      
      if (rolesAccessError) {
        console.error('Setup API: Roles table access error:', rolesAccessError)
        if (rolesAccessError.message?.includes('infinite recursion')) {
          throw new Error(`RLS Recursion in roles table: ${rolesAccessError.message}. Run: /database/GOLD_STANDARD_RLS_FIX.sql`)
        }
      } else {
        console.log('Setup API: Roles table accessible, current count:', rolesCount)
      }

      // Test staff table
      const { count: staffCount, error: staffAccessError } = await adminClient
        .from('staff')
        .select('*', { count: 'exact', head: true })
      
      if (staffAccessError) {
        console.error('Setup API: Staff table access error:', staffAccessError)
        if (staffAccessError.message?.includes('infinite recursion')) {
          throw new Error(`RLS Recursion in staff table: ${staffAccessError.message}. Run: /database/GOLD_STANDARD_RLS_FIX.sql`)
        }
      } else {
        console.log('Setup API: Staff table accessible, current count:', staffCount)
      }

    } catch (accessError) {
      console.error('Setup API: Critical table access error:', accessError)
      
      const errorMessage = accessError instanceof Error ? accessError.message : String(accessError)
      if (errorMessage?.includes('infinite recursion') || 
          errorMessage?.includes('policy')) {
        throw new Error(`Database RLS Issue Detected: ${errorMessage}. Please run the Gold Standard fix: /database/GOLD_STANDARD_RLS_FIX.sql`)
      }
      
      throw accessError
    }

    // Create departments data directly using upsert
    console.log('Setup API: Creating staff departments...')
    const { error: deptError } = await adminClient.from('staff_departments').upsert([
      { name: 'Administration', description: 'Executive and administrative management', is_active: true },
      { name: 'Laboratory Operations', description: 'Core laboratory testing and processing', is_active: true },
      { name: 'Clinical Affairs', description: 'Medical oversight and clinical operations', is_active: true },
      { name: 'Patient Services', description: 'Customer service and patient support', is_active: true },
      { name: 'Quality Assurance', description: 'Quality control and regulatory compliance', is_active: true },
      { name: 'Information Technology', description: 'IT support and system administration', is_active: true }
    ], { onConflict: 'name' })

    if (deptError) {
      console.error('Setup API: Departments creation failed:', deptError)
      
      // Check for common RLS errors
      if (deptError.message?.includes('infinite recursion') || 
          deptError.message?.includes('policy')) {
        throw new Error(`RLS Configuration Issue: ${deptError.message}. Please run the Gold Standard fix: /database/GOLD_STANDARD_RLS_FIX.sql`)
      }
      
      throw new Error(`Failed to create departments: ${deptError.message}`)
    }

    // Create roles data directly using upsert
    console.log('Setup API: Creating staff roles...')
    const { error: rolesError } = await adminClient.from('staff_roles').upsert([
      { 
        name: 'Super Administrator', 
        description: 'Full system access with all permissions', 
        level: 5, 
        default_permissions: ['*'], 
        is_admin_role: true, 
        is_active: true 
      },
      { 
        name: 'System Administrator', 
        description: 'Full admin access excluding system configuration', 
        level: 4, 
        default_permissions: ['user_management', 'appointment_management', 'result_management', 'order_management', 'location_management', 'test_management', 'staff_management', 'analytics_access', 'audit_access'], 
        is_admin_role: true, 
        is_active: true 
      },
      { 
        name: 'Lab Manager', 
        description: 'Laboratory operations and staff management', 
        level: 3, 
        default_permissions: ['result_management', 'appointment_management', 'test_management', 'staff_supervision', 'quality_control'], 
        is_admin_role: true, 
        is_active: true 
      },
      { 
        name: 'Medical Director', 
        description: 'Clinical oversight and result review', 
        level: 4, 
        default_permissions: ['result_management', 'clinical_oversight', 'patient_data_access', 'result_approval'], 
        is_admin_role: true, 
        is_active: true 
      },
      { 
        name: 'Lab Technician', 
        description: 'Laboratory testing and result processing', 
        level: 2, 
        default_permissions: ['result_processing', 'sample_processing', 'equipment_operation'], 
        is_admin_role: false, 
        is_active: true 
      },
      { 
        name: 'Phlebotomist', 
        description: 'Blood draw and sample collection', 
        level: 1, 
        default_permissions: ['sample_collection', 'appointment_management', 'patient_interaction'], 
        is_admin_role: false, 
        is_active: true 
      },
      { 
        name: 'Customer Service Representative', 
        description: 'Patient support and appointment scheduling', 
        level: 1, 
        default_permissions: ['appointment_management', 'customer_support', 'basic_order_info'], 
        is_admin_role: false, 
        is_active: true 
      }
    ], { onConflict: 'name' })

    if (rolesError) {
      console.error('Setup API: Roles creation failed:', rolesError)
      
      // Check for common RLS errors
      if (rolesError.message?.includes('infinite recursion') || 
          rolesError.message?.includes('policy')) {
        throw new Error(`RLS Configuration Issue: ${rolesError.message}. Please run the Gold Standard fix: /database/GOLD_STANDARD_RLS_FIX.sql`)
      }
      
      throw new Error(`Failed to create roles: ${rolesError.message}`)
    }

    console.log('Setup API: All sections executed successfully')

  } catch (error) {
    console.error('Setup API: Sectioned execution failed:', error)
    
    // Provide helpful error messages for common issues
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage?.includes('infinite recursion')) {
      throw new Error('Database RLS Configuration Issue: Infinite recursion detected. Please run the Gold Standard fix in your Supabase SQL editor: /database/GOLD_STANDARD_RLS_FIX.sql')
    } else if (errorMessage?.includes('relation') && errorMessage?.includes('does not exist')) {
      throw new Error('Database Schema Issue: Required tables do not exist. Please run the schema migration first.')
    }
    
    throw error
  }
}

// GET /api/admin/setup - Check if setup is needed
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = getAdminClient()
    
    // Check if roles and departments exist
    const { data: roles, error: rolesError } = await adminClient
      .from('staff_roles')
      .select('id')
      .limit(1)

    const { data: departments, error: deptError } = await adminClient
      .from('staff_departments')
      .select('id')
      .limit(1)

    const needsSetup = !roles || roles.length === 0 || !departments || departments.length === 0
    
    return NextResponse.json({
      needsSetup,
      hasRoles: roles && roles.length > 0,
      hasDepartments: departments && departments.length > 0,
      errors: {
        roles: rolesError?.message,
        departments: deptError?.message
      }
    })
    
  } catch (error) {
    console.error('Setup check error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      needsSetup: true
    }, { status: 500 })
  }
}