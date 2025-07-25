import React from 'react'
import { createClient } from '@/lib/supabase/server'
import AdminUsersList from '@/components/admin/AdminUsersList'
import AdminUsersStats from '@/components/admin/AdminUsersStats'

export default async function AdminUsersPage() {
  const supabase = await createClient()

  // Get all users with their profiles and recent activity
  const { data: users } = await supabase
    .from('profiles')
    .select(`
      *,
      orders (
        id,
        total,
        status,
        created_at
      ),
      appointments (
        id,
        scheduled_date,
        status
      ),
      test_results (
        id,
        result_date,
        status
      ),
      staff (
        role,
        department,
        permissions
      )
    `)
    .order('created_at', { ascending: false })

  // Get user statistics
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: activeUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('last_sign_in_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  const { count: staffCount } = await supabase
    .from('staff')
    .select('*', { count: 'exact', head: true })

  const { count: newUsersThisMonth } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

  const userStats = {
    total: totalUsers || 0,
    active: activeUsers || 0,
    staff: staffCount || 0,
    newThisMonth: newUsersThisMonth || 0
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-slate-400 text-lg mt-2">
            Manage patients, staff, and user accounts
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
      </div>

      {/* User Statistics */}
      <AdminUsersStats stats={userStats} />

      {/* Users List */}
      <AdminUsersList users={users || []} />
    </div>
  )
}