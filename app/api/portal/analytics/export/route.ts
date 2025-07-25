import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logPatientDataAccess } from '@/lib/audit/hipaa-logger'

// POST /api/portal/analytics/export - Export analytics data in various formats
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { format, timeRange, data } = await request.json()

    if (!['pdf', 'csv', 'json'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid export format' },
        { status: 400 }
      )
    }

    // Get user profile for personalization
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('user_id', user.id)
      .single()

    const userName = profile ? `${profile.first_name} ${profile.last_name}` : 'Patient'

    let exportData: Buffer
    let contentType: string
    let filename: string

    const timestamp = new Date().toISOString().split('T')[0]

    switch (format) {
      case 'json':
        exportData = Buffer.from(JSON.stringify({
          patient: userName,
          exportDate: new Date().toISOString(),
          timeRange,
          data
        }, null, 2))
        contentType = 'application/json'
        filename = `health-analytics-${timeRange}-${timestamp}.json`
        break

      case 'csv':
        exportData = generateCSVExport(data, userName, timeRange)
        contentType = 'text/csv'
        filename = `health-analytics-${timeRange}-${timestamp}.csv`
        break

      case 'pdf':
        exportData = await generatePDFExport(data, userName, timeRange)
        contentType = 'application/pdf'
        filename = `health-analytics-${timeRange}-${timestamp}.pdf`
        break

      default:
        throw new Error('Unsupported format')
    }

    // HIPAA-compliant audit logging
    logPatientDataAccess(
      user.id,
      user.id,
      'analytics_export',
      'export_analytics_data',
      'success',
      {
        export_format: format,
        time_range: timeRange,
        file_size: exportData.length,
        export_timestamp: new Date().toISOString()
      },
      request
    ).catch(err => console.error('HIPAA audit log error:', err))

    return new NextResponse(exportData, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': exportData.length.toString(),
      },
    })

  } catch (error) {
    console.error('Export API error:', error)
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    )
  }
}

function generateCSVExport(data: Record<string, unknown>, userName: string, timeRange: string): Buffer {
  const lines = [
    '# Prism Health Lab - Analytics Export',
    `# Patient: ${userName}`,
    `# Export Date: ${new Date().toISOString()}`,
    `# Time Range: ${timeRange}`,
    '#',
    '',
    '## Monthly Spending',
    'Month,Amount,Order Count'
  ]

  // Add monthly spending data
  const purchaseHistory = data.purchaseHistory as Record<string, unknown>
  const monthlySpending = purchaseHistory.monthlySpending as Array<Record<string, unknown>>
  monthlySpending.forEach((item: Record<string, unknown>) => {
    lines.push(`${item.month as string},${item.amount as number},${item.orderCount as number}`)
  })

  lines.push('')
  lines.push('## Test Categories')
  lines.push('Category,Test Count,Total Spent')

  // Add test categories data
  const testCategories = purchaseHistory.testCategories as Array<Record<string, unknown>>
  testCategories.forEach((item: Record<string, unknown>) => {
    lines.push(`${item.category as string},${item.count as number},${item.totalSpent as number}`)
  })

  lines.push('')
  lines.push('## Order Status Distribution')
  lines.push('Status,Count,Percentage')

  // Add status distribution
  const statusDistribution = purchaseHistory.statusDistribution as Array<Record<string, unknown>>
  statusDistribution.forEach((item: Record<string, unknown>) => {
    lines.push(`${item.status as string},${item.count as number},${(item.percentage as number).toFixed(1)}%`)
  })

  lines.push('')
  lines.push('## Health Metrics')
  lines.push('Biomarker,Date,Value,Status,Unit,Notes')

  // Add biomarker trends
  const healthMetrics = data.healthMetrics as Record<string, unknown>
  const biomarkerTrends = healthMetrics.biomarkerTrends as Array<Record<string, unknown>>
  biomarkerTrends.forEach((biomarker: Record<string, unknown>) => {
    const biomarkerData = biomarker.data as Array<Record<string, unknown>>
    biomarkerData.forEach((point: Record<string, unknown>) => {
      lines.push(`${biomarker.name as string},${point.date as string},${point.value as number},${point.status as string},${point.unit as string},"${(point.notes as string) || ''}"`)
    })
  })

  lines.push('')
  lines.push('## Overall Health Score')
  lines.push('Metric,Current,Previous,Trend')
  const overallHealthScore = healthMetrics.overallHealthScore as Record<string, unknown>
  lines.push(`Health Score,${overallHealthScore.current as number},${overallHealthScore.previous as number},${overallHealthScore.trend as string}`)

  lines.push('')
  lines.push('## Appointments')
  lines.push('Month,Appointments,Completion Rate')

  // Add appointment data
  const appointments = data.appointments as Record<string, unknown>
  const monthlyBookings = appointments.monthlyBookings as Array<Record<string, unknown>>
  monthlyBookings.forEach((item: Record<string, unknown>) => {
    lines.push(`${item.month as string},${item.appointments as number},${(item.completionRate as number).toFixed(1)}%`)
  })

  lines.push('')
  lines.push(`Upcoming Appointments: ${appointments.upcomingCount as number}`)
  lines.push(`Completed Appointments: ${appointments.completedCount as number}`)

  return Buffer.from(lines.join('\n'), 'utf-8')
}

