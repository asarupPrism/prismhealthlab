'use client'

import React, { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface DiagnosticTest {
  id: string
  name: string
  test_code: string
  category_id: string
}

interface Patient {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  orders: {
    id: string
    swell_order_number: string | null
    status: string
    created_at: string
  }[]
}

interface LabResultsUploadFormProps {
  diagnosticTests: DiagnosticTest[]
  patients: Patient[]
}

interface ResultFormData {
  patientId: string
  orderId: string
  testId: string
  labReportNumber: string
  labAccessionNumber: string
  performingLab: string
  sampleCollectionDate: string
  sampleReceivedDate: string
  resultDate: string
  overallStatus: 'normal' | 'abnormal' | 'critical' | 'pending_review'
  clinicalNotes: string
  requiresFollowUp: boolean
  followUpInstructions: string
}

export default function LabResultsUploadForm({ diagnosticTests, patients }: LabResultsUploadFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<ResultFormData>({
    patientId: '',
    orderId: '',
    testId: '',
    labReportNumber: '',
    labAccessionNumber: '',
    performingLab: 'Prism Health Lab',
    sampleCollectionDate: '',
    sampleReceivedDate: new Date().toISOString().split('T')[0],
    resultDate: new Date().toISOString().split('T')[0],
    overallStatus: 'normal',
    clinicalNotes: '',
    requiresFollowUp: false,
    followUpInstructions: ''
  })

  const handleInputChange = (field: keyof ResultFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
    setSuccess(null)
  }

  const handlePatientChange = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId)
    setSelectedPatient(patient || null)
    setFormData(prev => ({ ...prev, patientId, orderId: '' }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff']
      if (!validTypes.includes(file.type)) {
        setError('Please upload a PDF or image file (JPEG, PNG, TIFF)')
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }

      setUploadedFile(file)
      setError(null)
    }
  }

  const generateLabReportNumber = () => {
    const today = new Date()
    const dateStr = today.toISOString().slice(2, 10).replace(/-/g, '')
    const randomNum = Math.floor(Math.random() * 99999).toString().padStart(5, '0')
    return `LAB${dateStr}${randomNum}`
  }

  const uploadFileToStorage = async (file: File, patientId: string, resultId: string): Promise<string | null> => {
    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${patientId}/${resultId}/lab-report.${fileExt}`
      
      const { error } = await supabase.storage
        .from('test-results')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('test-results')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (err) {
      console.error('Error uploading file:', err)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!uploadedFile) {
      setError('Please upload a lab report file')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const supabase = createClient()
      
      // Generate unique IDs
      const resultId = crypto.randomUUID()
      const labReportNumber = formData.labReportNumber || generateLabReportNumber()

      // Upload file to storage first
      const pdfReportUrl = await uploadFileToStorage(uploadedFile, formData.patientId, resultId)
      
      if (!pdfReportUrl) {
        throw new Error('Failed to upload lab report file')
      }

      // Create test result record
      const resultData = {
        id: resultId,
        user_id: formData.patientId,
        order_id: formData.orderId || null,
        test_id: formData.testId,
        lab_report_number: labReportNumber,
        lab_accession_number: formData.labAccessionNumber || null,
        performing_lab: formData.performingLab,
        sample_collection_date: formData.sampleCollectionDate ? `${formData.sampleCollectionDate}T00:00:00Z` : null,
        sample_received_date: formData.sampleReceivedDate ? `${formData.sampleReceivedDate}T00:00:00Z` : null,
        result_date: `${formData.resultDate}T00:00:00Z`,
        results_data: {}, // This would be populated with actual test values in a real system
        overall_status: formData.overallStatus,
        clinical_notes: formData.clinicalNotes || null,
        requires_follow_up: formData.requiresFollowUp,
        follow_up_instructions: formData.followUpInstructions || null,
        pdf_report_url: pdfReportUrl,
        patient_notified: false,
        quality_control_passed: true
      }

      const { error: insertError } = await supabase
        .from('test_results')
        .insert(resultData)

      if (insertError) throw insertError

      setSuccess(`Lab results uploaded successfully! Report number: ${labReportNumber}`)
      
      // Reset form
      setFormData({
        patientId: '',
        orderId: '',
        testId: '',
        labReportNumber: '',
        labAccessionNumber: '',
        performingLab: 'Prism Health Lab',
        sampleCollectionDate: '',
        sampleReceivedDate: new Date().toISOString().split('T')[0],
        resultDate: new Date().toISOString().split('T')[0],
        overallStatus: 'normal',
        clinicalNotes: '',
        requiresFollowUp: false,
        followUpInstructions: ''
      })
      setSelectedPatient(null)
      setUploadedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Refresh page after short delay
      setTimeout(() => {
        window.location.reload()
      }, 3000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while uploading results')
    } finally {
      setIsLoading(false)
    }
  }

  const getPatientName = (patient: Patient) => {
    return `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || patient.email || 'Unknown Patient'
  }

  return (
    <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl shadow-lg shadow-slate-900/30">
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
            <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-white">Upload Lab Results</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-rose-500/20 border border-rose-400/30 rounded-xl text-rose-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-emerald-300">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient & Test Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              Patient & Test Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Patient
              </label>
              <select
                required
                value={formData.patientId}
                onChange={(e) => handlePatientChange(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
              >
                <option value="">Select patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {getPatientName(patient)} ({patient.email})
                  </option>
                ))}
              </select>
            </div>

            {selectedPatient && selectedPatient.orders.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Associated Order (Optional)
                </label>
                <select
                  value={formData.orderId}
                  onChange={(e) => handleInputChange('orderId', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                >
                  <option value="">No associated order</option>
                  {selectedPatient.orders.map(order => (
                    <option key={order.id} value={order.id}>
                      {order.swell_order_number || order.id.slice(0, 8)} ({new Date(order.created_at).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Diagnostic Test
              </label>
              <select
                required
                value={formData.testId}
                onChange={(e) => handleInputChange('testId', e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
              >
                <option value="">Select test type</option>
                {diagnosticTests.map(test => (
                  <option key={test.id} value={test.id}>
                    {test.name} ({test.test_code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Lab Report File (PDF or Image)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                required
                accept=".pdf,.jpg,.jpeg,.png,.tiff"
                onChange={handleFileChange}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30"
              />
              {uploadedFile && (
                <p className="mt-2 text-sm text-emerald-300">
                  ✓ {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)}MB)
                </p>
              )}
            </div>
          </div>

          {/* Lab Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              Lab Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Lab Report Number
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.labReportNumber}
                  onChange={(e) => handleInputChange('labReportNumber', e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                  placeholder="Enter or auto-generate"
                />
                <button
                  type="button"
                  onClick={() => handleInputChange('labReportNumber', generateLabReportNumber())}
                  className="px-3 py-3 bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-xl hover:bg-slate-600/60 transition-all duration-300"
                >
                  Generate
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Lab Accession Number
                </label>
                <input
                  type="text"
                  value={formData.labAccessionNumber}
                  onChange={(e) => handleInputChange('labAccessionNumber', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                  placeholder="Lab accession number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Performing Lab
                </label>
                <input
                  type="text"
                  required
                  value={formData.performingLab}
                  onChange={(e) => handleInputChange('performingLab', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Sample Collection Date
                </label>
                <input
                  type="date"
                  value={formData.sampleCollectionDate}
                  onChange={(e) => handleInputChange('sampleCollectionDate', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Sample Received Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.sampleReceivedDate}
                  onChange={(e) => handleInputChange('sampleReceivedDate', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Result Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.resultDate}
                  onChange={(e) => handleInputChange('resultDate', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Overall Status
              </label>
              <select
                value={formData.overallStatus}
                onChange={(e) => handleInputChange('overallStatus', e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
              >
                <option value="normal">Normal</option>
                <option value="abnormal">Abnormal</option>
                <option value="critical">Critical</option>
                <option value="pending_review">Pending Review</option>
              </select>
            </div>
          </div>
        </div>

        {/* Clinical Information */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Clinical Notes
            </label>
            <textarea
              value={formData.clinicalNotes}
              onChange={(e) => handleInputChange('clinicalNotes', e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
              rows={4}
              placeholder="Clinical interpretation and notes..."
            />
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="requiresFollowUp"
                checked={formData.requiresFollowUp}
                onChange={(e) => handleInputChange('requiresFollowUp', e.target.checked)}
                className="w-4 h-4 text-cyan-400 bg-slate-800 border-slate-600 rounded focus:ring-2 focus:ring-cyan-400/50"
              />
              <label htmlFor="requiresFollowUp" className="text-sm font-medium text-slate-300">
                Requires Follow-up
              </label>
            </div>

            {formData.requiresFollowUp && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Follow-up Instructions
                </label>
                <textarea
                  value={formData.followUpInstructions}
                  onChange={(e) => handleInputChange('followUpInstructions', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                  rows={4}
                  placeholder="Follow-up instructions for the patient..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-slate-700/50">
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium rounded-xl hover:from-emerald-400 hover:to-green-500 transition-all duration-300 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Uploading...' : 'Upload Lab Results'}
          </button>
        </div>
      </form>
    </div>
  )
}