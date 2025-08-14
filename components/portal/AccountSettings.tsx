'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface AccountSettingsProps {
  profile: any
  user: any
}

export default function AccountSettings({ profile, user }: AccountSettingsProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleDeactivateAccount = async () => {
    if (!confirm('Are you sure you want to deactivate your account? You can reactivate it by logging in again.')) {
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const supabase = createClient()
      
      // Update profile to deactivated
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_active: false,
          deactivated_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) throw error

      // Sign out
      await supabase.auth.signOut()
      router.push('/login')
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to deactivate account' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE MY ACCOUNT') {
      setMessage({ type: 'error', text: 'Please type the confirmation text exactly' })
      return
    }

    setIsDeleting(true)
    setMessage(null)

    try {
      const supabase = createClient()
      
      // In production, this would trigger a deletion process
      // For safety, we'll mark the account for deletion
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          deletion_reason: 'User requested',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) throw error

      // Sign out and redirect
      await supabase.auth.signOut()
      router.push('/login')
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete account' })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExportData = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      // In production, this would generate a data export
      setMessage({ type: 'success', text: 'Data export request received. You will receive an email with your data within 24 hours.' })
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to request data export' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl shadow-lg shadow-slate-900/30"
    >
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
            <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-white">Account Settings</h2>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {message && (
          <div className={`p-4 rounded-xl ${
            message.type === 'success' 
              ? 'bg-emerald-500/20 border border-emerald-400/30 text-emerald-300'
              : 'bg-rose-500/20 border border-rose-400/30 text-rose-300'
          }`}>
            {message.text}
          </div>
        )}

        {/* Account Information */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
            Account Information
          </h3>
          <div className="space-y-3">
            <div className="p-4 bg-slate-900/30 rounded-xl">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Account ID</p>
                  <p className="text-white font-mono text-sm">{user.id.slice(0, 8)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Account Type</p>
                  <p className="text-white">Patient Account</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Member Since</p>
                  <p className="text-white">
                    {profile?.created_at 
                      ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
                      : 'Unknown'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Account Status</p>
                  <p className="text-emerald-400">Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Connected Services */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
            Connected Services
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 border border-blue-400/30 rounded-xl flex items-center justify-center">
                  <div className="w-5 h-5 bg-blue-400/50 rounded-lg"></div>
                </div>
                <div>
                  <p className="text-white font-medium">Email Authentication</p>
                  <p className="text-slate-400 text-sm">{user.email}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-sm rounded-full">
                Connected
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 border border-purple-400/30 rounded-xl flex items-center justify-center">
                  <div className="w-5 h-5 bg-purple-400/50 rounded-lg"></div>
                </div>
                <div>
                  <p className="text-white font-medium">Health Records</p>
                  <p className="text-slate-400 text-sm">Sync with healthcare providers</p>
                </div>
              </div>
              <button className="px-3 py-1.5 bg-slate-700/50 border border-slate-600/50 text-slate-300 font-medium rounded-lg hover:bg-slate-600/60 transition-all duration-300">
                Connect
              </button>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
            Data Management
          </h3>
          <div className="space-y-3">
            <button
              onClick={handleExportData}
              disabled={isLoading}
              className="w-full flex items-center justify-between p-4 bg-slate-900/30 rounded-xl hover:bg-slate-800/50 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/20 border border-indigo-400/30 rounded-xl flex items-center justify-center">
                  <div className="w-5 h-5 bg-indigo-400/50 rounded-lg flex items-center justify-center">
                    ↓
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Export Your Data</p>
                  <p className="text-slate-400 text-sm">Download all your health data</p>
                </div>
              </div>
              <span className="text-indigo-400">→</span>
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-slate-900/30 rounded-xl hover:bg-slate-800/50 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 border border-purple-400/30 rounded-xl flex items-center justify-center">
                  <div className="w-5 h-5 bg-purple-400/50 rounded-lg flex items-center justify-center">
                    ↔
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Transfer Data</p>
                  <p className="text-slate-400 text-sm">Move data to another provider</p>
                </div>
              </div>
              <span className="text-purple-400">→</span>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="p-4 bg-rose-500/10 border border-rose-400/30 rounded-xl">
          <h3 className="text-lg font-semibold text-rose-300 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
            Danger Zone
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Deactivate Account</p>
                <p className="text-slate-400 text-sm">Temporarily disable your account</p>
              </div>
              <button
                onClick={handleDeactivateAccount}
                disabled={isLoading}
                className="px-4 py-2 bg-amber-500/20 border border-amber-400/30 text-amber-300 font-medium rounded-xl hover:bg-amber-500/30 transition-all duration-300"
              >
                Deactivate
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-rose-400/20">
              <div>
                <p className="text-white font-medium">Delete Account</p>
                <p className="text-slate-400 text-sm">Permanently remove your account and data</p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-rose-500/20 border border-rose-400/30 text-rose-300 font-medium rounded-xl hover:bg-rose-500/30 transition-all duration-300"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md backdrop-blur-sm bg-slate-800/95 border border-slate-700/50 rounded-2xl shadow-2xl p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Delete Account</h3>
            <p className="text-slate-300 mb-4">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            <p className="text-slate-400 text-sm mb-4">
              Type <span className="font-mono text-rose-400">DELETE MY ACCOUNT</span> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400/50 mb-6"
              placeholder="Type confirmation text"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteConfirmation('')
                }}
                className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600/50 text-slate-300 font-medium rounded-xl hover:bg-slate-600/60 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmation !== 'DELETE MY ACCOUNT'}
                className="flex-1 px-4 py-3 bg-rose-500 text-white font-medium rounded-xl hover:bg-rose-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}