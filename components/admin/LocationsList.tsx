'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Location } from '@/types/admin'

interface LocationsListProps {
  locations: (Location & {
    staff?: {
      id: string
      first_name: string | null
      last_name: string | null
      profiles?: {
        first_name: string | null
        last_name: string | null
        email: string | null
      }
    } | null
  })[]
}

export default function LocationsList({ locations }: LocationsListProps) {
  // const [selectedLocation] = useState<string | null>(null)

  const formatAddress = (location: Location) => {
    const parts = [
      location.address_line_1,
      location.address_line_2,
      `${location.city}, ${location.state} ${location.zip_code}`
    ].filter(Boolean)
    return parts.join(', ')
  }

  const formatOperatingHours = (hours: Record<string, unknown>) => {
    if (!hours || Object.keys(hours).length === 0) {
      return 'Hours not set'
    }
    
    // Show today's hours or first available day
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    const todayHours = hours[today]
    
    if (todayHours && typeof todayHours === 'object' && todayHours !== null && !(todayHours as Record<string, unknown>).closed) {
      const dayHours = todayHours as Record<string, unknown>
      return `Today: ${dayHours.open} - ${dayHours.close}`
    }
    
    // Find first open day
    const openDay = Object.entries(hours).find(([, dayHours]: [string, unknown]) => 
      dayHours && typeof dayHours === 'object' && dayHours !== null && !(dayHours as Record<string, unknown>).closed
    )
    
    if (openDay) {
      const [day, dayHours] = openDay as [string, Record<string, unknown>]
      return `${day.charAt(0).toUpperCase() + day.slice(1)}: ${dayHours.open} - ${dayHours.close}`
    }
    
    return 'Currently closed'
  }

  if (locations.length === 0) {
    return (
      <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-slate-400 rounded-lg"></div>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Locations Yet</h3>
        <p className="text-slate-400">Create your first testing location to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
          <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg"></div>
          Testing Locations ({locations.length})
        </h2>
      </div>

      <div className="grid gap-6">
        {locations.map((location, index) => (
          <motion.div
            key={location.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/60 transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl font-semibold text-white">{location.name}</h3>
                  
                  {/* Status Indicator */}
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      location.is_active 
                        ? 'bg-emerald-400 animate-pulse' 
                        : 'bg-slate-500'
                    }`}></div>
                    <span className={`text-sm font-medium ${
                      location.is_active ? 'text-emerald-300' : 'text-slate-400'
                    }`}>
                      {location.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Location Code */}
                  {location.location_code && (
                    <span className="px-2 py-1 bg-slate-700/50 border border-slate-600/50 rounded text-xs font-mono text-slate-300">
                      {location.location_code}
                    </span>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  {/* Address */}
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Address</p>
                    <p className="text-slate-200">{formatAddress(location)}</p>
                  </div>

                  {/* Contact */}
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Contact</p>
                    <div className="space-y-1">
                      {location.phone && (
                        <p className="text-slate-200 font-mono text-sm">{location.phone}</p>
                      )}
                      {location.email && (
                        <p className="text-slate-200 text-sm">{location.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Operating Hours */}
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Hours</p>
                    <p className="text-slate-200 text-sm">{formatOperatingHours(location.operating_hours)}</p>
                  </div>

                  {/* Manager */}
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Manager</p>
                    {location.staff ? (
                      <p className="text-slate-200 text-sm">
                        {location.staff.profiles?.first_name || location.staff.first_name} {' '}
                        {location.staff.profiles?.last_name || location.staff.last_name}
                      </p>
                    ) : (
                      <p className="text-slate-500 text-sm">No manager assigned</p>
                    )}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-slate-300">Capacity: {location.capacity}</span>
                  </div>
                  
                  {location.accepts_walk_ins && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-slate-300">Walk-ins accepted</span>
                    </div>
                  )}

                  {location.services_offered?.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-slate-300">
                        {location.services_offered.length} service{location.services_offered.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => console.log('Edit location:', location.id)}
                  className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25"
                >
                  Edit
                </button>
                
                <button
                  className="px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white text-sm font-medium rounded-lg border border-slate-600/50 hover:border-slate-500/50 transition-all duration-200"
                >
                  View Details
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}