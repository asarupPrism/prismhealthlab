import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminAuthServer } from '@/lib/admin-server'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const supabase = await createClient()
  const adminAuth = new AdminAuthServer(supabase)
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login?redirect=/admin')
  }

  // Check if user has admin privileges
  const isAdmin = await adminAuth.isAdmin(user.id)
  if (!isAdmin) {
    redirect('/?error=unauthorized')
  }

  // Get admin profile
  const adminProfile = await adminAuth.getAdminProfile(user.id)
  
  // Get user profile for display
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Admin Sidebar */}
      <AdminSidebar adminProfile={adminProfile} />
      
      {/* Main Content Area */}
      <div className="lg:pl-80">
        {/* Admin Header */}
        <AdminHeader user={user} profile={profile} adminProfile={adminProfile} />
        
        {/* Page Content */}
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}