'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface Staff {
  id: string
  employee_id: string
  work_email: string
  work_phone: string | null
  hire_date: string
  can_access_admin: boolean
  can_view_phi: boolean
  is_active: boolean
  created_at: string
  first_name: string | null
  last_name: string | null
  profiles?: {
    first_name: string | null
    last_name: string | null
    email: string | null
    phone: string | null
  } | null
  staff_roles: {
    name: string
    description: string | null
    is_admin_role: boolean
  } | null
  staff_departments: {
    name: string
    description: string | null
  } | null
}

interface StaffListProps {
  staff: Staff[]
}

export default function StaffList({ staff }: StaffListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Get unique roles for filter
  const uniqueRoles = Array.from(new Set(
    staff.map(member => member.staff_roles?.name).filter(Boolean)
  ))

  // Filter staff
  const filteredStaff = staff.filter(member => {
    const matchesSearch = 
      member.profiles?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.profiles?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.staff_roles?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = filterRole === 'all' || member.staff_roles?.name === filterRole
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && member.is_active) ||
      (filterStatus === 'inactive' && !member.is_active) ||
      (filterStatus === 'admin' && member.can_access_admin) ||
      (filterStatus === 'phi_access' && member.can_view_phi)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const getStatusColor = (isActive: boolean, isAdmin: boolean, hasPhi: boolean) => {
    if (!isActive) return 'bg-slate-500/20 border-slate-400/30 text-slate-300'
    if (isAdmin) return 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300'
    if (hasPhi) return 'bg-amber-500/20 border-amber-400/30 text-amber-300'
    return 'bg-blue-500/20 border-blue-400/30 text-blue-300'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl shadow-lg shadow-slate-900/30">
      {/* Header with Search and Filters */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
            <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-white">Current Staff Members</h2>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search staff by name, email, employee ID, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 backdrop-blur-sm"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 backdrop-blur-sm"
            >
              <option value="all">All Roles</option>
              {uniqueRoles.map(role => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 backdrop-blur-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="admin">Admin Access</option>
              <option value="phi_access">PHI Access</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <p className="text-slate-400 text-sm">
            Showing {filteredStaff.length} of {staff.length} staff members
          </p>
        </div>
      </div>

      {/* Staff List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredStaff.length > 0 ? (
          <div className="divide-y divide-slate-700/50">
            {filteredStaff.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-6 hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Staff Avatar */}
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      member.staff_roles?.is_admin_role
                        ? 'bg-gradient-to-br from-emerald-400 to-green-500' 
                        : 'bg-gradient-to-br from-blue-400 to-indigo-500'
                    }`}>
                      <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Staff Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-white font-semibold text-lg">
                        {(member.first_name && member.last_name) 
                          ? `${member.first_name} ${member.last_name}`
                          : (member.profiles?.first_name && member.profiles?.last_name)
                            ? `${member.profiles.first_name} ${member.profiles.last_name}`
                            : `Staff Member ${member.employee_id}`
                        }
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        getStatusColor(member.is_active, member.can_access_admin, member.can_view_phi)
                      }`}>
                        {!member.is_active ? 'INACTIVE' :
                         member.can_access_admin ? 'ADMIN' :
                         member.can_view_phi ? 'PHI ACCESS' : 'ACTIVE'}
                      </span>
                      {member.staff_roles?.is_admin_role && (
                        <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 rounded-full text-xs font-medium">
                          ADMIN ROLE
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 mb-2">
                      <p className="text-slate-300 text-sm">
                        ID: {member.employee_id}
                      </p>
                      <p className="text-slate-300 text-sm">
                        {member.staff_roles?.name || 'No role assigned'}
                      </p>
                      <p className="text-slate-300 text-sm">
                        {member.staff_departments?.name || 'No department assigned'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-6 text-xs text-slate-400">
                      <span>Work: {member.work_email || 'Not provided'}</span>
                      {member.work_phone && <span>Phone: {member.work_phone}</span>}
                      <span>Hired: {formatDate(member.hire_date)}</span>
                      <div className="flex items-center gap-3">
                        {member.can_access_admin && (
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                            <span className="text-emerald-300">Admin</span>
                          </div>
                        )}
                        {member.can_view_phi && (
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                            <span className="text-amber-300">PHI</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <button className="px-3 py-2 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-600/60 hover:border-slate-500/60 transition-all duration-300">
                      Edit
                    </button>
                    
                    <button className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                      member.is_active
                        ? 'bg-rose-500/20 border border-rose-400/30 text-rose-300 hover:bg-rose-500/30'
                        : 'bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/30'
                    }`}>
                      {member.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-700/50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-slate-500 rounded-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                </div>
              </div>
            </div>
            <p className="text-slate-400 mb-4">No staff members found matching your search criteria</p>
            <button 
              onClick={() => {
                setSearchTerm('')
                setFilterRole('all')
                setFilterStatus('all')
              }}
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}