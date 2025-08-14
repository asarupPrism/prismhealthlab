import React from 'react'
import { createClient } from '@/lib/supabase/server'
import LabResultsUploadForm from '@/components/admin/LabResultsUploadForm'
import RecentUploads from '@/components/admin/RecentUploads'

export default async function AdminResultsUploadPage() {
  const supabase = await createClient()

  // Get recent test results for display
  const { data: recentResults } = await supabase
    .from('test_results')
    .select(`
      *,
      profiles (
        first_name,
        last_name,
        email
      ),
      diagnostic_tests (
        name,
        test_code
      ),
      orders (
        id,
        swell_order_number
      ),
      appointments (
        id,
        appointment_number,
        scheduled_date
      )
    `)
    .order('created_at', { ascending: false })
    .limit(20)

  // Get available diagnostic tests
  const { data: diagnosticTests } = await supabase
    .from('diagnostic_tests')
    .select('id, name, test_code, category_id')
    .eq('is_active', true)
    .order('name', { ascending: true })

  // Get patients with orders for result matching
  const { data: patients } = await supabase
    .from('profiles')
    .select(`
      id,
      first_name,
      last_name,
      email,
      orders (
        id,
        swell_order_number,
        status,
        created_at
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
            Lab Results Upload
          </h1>
          <p className="text-slate-400 text-lg mt-2">
            Upload and manage laboratory test results for patient delivery
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
      </div>

      {/* Results Upload Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-lg shadow-slate-900/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
              <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <h2 className="text-lg font-semibold text-white">Total Results</h2>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{recentResults?.length || 0}</div>
          <p className="text-slate-400 text-sm">Uploaded results</p>
        </div>

        <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-lg shadow-slate-900/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <h2 className="text-lg font-semibold text-white">Pending Review</h2>
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {recentResults?.filter(r => r.overall_status === 'pending_review').length || 0}
          </div>
          <p className="text-slate-400 text-sm">Awaiting review</p>
        </div>

        <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-lg shadow-slate-900/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-red-500 rounded-xl flex items-center justify-center">
              <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <h2 className="text-lg font-semibold text-white">Critical Results</h2>
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {recentResults?.filter(r => r.overall_status === 'critical').length || 0}
          </div>
          <p className="text-slate-400 text-sm">Require immediate action</p>
        </div>

        <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-lg shadow-slate-900/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
              <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <h2 className="text-lg font-semibold text-white">Available Tests</h2>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{diagnosticTests?.length || 0}</div>
          <p className="text-slate-400 text-sm">Test types available</p>
        </div>
      </div>

      {/* Upload Form */}
      <LabResultsUploadForm 
        diagnosticTests={diagnosticTests || []}
        patients={patients || []}
      />

      {/* Recent Uploads */}
      <RecentUploads results={recentResults || []} />
    </div>
  )
}