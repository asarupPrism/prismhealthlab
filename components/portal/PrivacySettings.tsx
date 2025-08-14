'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

interface PrivacySettingsProps {
  preferences: any
  userId: string
}

export default function PrivacySettings({ preferences, userId }: PrivacySettingsProps) {
  const [privacySettings, setPrivacySettings] = useState({
    shareDataForResearch: preferences?.share_data_for_research ?? false,
    allowAnalytics: preferences?.allow_analytics ?? true,
    showProfilePublic: preferences?.show_profile_public ?? false,
    allowMarketingEmails: preferences?.allow_marketing_emails ?? false,
    shareWithPartners: preferences?.share_with_partners ?? false,
    dataRetentionPeriod: preferences?.data_retention_period || '5years'
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleToggle = async (setting: string, value: boolean) => {
    const newSettings = { ...privacySettings, [setting]: value }
    setPrivacySettings(newSettings)
    await saveSettings(newSettings)
  }

  const handleRetentionChange = async (value: string) => {
    const newSettings = { ...privacySettings, dataRetentionPeriod: value }
    setPrivacySettings(newSettings)
    await saveSettings(newSettings)
  }

  const saveSettings = async (settings: typeof privacySettings) => {
    setIsLoading(true)
    setMessage(null)

    try {
      const supabase = createClient()
      
      const preferencesData = {
        user_id: userId,
        share_data_for_research: settings.shareDataForResearch,
        allow_analytics: settings.allowAnalytics,
        show_profile_public: settings.showProfilePublic,
        allow_marketing_emails: settings.allowMarketingEmails,
        share_with_partners: settings.shareWithPartners,
        data_retention_period: settings.dataRetentionPeriod,
        privacy_mode: !settings.allowAnalytics && !settings.shareDataForResearch,
        updated_at: new Date().toISOString()
      }

      if (preferences) {
        const { error } = await supabase
          .from('user_preferences')
          .update(preferencesData)
          .eq('user_id', userId)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('user_preferences')
          .insert(preferencesData)

        if (error) throw error
      }

      setMessage('Privacy settings saved')
      setTimeout(() => setMessage(null), 3000)
      
    } catch (err) {
      console.error('Error saving privacy settings:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl shadow-lg shadow-slate-900/30"
    >
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
            <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-white">Privacy Settings</h2>
        </div>
      </div>

      <div className="p-6">
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-emerald-300"
          >
            {message}
          </motion.div>
        )}

        <div className="space-y-6">
          {/* Data Sharing */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              Data Sharing
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl">
                <div>
                  <p className="text-white font-medium">Medical Research</p>
                  <p className="text-slate-400 text-sm">Share anonymized data for medical research</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacySettings.shareDataForResearch}
                    onChange={(e) => handleToggle('shareDataForResearch', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:ring-2 peer-focus:ring-purple-400/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl">
                <div>
                  <p className="text-white font-medium">Partner Labs</p>
                  <p className="text-slate-400 text-sm">Share data with partner laboratories for testing</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacySettings.shareWithPartners}
                    onChange={(e) => handleToggle('shareWithPartners', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:ring-2 peer-focus:ring-purple-400/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Analytics & Tracking */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
              Analytics & Tracking
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl">
                <div>
                  <p className="text-white font-medium">Usage Analytics</p>
                  <p className="text-slate-400 text-sm">Help us improve by sharing app usage data</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacySettings.allowAnalytics}
                    onChange={(e) => handleToggle('allowAnalytics', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:ring-2 peer-focus:ring-indigo-400/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl">
                <div>
                  <p className="text-white font-medium">Marketing Communications</p>
                  <p className="text-slate-400 text-sm">Receive personalized offers and promotions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacySettings.allowMarketingEmails}
                    onChange={(e) => handleToggle('allowMarketingEmails', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:ring-2 peer-focus:ring-indigo-400/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Profile Visibility */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              Profile Visibility
            </h3>
            <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl">
              <div>
                <p className="text-white font-medium">Public Profile</p>
                <p className="text-slate-400 text-sm">Make your profile visible to other users</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacySettings.showProfilePublic}
                  onChange={(e) => handleToggle('showProfilePublic', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:ring-2 peer-focus:ring-cyan-400/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Data Retention */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
              Data Retention
            </h3>
            <div className="p-4 bg-slate-900/30 rounded-xl">
              <label className="block text-white font-medium mb-3">
                How long should we keep your data?
              </label>
              <select
                value={privacySettings.dataRetentionPeriod}
                onChange={(e) => handleRetentionChange(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all duration-300"
              >
                <option value="1year">1 Year</option>
                <option value="3years">3 Years</option>
                <option value="5years">5 Years</option>
                <option value="7years">7 Years (Recommended)</option>
                <option value="forever">Forever</option>
              </select>
              <p className="text-slate-400 text-sm mt-2">
                Medical records are typically retained for 7 years as per healthcare regulations
              </p>
            </div>
          </div>

          {/* Privacy Mode */}
          <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium mb-1">
                  🔒 Enhanced Privacy Mode
                </p>
                <p className="text-slate-400 text-sm">
                  Disable all non-essential data collection and sharing
                </p>
              </div>
              <button
                onClick={() => {
                  const strictMode = {
                    shareDataForResearch: false,
                    allowAnalytics: false,
                    showProfilePublic: false,
                    allowMarketingEmails: false,
                    shareWithPartners: false,
                    dataRetentionPeriod: '1year'
                  }
                  setPrivacySettings(strictMode)
                  saveSettings(strictMode)
                }}
                className="px-4 py-2 bg-purple-500/20 border border-purple-400/30 text-purple-300 font-medium rounded-xl hover:bg-purple-500/30 transition-all duration-300"
              >
                Enable Strict Privacy
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}