import jsPDF from 'jspdf'
import { TestResult, Profile } from '@/types/shared'

// Type alias for backward compatibility
type UserProfile = Profile

export function generateSingleResultPDF(result: TestResult, profile: UserProfile) {
  const doc = new jsPDF()
  
  // Colors
  const primaryColor = [6, 182, 212] as [number, number, number] // Cyan
  const successColor = [16, 185, 129] as [number, number, number] // Emerald
  const warningColor = [245, 158, 11] as [number, number, number] // Amber
  const dangerColor = [244, 63, 94] as [number, number, number] // Rose
  
  // Header
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 30, 'F')
  
  // Logo/Title
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('PRISM HEALTH LAB', 105, 15, { align: 'center' })
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Diagnostic Test Results', 105, 22, { align: 'center' })
  
  // Patient Information Section
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Patient Information', 20, 45)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const patientName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'N/A'
  doc.text(`Name: ${patientName}`, 20, 55)
  doc.text(`Date of Birth: ${profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'N/A'}`, 20, 62)
  doc.text(`Email: ${profile.email || 'N/A'}`, 20, 69)
  doc.text(`Phone: ${profile.phone || 'N/A'}`, 20, 76)
  
  // Report Information
  doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 120, 55)
  doc.text(`Test Date: ${result.result_date ? new Date(result.result_date).toLocaleDateString() : 'N/A'}`, 120, 62)
  doc.text(`Report ID: ${result.id.slice(0, 8).toUpperCase()}`, 120, 69)
  
  // Divider
  doc.setDrawColor(200, 200, 200)
  doc.line(20, 85, 190, 85)
  
  // Test Results Section
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Test Results', 20, 95)
  
  // Test Name
  doc.setFontSize(14)
  doc.setTextColor(...primaryColor)
  doc.text(result.diagnostic_tests?.name || 'Test Result', 20, 105)
  
  // Category
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Category: ${result.diagnostic_tests?.category || 'General'}`, 20, 112)
  
  // Result Box
  const resultY = 125
  doc.setDrawColor(200, 200, 200)
  doc.setFillColor(250, 250, 250)
  doc.rect(20, resultY, 170, 40, 'FD')
  
  // Result Value
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  
  // Set color based on status
  if (result.status === 'normal') {
    doc.setTextColor(...successColor)
  } else if (result.status === 'elevated' || result.status === 'high') {
    doc.setTextColor(...warningColor)
  } else if (result.status === 'critical' || result.status === 'low') {
    doc.setTextColor(...dangerColor)
  } else {
    doc.setTextColor(0, 0, 0)
  }
  
  // Extract primary test value from test_values
  const primaryValue = result.test_values ? Object.values(result.test_values)[0] : null
  const resultText = primaryValue ? `${primaryValue.value} ${primaryValue.unit || ''}` : result.status || 'Pending'
  doc.text(resultText, 35, resultY + 20)
  
  // Status Badge
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const statusText = result.status ? result.status.toUpperCase() : 'PENDING'
  doc.text(`Status: ${statusText}`, 35, resultY + 30)
  
  // Reference Range
  doc.setTextColor(0, 0, 0)
  // Get reference range from diagnostic test or primary value
  const refRange = primaryValue?.reference || 'N/A'
  doc.text(`Reference Range: ${refRange}`, 120, resultY + 20)
  
  // Notes Section (using interpretation or summary instead)
  const notes = result.interpretation || result.summary
  if (notes) {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Clinical Notes', 20, 180)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(notes, 170)
    doc.text(lines, 20, 190)
  }
  
  // Footer
  const footerY = 270
  doc.setDrawColor(200, 200, 200)
  doc.line(20, footerY, 190, footerY)
  
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text('This report is confidential and intended solely for the patient named above.', 105, footerY + 5, { align: 'center' })
  doc.text('Prism Health Lab - CLIA Certified Laboratory', 105, footerY + 10, { align: 'center' })
  doc.text(`Generated on ${new Date().toLocaleString()}`, 105, footerY + 15, { align: 'center' })
  
  return doc
}

export function generateMultipleResultsPDF(results: TestResult[], profile: UserProfile) {
  const doc = new jsPDF()
  
  // Colors
  const primaryColor = [6, 182, 212] as [number, number, number]
  const successColor = [16, 185, 129] as [number, number, number]
  const warningColor = [245, 158, 11] as [number, number, number]
  const dangerColor = [244, 63, 94] as [number, number, number]
  
  // First Page - Cover
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 40, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('PRISM HEALTH LAB', 105, 20, { align: 'center' })
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Comprehensive Test Results Report', 105, 30, { align: 'center' })
  
  // Patient Info
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Patient Information', 20, 55)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const patientName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'N/A'
  doc.text(`Name: ${patientName}`, 20, 65)
  doc.text(`Date of Birth: ${profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'N/A'}`, 20, 72)
  doc.text(`Email: ${profile.email || 'N/A'}`, 20, 79)
  doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 20, 86)
  doc.text(`Total Tests: ${results.length}`, 20, 93)
  
  // Summary Statistics
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Results Summary', 20, 110)
  
  const normalCount = results.filter(r => r.status === 'normal').length
  const elevatedCount = results.filter(r => ['elevated', 'high'].includes(r.status || '')).length
  const lowCount = results.filter(r => r.status === 'low').length
  const criticalCount = results.filter(r => r.status === 'critical').length
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  // Summary boxes
  const summaryY = 120
  
  // Normal
  doc.setFillColor(...successColor)
  doc.rect(20, summaryY, 40, 15, 'F')
  doc.setTextColor(255, 255, 255)
  doc.text('NORMAL', 40, summaryY + 6, { align: 'center' })
  doc.setTextColor(0, 0, 0)
  doc.text(`${normalCount} tests`, 40, summaryY + 11, { align: 'center' })
  
  // Elevated
  doc.setFillColor(...warningColor)
  doc.rect(65, summaryY, 40, 15, 'F')
  doc.setTextColor(255, 255, 255)
  doc.text('ELEVATED', 85, summaryY + 6, { align: 'center' })
  doc.setTextColor(0, 0, 0)
  doc.text(`${elevatedCount} tests`, 85, summaryY + 11, { align: 'center' })
  
  // Low
  doc.setFillColor(...warningColor)
  doc.rect(110, summaryY, 40, 15, 'F')
  doc.setTextColor(255, 255, 255)
  doc.text('LOW', 130, summaryY + 6, { align: 'center' })
  doc.setTextColor(0, 0, 0)
  doc.text(`${lowCount} tests`, 130, summaryY + 11, { align: 'center' })
  
  // Critical
  doc.setFillColor(...dangerColor)
  doc.rect(155, summaryY, 40, 15, 'F')
  doc.setTextColor(255, 255, 255)
  doc.text('CRITICAL', 175, summaryY + 6, { align: 'center' })
  doc.setTextColor(0, 0, 0)
  doc.text(`${criticalCount} tests`, 175, summaryY + 11, { align: 'center' })
  
  // Results Table Header
  let tableY = 150
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Test Results Details', 20, tableY)
  
  tableY += 10
  doc.setFillColor(240, 240, 240)
  doc.rect(20, tableY, 170, 8, 'F')
  doc.setFontSize(9)
  doc.text('Test Name', 22, tableY + 5)
  doc.text('Result', 90, tableY + 5)
  doc.text('Status', 130, tableY + 5)
  doc.text('Date', 160, tableY + 5)
  
  tableY += 10
  
  // Add results
  doc.setFont('helvetica', 'normal')
  results.forEach((result, index) => {
    if (tableY > 260) {
      doc.addPage()
      tableY = 20
      
      // Repeat header on new page
      doc.setFillColor(240, 240, 240)
      doc.rect(20, tableY, 170, 8, 'F')
      doc.setFont('helvetica', 'bold')
      doc.text('Test Name', 22, tableY + 5)
      doc.text('Result', 90, tableY + 5)
      doc.text('Status', 130, tableY + 5)
      doc.text('Date', 160, tableY + 5)
      doc.setFont('helvetica', 'normal')
      tableY += 10
    }
    
    // Alternate row colors
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250)
      doc.rect(20, tableY - 3, 170, 7, 'F')
    }
    
    // Test name
    doc.setFontSize(8)
    const testName = result.diagnostic_tests?.name || 'Test'
    doc.text(testName.substring(0, 30), 22, tableY)
    
    // Result value - extract from test_values
    const primaryValue = result.test_values ? Object.values(result.test_values)[0] : null
    const resultText = primaryValue ? `${primaryValue.value} ${primaryValue.unit || ''}` : '-'
    doc.text(resultText, 90, tableY)
    
    // Status with color
    if (result.status === 'normal') {
      doc.setTextColor(...successColor)
    } else if (result.status === 'elevated' || result.status === 'high') {
      doc.setTextColor(...warningColor)
    } else if (result.status === 'critical' || result.status === 'low') {
      doc.setTextColor(...dangerColor)
    }
    doc.text(result.status || 'pending', 130, tableY)
    doc.setTextColor(0, 0, 0)
    
    // Date
    const testDate = result.result_date ? new Date(result.result_date).toLocaleDateString() : '-'
    doc.text(testDate, 160, tableY)
    
    tableY += 7
  })
  
  // Footer on last page
  const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' })
    doc.text('Prism Health Lab - Confidential Medical Report', 105, 290, { align: 'center' })
  }
  
  return doc
}

export function downloadPDF(doc: jsPDF, filename: string) {
  doc.save(filename)
}

export function getPDFDataUri(doc: jsPDF): string {
  return doc.output('datauristring')
}

export function openPDFInNewTab(doc: jsPDF) {
  const pdfDataUri = getPDFDataUri(doc)
  window.open(pdfDataUri, '_blank')
}