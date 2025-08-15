'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { createLocation, type LocationFormData } from '@/lib/actions/locations'

interface StaffMember {
  id: string
  first_name: string | null
  last_name: string | null
  profiles?: Array<{
    first_name: string | null
    last_name: string | null
    email: string | null
  }>
}

interface CreateLocationFormProps {
  staff: StaffMember[]
}

interface OperatingHours {
  [key: string]: {
    open: string
    close: string
    closed: boolean
  }
}

export default function CreateLocationForm({ staff }: CreateLocationFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    location_code: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'US',
    phone: '',
    email: '',
    website: '',
    timezone: 'America/New_York',
    capacity: 10,
    location_manager_id: '',
    accepts_walk_ins: false,
    requires_appointment: true,
    is_active: true
  })

  const [operatingHours, setOperatingHours] = useState<OperatingHours>({
    monday: { open: '08:00', close: '17:00', closed: false },
    tuesday: { open: '08:00', close: '17:00', closed: false },
    wednesday: { open: '08:00', close: '17:00', closed: false },
    thursday: { open: '08:00', close: '17:00', closed: false },
    friday: { open: '08:00', close: '17:00', closed: false },
    saturday: { open: '09:00', close: '15:00', closed: false },
    sunday: { open: '10:00', close: '14:00', closed: true }
  })

  const [servicesOffered, setServicesOffered] = useState<string[]>(['blood_draw'])

  const availableServices = [
    { value: 'blood_draw', label: 'Blood Draw' },
    { value: 'urine_collection', label: 'Urine Collection' },
    { value: 'rapid_testing', label: 'Rapid Testing' },
    { value: 'vital_signs', label: 'Vital Signs' },
    { value: 'consultation', label: 'Consultation' }
  ]

  const daysOfWeek = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ]

  const timezones = [
    'America/New_York',
    'America/Chicago', 
    'America/Denver',
    'America/Los_Angeles',
    'America/Phoenix'
  ]

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleHoursChange = (day: string, field: string, value: string | boolean) => {
    setOperatingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }))
  }

  const handleServiceToggle = (service: string) => {
    setServicesOffered(prev => 
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const locationData: LocationFormData = {
        ...formData,
        operating_hours: operatingHours,
        services_offered: servicesOffered,
        location_manager_id: formData.location_manager_id || undefined
      }

      const result = await createLocation(locationData)
      
      if (!result.success) {
        setError(result.error || 'Failed to create location')
        return
      }
      
      // Reset form on success
      setFormData({
        name: '',
        location_code: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'US',
        phone: '',
        email: '',
        website: '',
        timezone: 'America/New_York',
        capacity: 10,
        location_manager_id: '',
        accepts_walk_ins: false,
        requires_appointment: true,
        is_active: true
      })
      setOperatingHours({
        monday: { open: '08:00', close: '17:00', closed: false },
        tuesday: { open: '08:00', close: '17:00', closed: false },
        wednesday: { open: '08:00', close: '17:00', closed: false },
        thursday: { open: '08:00', close: '17:00', closed: false },
        friday: { open: '08:00', close: '17:00', closed: false },
        saturday: { open: '09:00', close: '15:00', closed: false },
        sunday: { open: '10:00', close: '14:00', closed: true }
      })
      setServicesOffered(['blood_draw'])
      setIsOpen(false)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create location')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStaffDisplayName = (staffMember: StaffMember) => {
    const profile = staffMember.profiles?.[0] // Get first profile from array
    const firstName = profile?.first_name || staffMember.first_name || ''
    const lastName = profile?.last_name || staffMember.last_name || ''
    return `${firstName} ${lastName}`.trim() || profile?.email || 'Unknown'
  }

  return (
    <div className="space-y-6">
      {!isOpen ? (
        <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-lg"></div>
                Add New Location
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Create a new testing center for patient appointments
              </p>
            </div>
            
            <button
              onClick={() => setIsOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25"
            >
              Create Location
            </button>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-3">
              <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-lg"></div>
              Create New Location
            </h2>
            
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 text-slate-400 hover:text-white text-sm transition-colors"
            >
              Cancel
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Location Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  placeholder="Prism Health Lab - Downtown"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Location Code
                </label>
                <input
                  type="text"
                  value={formData.location_code}
                  onChange={(e) => handleInputChange('location_code', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  placeholder="downtown"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Address</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={formData.address_line_1}
                  onChange={(e) => handleInputChange('address_line_1', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  placeholder="123 Main Street"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Suite/Unit (Optional)
                </label>
                <input
                  type="text"
                  value={formData.address_line_2}
                  onChange={(e) => handleInputChange('address_line_2', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  placeholder="Suite 100"
                />
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    placeholder="Chicago"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    placeholder="IL"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={formData.zip_code}
                    onChange={(e) => handleInputChange('zip_code', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    placeholder="60601"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Contact Information</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    placeholder="(847) 555-0123"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    placeholder="downtown@prismhealthlab.com"
                  />
                </div>
              </div>
            </div>

            {/* Operating Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Operating Configuration</h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Timezone
                  </label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  >
                    {timezones.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Capacity
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    min="1"
                    max="50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Location Manager
                  </label>
                  <select
                    value={formData.location_manager_id}
                    onChange={(e) => handleInputChange('location_manager_id', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  >
                    <option value="">Select manager</option>
                    {staff.map(member => (
                      <option key={member.id} value={member.id}>
                        {getStaffDisplayName(member)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Options */}
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.accepts_walk_ins}
                    onChange={(e) => handleInputChange('accepts_walk_ins', e.target.checked)}
                    className="w-4 h-4 bg-slate-900/50 border border-slate-600/50 rounded text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="text-slate-300">Accepts walk-ins</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    className="w-4 h-4 bg-slate-900/50 border border-slate-600/50 rounded text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="text-slate-300">Active location</span>
                </label>
              </div>
            </div>

            {/* Services Offered */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Services Offered</h3>
              <div className="grid md:grid-cols-3 gap-3">
                {availableServices.map(service => (
                  <label key={service.value} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={servicesOffered.includes(service.value)}
                      onChange={() => handleServiceToggle(service.value)}
                      className="w-4 h-4 bg-slate-900/50 border border-slate-600/50 rounded text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="text-slate-300">{service.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Operating Hours */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Operating Hours</h3>
              <div className="space-y-3">
                {daysOfWeek.map(day => (
                  <div key={day} className="flex items-center gap-4">
                    <div className="w-20">
                      <span className="text-slate-300 capitalize">{day}</span>
                    </div>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={operatingHours[day].closed}
                        onChange={(e) => handleHoursChange(day, 'closed', e.target.checked)}
                        className="w-4 h-4 bg-slate-900/50 border border-slate-600/50 rounded text-red-500 focus:ring-red-500"
                      />
                      <span className="text-slate-400 text-sm">Closed</span>
                    </label>
                    
                    {!operatingHours[day].closed && (
                      <>
                        <input
                          type="time"
                          value={operatingHours[day].open}
                          onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                          className="px-3 py-2 bg-slate-900/50 border border-slate-600/50 rounded text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                        />
                        <span className="text-slate-400">to</span>
                        <input
                          type="time"
                          value={operatingHours[day].close}
                          onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                          className="px-3 py-2 bg-slate-900/50 border border-slate-600/50 rounded text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-700/50">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Location'}
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  )
}