import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ResultDetail from '@/components/portal/ResultDetail'

interface ResultDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ResultDetailPage({ params }: ResultDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/checkout')
  }

  // Fetch specific test result
  const { data: result, error: resultError } = await supabase
    .from('test_results')
    .select(`
      *,
      diagnostic_tests(
        id,
        name,
        category,
        description,
        normal_ranges,
        preparation_instructions
      ),
      appointments(
        id,
        scheduled_date,
        locations(
          name,
          address,
          phone
        ),
        orders(
          id,
          total,
          items
        )
      ),
      result_files(
        id,
        file_name,
        file_url,
        file_type
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (resultError || !result) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-5xl mx-auto">
        <ResultDetail result={result} />
      </div>
    </div>
  )
}