import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PortalNavigation from '@/components/portal/PortalNavigation'

export const metadata = {
  title: 'Patient Portal - Prism Health Lab',
  description: 'Secure access to your health data, test results, and appointment management',
}

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  // Check if user is authenticated
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/checkout')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="flex">
        {/* Sidebar Navigation */}
        <PortalNavigation user={user as unknown as import('@/types/shared').User} profile={profile} />
        
        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          <div className="min-h-screen">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}