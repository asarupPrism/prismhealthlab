import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ResultsView from '@/components/portal/ResultsView'

export default async function ResultsPage() {
  const supabase = await createClient()
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/checkout')
  }

  // Fetch user's test results
  const { data: results, error: resultsError } = await supabase
    .from('test_results')
    .select(`
      *,
      diagnostic_tests(
        name,
        category,
        description
      ),
      appointments(
        id,
        scheduled_date,
        locations(name)
      )
    `)
    .eq('user_id', user.id)
    .order('result_date', { ascending: false })

  if (resultsError) {
    console.error('Error fetching results:', resultsError)
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent mb-4">
            Your Test Results
          </h1>
          <p className="text-xl text-slate-300">
            View and track your diagnostic test results and health trends
          </p>
        </div>

        {/* Results View */}
        <ResultsView results={results || []} />
      </div>
    </div>
  )
}