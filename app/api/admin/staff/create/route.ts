import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    // Verify the request is from an authenticated admin
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin privileges
    const { data: staffData } = await supabase
      .from('staff')
      .select('can_access_admin')
      .eq('user_id', user.id)
      .single()

    if (!staffData?.can_access_admin) {
      return NextResponse.json({ error: 'Insufficient privileges' }, { status: 403 })
    }

    // Parse request body
    const body = await req.json()
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      roleId,
      departmentId,
      employeeId,
      workEmail,
      workPhone,
      hireDate,
      canAccessAdmin,
      canViewPhi,
      permissions
    } = body

    // Use admin client with service role for user creation
    const adminClient = getAdminClient()

    // Create user in Supabase Auth
    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authUser.user) {
      return NextResponse.json({ error: 'User creation failed' }, { status: 400 })
    }

    try {
      // Create user profile
      const { error: profileError } = await adminClient
        .from('profiles')
        .insert({
          user_id: authUser.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          phone
        })

      if (profileError) throw profileError

      // Create staff record
      const { error: staffError } = await adminClient
        .from('staff')
        .insert({
          user_id: authUser.user.id,
          employee_id: employeeId,
          role_id: roleId,
          department_id: departmentId,
          work_email: workEmail,
          work_phone: workPhone,
          hire_date: hireDate,
          can_access_admin: canAccessAdmin,
          can_view_phi: canViewPhi,
          permissions: permissions || []
        })

      if (staffError) throw staffError

      return NextResponse.json({ 
        success: true, 
        userId: authUser.user.id,
        message: 'Staff member created successfully' 
      })

    } catch (dbError) {
      // Rollback: delete the created auth user if database operations fail
      await adminClient.auth.admin.deleteUser(authUser.user.id)
      console.error('Database error:', dbError)
      return NextResponse.json({ 
        error: dbError instanceof Error ? dbError.message : 'Database operation failed' 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }, { status: 500 })
  }
}