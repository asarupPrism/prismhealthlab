import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SecuritySettings from '@/components/portal/SecuritySettings'
import PrivacySettings from '@/components/portal/PrivacySettings'
import AccountSettings from '@/components/portal/AccountSettings'
import DataManagement from '@/components/portal/DataManagement'

export default async function SettingsPage() {
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

  // Fetch user sessions
  const { data: sessions } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('last_activity', { ascending: false })
    .limit(10)

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-3 h-3 bg-indigo-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-indigo-100 to-white bg-clip-text text-transparent mb-4">
            Settings
          </h1>
          <p className="text-xl text-slate-300">
            Manage your security, privacy, and account preferences
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
                <p className="text-sm text-slate-400">Security Level</p>
                <p className="text-lg font-semibold text-emerald-400">
                  {profile?.two_factor_enabled ? 'High' : 'Medium'}
                </p>
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
                <p className="text-sm text-slate-400">Active Sessions</p>
                <p className="text-lg font-semibold text-white">
                  {sessions?.length || 1}
                </p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-400">Privacy Mode</p>
                <p className="text-lg font-semibold text-purple-400">
                  {preferences?.privacy_mode ? 'Strict' : 'Standard'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Security Settings */}
          <SecuritySettings 
            profile={profile} 
            sessions={sessions || []}
            userId={user.id} 
          />

          {/* Privacy Settings */}
          <PrivacySettings 
            preferences={preferences}
            userId={user.id}
          />

          {/* Account Settings */}
          <AccountSettings 
            profile={profile}
            user={user}
          />

          {/* Data Management */}
          <DataManagement 
            userId={user.id}
          />
        </div>
      </div>
    </div>
  )
}