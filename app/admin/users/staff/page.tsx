import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import CreateStaffForm from '@/components/admin/CreateStaffForm'
import StaffList from '@/components/admin/StaffList'
import AdminSetupCard from '@/components/admin/AdminSetupCard'

export default async function AdminStaffPage() {
  const adminClient = getAdminClient()

  // Get all staff members with their roles and departments using admin client
  // Get all staff members with their roles and departments using fixed schema
  const { data: staff, error: staffError } = await adminClient
    .from('staff')
    .select(`
      *,
      staff_roles (
        name,
        description,
        is_admin_role
      ),
      staff_departments (
        name,
        description
      ),
      profiles (
        first_name,
        last_name,
        email,
        phone
      )
    `)
    .order('created_at', { ascending: false })

  // Log simplified staff loading status
  if (staffError) {
    console.error('Staff loading error:', staffError)
  }

  // Get roles and departments for the form using admin client
  const { data: roles, error: rolesError } = await adminClient
    .from('staff_roles')
    .select('*')
    .eq('is_active', true)
    .order('level', { ascending: false })

  const { data: departments, error: deptError } = await adminClient
    .from('staff_departments')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  // Check if setup is needed
  const needsSetup = (!roles || roles.length === 0) || (!departments || departments.length === 0)
  const hasDataIssues = rolesError || deptError || staffError

  // Log any errors for debugging
  if (rolesError) {
    console.error('Roles loading error:', rolesError)
  }
  if (deptError) {
    console.error('Departments loading error:', deptError)
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
            Staff Management
          </h1>
          <p className="text-slate-400 text-lg mt-2">
            Create and manage admin accounts and staff permissions
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
      </div>

      {/* Setup Card - shown when data is missing */}
      {(needsSetup || hasDataIssues) && (
        <AdminSetupCard 
          needsSetup={needsSetup}
          hasRoles={!!(roles && roles.length > 0)}
          hasDepartments={!!(departments && departments.length > 0)}
          errors={{
            roles: rolesError?.message,
            departments: deptError?.message,
            staff: staffError?.message
          }}
        />
      )}

      {/* Create Staff Section - only show if setup is complete */}
      {!needsSetup && !hasDataIssues && (
        <CreateStaffForm 
          roles={roles || []} 
          departments={departments || []} 
        />
      )}

      {/* Current Staff List */}
      <StaffList staff={staff || []} />
    </div>
  )
}