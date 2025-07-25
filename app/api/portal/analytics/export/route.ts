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

function generateCSVExport(data: any, userName: string, timeRange: string): Buffer {
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
  data.purchaseHistory.monthlySpending.forEach((item: any) => {
    lines.push(`${item.month},${item.amount},${item.orderCount}`)
  })

  lines.push('')
  lines.push('## Test Categories')
  lines.push('Category,Test Count,Total Spent')

  // Add test categories data
  data.purchaseHistory.testCategories.forEach((item: any) => {
    lines.push(`${item.category},${item.count},${item.totalSpent}`)
  })

  lines.push('')
  lines.push('## Order Status Distribution')
  lines.push('Status,Count,Percentage')

  // Add status distribution
  data.purchaseHistory.statusDistribution.forEach((item: any) => {
    lines.push(`${item.status},${item.count},${item.percentage.toFixed(1)}%`)
  })

  lines.push('')
  lines.push('## Health Metrics')
  lines.push('Biomarker,Date,Value,Status,Unit,Notes')

  // Add biomarker trends
  data.healthMetrics.biomarkerTrends.forEach((biomarker: any) => {
    biomarker.data.forEach((point: any) => {
      lines.push(`${biomarker.name},${point.date},${point.value},${point.status},${point.unit},"${point.notes || ''}"`)
    })
  })

  lines.push('')
  lines.push('## Overall Health Score')
  lines.push('Metric,Current,Previous,Trend')
  lines.push(`Health Score,${data.healthMetrics.overallHealthScore.current},${data.healthMetrics.overallHealthScore.previous},${data.healthMetrics.overallHealthScore.trend}`)

  lines.push('')
  lines.push('## Appointments')
  lines.push('Month,Appointments,Completion Rate')

  // Add appointment data
  data.appointments.monthlyBookings.forEach((item: any) => {
    lines.push(`${item.month},${item.appointments},${item.completionRate.toFixed(1)}%`)
  })

  lines.push('')
  lines.push(`Upcoming Appointments: ${data.appointments.upcomingCount}`)
  lines.push(`Completed Appointments: ${data.appointments.completedCount}`)

  return Buffer.from(lines.join('\n'), 'utf-8')
}

async function generatePDFExport(data: any, userName: string, timeRange: string): Promise<Buffer> {
  // For a full implementation, you would use a PDF generation library like puppeteer or jsPDF
  // This is a simplified version that creates a text-based PDF-like format
  
  const content = `
# PRISM HEALTH LAB
## Health Analytics Report

**Patient:** ${userName}
**Export Date:** ${new Date().toLocaleString()}
**Time Period:** ${timeRange}
**Report Type:** Comprehensive Health Analytics

---

### EXECUTIVE SUMMARY

**Overall Health Score:** ${data.healthMetrics.overallHealthScore.current}/100
**Trend:** ${data.healthMetrics.overallHealthScore.trend.charAt(0).toUpperCase() + data.healthMetrics.overallHealthScore.trend.slice(1)}
**Total Healthcare Spending:** $${data.purchaseHistory.monthlySpending.reduce((sum: number, item: any) => sum + item.amount, 0).toFixed(2)}
**Upcoming Appointments:** ${data.appointments.upcomingCount}

---

### MONTHLY SPENDING ANALYSIS

${data.purchaseHistory.monthlySpending.map((item: any) => 
  `${item.month}: $${item.amount.toFixed(2)} (${item.orderCount} orders)`
).join('\n')}

**Average Monthly Spending:** $${(data.purchaseHistory.monthlySpending.reduce((sum: number, item: any) => sum + item.amount, 0) / Math.max(data.purchaseHistory.monthlySpending.length, 1)).toFixed(2)}

---

### TEST CATEGORIES BREAKDOWN

${data.purchaseHistory.testCategories.map((item: any) => 
  `${item.category}: ${item.count} tests, $${item.totalSpent.toFixed(2)}`
).join('\n')}

---

### BIOMARKER TRENDS

${data.healthMetrics.biomarkerTrends.map((biomarker: any) => {
  const latest = biomarker.data[biomarker.data.length - 1]
  const trend = biomarker.data.length > 1 ? 
    (latest.value > biomarker.data[biomarker.data.length - 2].value ? '↗' : 
     latest.value < biomarker.data[biomarker.data.length - 2].value ? '↘' : '→') : '→'
  
  return `**${biomarker.name}**
  Latest Value: ${latest.value} ${latest.unit}
  Status: ${latest.status.charAt(0).toUpperCase() + latest.status.slice(1)}
  Trend: ${trend}
  Reference Range: ${latest.referenceRange ? `${latest.referenceRange.min}-${latest.referenceRange.max} ${latest.unit}` : 'Not available'}
  ${latest.notes ? `Notes: ${latest.notes}` : ''}
  
  Historical Values:
${biomarker.data.slice(-5).map((point: any) => 
    `  ${new Date(point.date).toLocaleDateString()}: ${point.value} ${point.unit} (${point.status})`
  ).join('\n')}`
}).join('\n\n')}

---

### APPOINTMENT HISTORY

**Upcoming:** ${data.appointments.upcomingCount}
**Completed:** ${data.appointments.completedCount}

**Monthly Booking Patterns:**
${data.appointments.monthlyBookings.map((item: any) => 
  `${item.month}: ${item.appointments} appointments (${item.completionRate.toFixed(1)}% completion rate)`
).join('\n')}

---

### HEALTH RECOMMENDATIONS

Based on your current health metrics and trends, we recommend:

${data.healthMetrics.overallHealthScore.trend === 'declining' ? 
  '• Schedule a follow-up consultation to discuss declining health trends\n• Review recent lifestyle changes that may be impacting your results\n• Consider additional monitoring for concerning biomarkers' :
  data.healthMetrics.overallHealthScore.trend === 'improving' ?
  '• Continue your current health regimen as it appears to be effective\n• Maintain regular monitoring to track continued improvement\n• Consider expanding preventive care measures' :
  '• Maintain your current health monitoring schedule\n• Continue regular check-ups as recommended by your healthcare provider\n• Stay consistent with any prescribed treatments or lifestyle modifications'
}

${data.appointments.upcomingCount > 0 ? 
  `\n• You have ${data.appointments.upcomingCount} upcoming appointment${data.appointments.upcomingCount > 1 ? 's' : ''} - please ensure you attend as scheduled` : 
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