'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

interface NotificationPreferences {
  email_results: boolean
  sms_reminders: boolean
  push_notifications: boolean
}

interface NotificationPreferencesProps {
  preferences: NotificationPreferences
  userId: string
}

export default function NotificationPreferences({ preferences, userId }: NotificationPreferencesProps) {
  const [successMessage, setSuccessMessage] = useState('')
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: preferences?.email_notifications ?? true,
    smsNotifications: preferences?.sms_notifications ?? false,
    pushNotifications: preferences?.push_notifications ?? true,
    appointmentReminders: preferences?.appointment_reminders ?? true,
    resultAlerts: preferences?.result_alerts ?? true,
    promotionalEmails: preferences?.promotional_emails ?? false,
    newsletterSubscription: preferences?.newsletter_subscription ?? false,
    reminderTiming: preferences?.reminder_timing || '24h'
  })

  const handleToggle = async (setting: string, value: boolean) => {
    const newSettings = { ...notificationSettings, [setting]: value }
    setNotificationSettings(newSettings)
    await savePreferences(newSettings)
  }

  const handleTimingChange = async (value: string) => {
    const newSettings = { ...notificationSettings, reminderTiming: value }
    setNotificationSettings(newSettings)
    await savePreferences(newSettings)
  }

  const savePreferences = async (settings: typeof notificationSettings) => {
    setIsLoading(true)
    setSuccessMessage('')

    try {
      const supabase = createClient()
      
      const preferencesData = {
        user_id: userId,
        email_notifications: settings.emailNotifications,
        sms_notifications: settings.smsNotifications,
        push_notifications: settings.pushNotifications,
        appointment_reminders: settings.appointmentReminders,
        result_alerts: settings.resultAlerts,
        promotional_emails: settings.promotionalEmails,
        newsletter_subscription: settings.newsletterSubscription,
        reminder_timing: settings.reminderTiming,
        updated_at: new Date().toISOString()
      }

      if (preferences) {
        // Update existing preferences
        const { error } = await supabase
          .from('user_preferences')
          .update(preferencesData)
          .eq('user_id', userId)

        if (error) throw error
      } else {
        // Create new preferences
        const { error } = await supabase
          .from('user_preferences')
          .insert(preferencesData)

        if (error) throw error
      }

      setSuccessMessage('Preferences saved!')
      setTimeout(() => setSuccessMessage(''), 3000)
      
    } catch (err) {
      console.error('Error saving preferences:', err)
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
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
            <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-white">Notification Preferences</h2>
        </div>
      </div>

      <div className="p-6">
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-emerald-300"
          >
            {successMessage}
          </motion.div>
        )}

        <div className="space-y-6">
          {/* Communication Channels */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              Communication Channels
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl">
                <div>
                  <p className="text-white font-medium">Email Notifications</p>
                  <p className="text-slate-400 text-sm">Receive updates via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) => handleToggle('emailNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:ring-2 peer-focus:ring-cyan-400/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl">
                <div>
                  <p className="text-white font-medium">SMS Notifications</p>
                  <p className="text-slate-400 text-sm">Get text message alerts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.smsNotifications}
                    onChange={(e) => handleToggle('smsNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:ring-2 peer-focus:ring-cyan-400/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl">
                <div>
                  <p className="text-white font-medium">Push Notifications</p>
                  <p className="text-slate-400 text-sm">Browser push notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.pushNotifications}
                    onChange={(e) => handleToggle('pushNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:ring-2 peer-focus:ring-cyan-400/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Notification Types */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              Notification Types
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl">
                <div>
                  <p className="text-white font-medium">Appointment Reminders</p>
                  <p className="text-slate-400 text-sm">Reminders for upcoming appointments</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.appointmentReminders}
                    onChange={(e) => handleToggle('appointmentReminders', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:ring-2 peer-focus:ring-emerald-400/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-emerald-500 peer-checked:to-green-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl">
                <div>
                  <p className="text-white font-medium">Result Alerts</p>
                  <p className="text-slate-400 text-sm">Notifications when results are ready</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.resultAlerts}
                    onChange={(e) => handleToggle('resultAlerts', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:ring-2 peer-focus:ring-emerald-400/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-emerald-500 peer-checked:to-green-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl">
                <div>
                  <p className="text-white font-medium">Promotional Emails</p>
                  <p className="text-slate-400 text-sm">Special offers and discounts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.promotionalEmails}
                    onChange={(e) => handleToggle('promotionalEmails', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:ring-2 peer-focus:ring-emerald-400/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-emerald-500 peer-checked:to-green-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900/30 rounded-xl">
                <div>
                  <p className="text-white font-medium">Newsletter</p>
                  <p className="text-slate-400 text-sm">Health tips and updates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.newsletterSubscription}
                    onChange={(e) => handleToggle('newsletterSubscription', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:ring-2 peer-focus:ring-emerald-400/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-emerald-500 peer-checked:to-green-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Reminder Timing */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
              Reminder Timing
            </h3>
            <div className="p-4 bg-slate-900/30 rounded-xl">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Send appointment reminders
              </label>
              <select
                value={notificationSettings.reminderTiming}
                onChange={(e) => handleTimingChange(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all duration-300"
              >
                <option value="1h">1 hour before</option>
                <option value="2h">2 hours before</option>
                <option value="4h">4 hours before</option>
                <option value="12h">12 hours before</option>
                <option value="24h">24 hours before</option>
                <option value="48h">48 hours before</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}