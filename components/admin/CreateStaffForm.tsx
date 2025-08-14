'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface Role {
  id: string
  name: string
  description: string
  level: number
  is_admin_role: boolean
  default_permissions: string[]
}

interface Department {
  id: string
  name: string
  description: string
}

interface CreateStaffFormProps {
  roles: Role[]
  departments: Department[]
}

interface StaffFormData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
  roleId: string
  departmentId: string
  employeeId: string
  workEmail: string
  workPhone: string
  hireDate: string
  canAccessAdmin: boolean
  canViewPhi: boolean
  permissions: string[]
}

export default function CreateStaffForm({ roles, departments }: CreateStaffFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Check if we have the required data
  const hasRoles = roles && roles.length > 0
  const hasDepartments = departments && departments.length > 0
  const canCreateStaff = hasRoles && hasDepartments

  const [formData, setFormData] = useState<StaffFormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    roleId: '',
    departmentId: '',
    employeeId: '',
    workEmail: '',
    workPhone: '',
    hireDate: new Date().toISOString().split('T')[0],
    canAccessAdmin: false,
    canViewPhi: false,
    permissions: []
  })

  const handleInputChange = (field: keyof StaffFormData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-populate work email if not filled
    if (field === 'email' && !formData.workEmail) {
      setFormData(prev => ({ ...prev, workEmail: value as string }))
    }

    // Auto-set admin permissions based on role
    if (field === 'roleId') {
      const selectedRole = roles.find(r => r.id === value)
      if (selectedRole) {
        setFormData(prev => ({
          ...prev,
          canAccessAdmin: selectedRole.is_admin_role,
          canViewPhi: selectedRole.is_admin_role,
          permissions: selectedRole.default_permissions || []
        }))
      }
    }
  }

  const generateEmployeeId = () => {
    const dept = departments.find(d => d.id === formData.departmentId)
    const deptCode = dept?.name.split(' ').map(w => w[0]).join('').toUpperCase() || 'PHL'
    const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
    const employeeId = `${deptCode}${randomNum}`
    setFormData(prev => ({ ...prev, employeeId }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Call API route to create staff member
      const response = await fetch('/api/admin/staff/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          roleId: formData.roleId,
          departmentId: formData.departmentId,
          employeeId: formData.employeeId,
          workEmail: formData.workEmail,
          workPhone: formData.workPhone,
          hireDate: formData.hireDate,
          canAccessAdmin: formData.canAccessAdmin,
          canViewPhi: formData.canViewPhi,
          permissions: formData.permissions
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create staff member')
      }

      setSuccess('Staff member created successfully!')
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        roleId: '',
        departmentId: '',
        employeeId: '',
        workEmail: '',
        workPhone: '',
        hireDate: new Date().toISOString().split('T')[0],
        canAccessAdmin: false,
        canViewPhi: false,
        permissions: []
      })
      
      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload()
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl shadow-lg shadow-slate-900/30">
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
              <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white">Create New Staff Account</h2>
          </div>
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={!canCreateStaff}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
              !canCreateStaff
                ? 'bg-slate-800/50 border border-slate-700/50 text-slate-500 cursor-not-allowed'
                : isOpen
                ? 'bg-slate-700/50 border border-slate-600/50 text-slate-300'
                : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25'
            }`}
            title={!canCreateStaff ? 'Admin system setup required before creating staff' : ''}
          >
            {isOpen ? 'Cancel' : 'Add Staff Member'}
          </button>
        </div>
      </div>

      <motion.div
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <div className="p-6">
          {/* Data Requirements Message */}
          {!canCreateStaff && (
            <div className="mb-6 p-4 bg-amber-500/20 border border-amber-400/30 rounded-xl text-amber-300">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <div>
                  <div className="font-medium">Staff creation unavailable</div>
                  <div className="text-sm text-amber-300/80 mt-1">
                    {!hasRoles && !hasDepartments 
                      ? 'Staff roles and departments must be set up first'
                      : !hasRoles 
                      ? 'Staff roles must be set up first'
                      : 'Staff departments must be set up first'
                    }
                  </div>
                </div>
              </div>
            </div>
          )}

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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                    placeholder="Enter first name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                    placeholder="Enter last name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Initial Password
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                    placeholder="Create initial password"
                  />
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                Employment Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Role
                  </label>
                  <select
                    required
                    value={formData.roleId}
                    onChange={(e) => handleInputChange('roleId', e.target.value)}
                    disabled={!hasRoles}
                    className={`w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 ${
                      !hasRoles ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="">
                      {hasRoles ? 'Select role' : 'No roles available'}
                    </option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.name} {role.is_admin_role && '(Admin)'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Department
                  </label>
                  <select
                    required
                    value={formData.departmentId}
                    onChange={(e) => handleInputChange('departmentId', e.target.value)}
                    disabled={!hasDepartments}
                    className={`w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 ${
                      !hasDepartments ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="">
                      {hasDepartments ? 'Select department' : 'No departments available'}
                    </option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Employee ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={formData.employeeId}
                      onChange={(e) => handleInputChange('employeeId', e.target.value)}
                      className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                      placeholder="Enter employee ID"
                    />
                    <button
                      type="button"
                      onClick={generateEmployeeId}
                      disabled={!formData.departmentId}
                      className="px-3 py-3 bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-xl hover:bg-slate-600/60 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Generate
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Hire Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.hireDate}
                    onChange={(e) => handleInputChange('hireDate', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.workEmail}
                    onChange={(e) => handleInputChange('workEmail', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                    placeholder="Enter work email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Work Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.workPhone}
                    onChange={(e) => handleInputChange('workPhone', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300"
                    placeholder="Enter work phone"
                  />
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                Access Permissions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-slate-900/30 border border-slate-700/30 rounded-xl">
                  <input
                    type="checkbox"
                    id="canAccessAdmin"
                    checked={formData.canAccessAdmin}
                    onChange={(e) => handleInputChange('canAccessAdmin', e.target.checked)}
                    className="w-4 h-4 text-cyan-400 bg-slate-800 border-slate-600 rounded focus:ring-2 focus:ring-cyan-400/50"
                  />
                  <label htmlFor="canAccessAdmin" className="text-sm text-slate-300">
                    Can access admin dashboard
                  </label>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-900/30 border border-slate-700/30 rounded-xl">
                  <input
                    type="checkbox"
                    id="canViewPhi"
                    checked={formData.canViewPhi}
                    onChange={(e) => handleInputChange('canViewPhi', e.target.checked)}
                    className="w-4 h-4 text-cyan-400 bg-slate-800 border-slate-600 rounded focus:ring-2 focus:ring-cyan-400/50"
                  />
                  <label htmlFor="canViewPhi" className="text-sm text-slate-300">
                    Can view protected health information (PHI)
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-700/50">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-6 py-3 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-300 font-medium rounded-xl hover:bg-slate-600/60 transition-all duration-300"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium rounded-xl hover:from-emerald-400 hover:to-green-500 transition-all duration-300 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating...' : 'Create Staff Account'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}