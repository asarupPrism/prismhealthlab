import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TestResult } from '@/types/shared'
import HealthTrendsView from '@/components/portal/HealthTrendsView'
import TrendsStatistics from '@/components/portal/TrendsStatistics'

export default async function HealthTrendsPage() {
  const supabase = await createClient()
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/login')
  }

  // Fetch user's test results for trends
  const { data: results } = await supabase
    .from('test_results')
    .select(`
      *,
      diagnostic_tests(
        name,
        category,
        description,
        unit,
        reference_range_min,
        reference_range_max
      )
    `)
    .eq('user_id', user.id)
    .order('result_date', { ascending: true })

  // Group results by test type for trend analysis
  const groupedResults = results?.reduce((acc: Record<string, TestResult[]>, result: TestResult) => {
    const testName = result.diagnostic_tests?.name || 'Unknown Test'
    if (!acc[testName]) {
      acc[testName] = []
    }
    acc[testName].push(result)
    return acc
  }, {}) || {}

  // Calculate key statistics
  const totalTests = results?.length || 0
  const uniqueTestTypes = Object.keys(groupedResults).length
  const normalResults = results?.filter(r => r.status === 'normal').length || 0
  const improvementRate = totalTests > 0 ? Math.round((normalResults / totalTests) * 100) : 0
  
  // Find most recent test date
  const mostRecentDate = results && results.length > 0 
    ? new Date(results[results.length - 1].result_date || results[results.length - 1].created_at)
    : null

  const stats = {
    totalTests,
    uniqueTestTypes,
    improvementRate,
    mostRecentDate,
    normalResults,
    testsWithTrends: Object.entries(groupedResults).filter(([, tests]) => (tests as TestResult[]).length > 1).length
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent mb-4">
            Health Trends
          </h1>
          <p className="text-xl text-slate-300">
            Track your biomarkers and health progress over time
          </p>
        </div>

        {/* Trends Statistics */}
        <TrendsStatistics stats={stats} />

        {/* Health Trends View */}
        <HealthTrendsView groupedResults={groupedResults} />
      </div>
    </div>
  )
}