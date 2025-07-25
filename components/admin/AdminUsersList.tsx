'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'

interface User {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  created_at: string
  last_sign_in_at?: string
  orders?: { id: string; total: number; status: string; created_at: string }[]
  appointments?: { id: string; scheduled_date: string; status: string }[]
  test_results?: { id: string; test_name: string; status: string; created_at: string }[]
  staff?: {
    role: string
    department?: string
    permissions: string[]
  }
}

interface AdminUsersListProps {
  users: User[]
}

export default function AdminUsersList({ users }: AdminUsersListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'patients' | 'staff'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'activity' | 'email'>('created')

  // Filter and sort users
  const filteredAndSortedUsers = users
    .filter(user => {
      const matchesSearch = 
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesFilter = 
        filterType === 'all' ||
        (filterType === 'staff' && user.staff) ||
        (filterType === 'patients' && !user.staff)
      
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
        case 'activity':
          return new Date(b.last_sign_in_at || 0).getTime() - new Date(a.last_sign_in_at || 0).getTime()
        case 'created':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

  const getUserStatusColor = (user: User) => {
    if (user.staff) {
      switch (user.staff.role) {
        case 'superadmin':
          return 'bg-purple-500/20 border-purple-400/30 text-purple-300'
        case 'admin':
          return 'bg-rose-500/20 border-rose-400/30 text-rose-300'
        case 'manager':
          return 'bg-amber-500/20 border-amber-400/30 text-amber-300'
        case 'staff':
          return 'bg-blue-500/20 border-blue-400/30 text-blue-300'
        default:
          return 'bg-slate-500/20 border-slate-400/30 text-slate-300'
      }
    }
    return 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300'
  }

  const getUserStatusLabel = (user: User) => {
    return user.staff ? user.staff.role.toUpperCase() : 'PATIENT'
  }

  const getLastActivity = (user: User) => {
    if (!user.last_sign_in_at) return 'Never'
    
    const lastActivity = new Date(user.last_sign_in_at)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    return `${Math.floor(diffInDays / 30)} months ago`
  }

  return (
    <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl shadow-lg shadow-slate-900/30">
      {/* Header with Search and Filters */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 backdrop-blur-sm"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'patients' | 'staff')}
              className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 backdrop-blur-sm"
            >
              <option value="all">All Users</option>
              <option value="patients">Patients Only</option>
              <option value="staff">Staff Only</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'created' | 'name' | 'email' | 'activity')}
              className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all duration-300 backdrop-blur-sm"
            >
              <option value="created">Sort by Created</option>
              <option value="name">Sort by Name</option>
              <option value="activity">Sort by Activity</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <p className="text-slate-400 text-sm">
            Showing {filteredAndSortedUsers.length} of {users.length} users
          </p>
          
          <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25">
            Add New User
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredAndSortedUsers.length > 0 ? (
          <div className="divide-y divide-slate-700/50">
            {filteredAndSortedUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-6 hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {user.first_name?.[0] || user.email?.[0].toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-white font-semibold text-lg">
                        {user.first_name} {user.last_name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUserStatusColor(user)}`}>
                        {getUserStatusLabel(user)}
                      </span>
                    </div>
                    
                    <p className="text-slate-300 text-sm mb-2">{user.email}</p>
                    
                    <div className="flex items-center gap-6 text-xs text-slate-400">
                      <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                      <span>Last Active: {getLastActivity(user)}</span>
                      {user.orders && user.orders.length > 0 && (
                        <span>Orders: {user.orders.length}</span>
                      )}
                      {user.appointments && user.appointments.length > 0 && (
                        <span>Appointments: {user.appointments.length}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <button className="px-3 py-2 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-600/60 hover:border-slate-500/60 transition-all duration-300">
                      View Profile
                    </button>
                    
                    {user.staff ? (
                      <button className="px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium rounded-lg hover:from-amber-400 hover:to-orange-500 transition-all duration-300 shadow-lg shadow-amber-500/25">
                        Manage Staff
                      </button>
                    ) : (
                      <button className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-medium rounded-lg hover:from-emerald-400 hover:to-green-500 transition-all duration-300 shadow-lg shadow-emerald-500/25">
                        View Medical
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-700/50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 border border-slate-400 rounded-sm"></div>
              </div>
            </div>
            <p className="text-slate-400 mb-4">No users found matching your search criteria</p>
            <button 
              onClick={() => {
                setSearchTerm('')
                setFilterType('all')
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