async function generatePDFExport(data: Record<string, unknown>, userName: string, timeRange: string): Promise<Buffer> {
  // For a full implementation, you would use a PDF generation library like puppeteer or jsPDF
  // This is a simplified version that creates a text-based PDF-like format
  
  const healthMetrics = data.healthMetrics as Record<string, unknown>
  const overallHealthScore = healthMetrics.overallHealthScore as Record<string, unknown>
  const purchaseHistory = data.purchaseHistory as Record<string, unknown>
  const monthlySpending = purchaseHistory.monthlySpending as Array<Record<string, unknown>>
  const testCategories = purchaseHistory.testCategories as Array<Record<string, unknown>>
  const biomarkerTrends = healthMetrics.biomarkerTrends as Array<Record<string, unknown>>
  const appointments = data.appointments as Record<string, unknown>
  const monthlyBookings = appointments.monthlyBookings as Array<Record<string, unknown>>
  
  const content = `
# PRISM HEALTH LAB
## Health Analytics Report

**Patient:** ${userName}
**Export Date:** ${new Date().toLocaleString()}
**Time Period:** ${timeRange}
**Report Type:** Comprehensive Health Analytics

---

### EXECUTIVE SUMMARY

**Overall Health Score:** ${overallHealthScore.current as number}/100
**Trend:** ${(overallHealthScore.trend as string).charAt(0).toUpperCase() + (overallHealthScore.trend as string).slice(1)}
**Total Healthcare Spending:** $${monthlySpending.reduce((sum: number, item: Record<string, unknown>) => sum + (item.amount as number), 0).toFixed(2)}
**Upcoming Appointments:** ${appointments.upcomingCount as number}

---

### MONTHLY SPENDING ANALYSIS

${monthlySpending.map((item: Record<string, unknown>) => 
  `${item.month as string}: $${(item.amount as number).toFixed(2)} (${item.orderCount as number} orders)`
).join('\n')}

**Average Monthly Spending:** $${(monthlySpending.reduce((sum: number, item: Record<string, unknown>) => sum + (item.amount as number), 0) / Math.max(monthlySpending.length, 1)).toFixed(2)}

---

### TEST CATEGORIES BREAKDOWN

${testCategories.map((item: Record<string, unknown>) => 
  `${item.category as string}: ${item.count as number} tests, $${(item.totalSpent as number).toFixed(2)}`
).join('\n')}

---

### BIOMARKER TRENDS

${biomarkerTrends.map((biomarker: Record<string, unknown>) => {
  const biomarkerData = biomarker.data as Array<Record<string, unknown>>
  const latest = biomarkerData[biomarkerData.length - 1]
  const trend = biomarkerData.length > 1 ? 
    ((latest.value as number) > (biomarkerData[biomarkerData.length - 2].value as number) ? '↗' : 
     (latest.value as number) < (biomarkerData[biomarkerData.length - 2].value as number) ? '↘' : '→') : '→'
  
  const referenceRange = latest.referenceRange as Record<string, unknown> | undefined
  
  return `**${biomarker.name as string}**
  Latest Value: ${latest.value as number} ${latest.unit as string}
  Status: ${(latest.status as string).charAt(0).toUpperCase() + (latest.status as string).slice(1)}
  Trend: ${trend}
  Reference Range: ${referenceRange ? `${referenceRange.min as number}-${referenceRange.max as number} ${latest.unit as string}` : 'Not available'}
  ${latest.notes ? `Notes: ${latest.notes as string}` : ''}
  
  Historical Values:
${biomarkerData.slice(-5).map((point: Record<string, unknown>) => 
    `  ${new Date(point.date as string).toLocaleDateString()}: ${point.value as number} ${point.unit as string} (${point.status as string})`
  ).join('\n')}`
}).join('\n\n')}

---

### APPOINTMENT HISTORY

**Upcoming:** ${appointments.upcomingCount as number}
**Completed:** ${appointments.completedCount as number}

**Monthly Booking Patterns:**
${monthlyBookings.map((item: Record<string, unknown>) => 
  `${item.month as string}: ${item.appointments as number} appointments (${(item.completionRate as number).toFixed(1)}% completion rate)`
).join('\n')}

---

### HEALTH RECOMMENDATIONS

Based on your current health metrics and trends, we recommend:

${(overallHealthScore.trend as string) === 'declining' ? 
  '• Schedule a follow-up consultation to discuss declining health trends\n• Review recent lifestyle changes that may be impacting your results\n• Consider additional monitoring for concerning biomarkers' :
  (overallHealthScore.trend as string) === 'improving' ?
  '• Continue your current health regimen as it appears to be effective\n• Maintain regular monitoring to track continued improvement\n• Consider expanding preventive care measures' :
  '• Maintain your current health monitoring schedule\n• Continue regular check-ups as recommended by your healthcare provider\n• Stay consistent with any prescribed treatments or lifestyle modifications'
}

${(appointments.upcomingCount as number) > 0 ? 
  `\n• You have ${appointments.upcomingCount as number} upcoming appointment${(appointments.upcomingCount as number) > 1 ? 's' : ''} - please ensure you attend as scheduled` : 
  '\n• Consider scheduling your next routine check-up if it\'s been more than 6 months since your last visit'
}

---

**Important Note:** This report is for informational purposes only and should not replace professional medical advice. Please consult with your healthcare provider to discuss these results and determine appropriate next steps for your care.

**Report Generated:** ${new Date().toLocaleString()}
**Patient Portal:** Prism Health Lab
**Confidential:** This document contains protected health information (PHI)

---

© ${new Date().getFullYear()} Prism Health Lab. All rights reserved.
This report is HIPAA compliant and contains confidential patient information.
`

  // In a real implementation, you would convert this to actual PDF format
  // For now, we'll return it as a text file with PDF extension
  return Buffer.from(content, 'utf-8')
}