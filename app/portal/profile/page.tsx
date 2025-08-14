import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from '@/components/portal/ProfileForm'
import PasswordChangeForm from '@/components/portal/PasswordChangeForm'
import NotificationPreferences from '@/components/portal/NotificationPreferences'
import EmergencyContacts from '@/components/portal/EmergencyContacts'

export default async function ProfilePage() {
  const supabase = await createClient()
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Fetch user preferences
  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent mb-4">
            Profile & Settings
          </h1>
          <p className="text-xl text-slate-300">
            Manage your personal information and account preferences
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
                <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-400">Account Status</p>
                <p className="text-lg font-semibold text-emerald-400">Active</p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-400">Member Since</p>
                <p className="text-lg font-semibold text-white">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-400">Verification</p>
                <p className="text-lg font-semibold text-amber-400">
                  {profile?.email_verified ? 'Verified' : 'Pending'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Personal Information */}
          <ProfileForm profile={profile} userEmail={user.email || ''} />

          {/* Password & Security */}
          <PasswordChangeForm />

          {/* Notification Preferences */}
          <NotificationPreferences preferences={preferences} userId={user.id} />

          {/* Emergency Contacts */}
          <EmergencyContacts userId={user.id} />
        </div>
      </div>
    </div>
  )
}