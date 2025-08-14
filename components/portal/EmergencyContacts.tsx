'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

interface EmergencyContact {
  id?: string
  name: string
  relationship: string
  phone: string
  email: string
}

interface EmergencyContactsProps {
  userId: string
}

export default function EmergencyContacts({ userId }: EmergencyContactsProps) {
  const [contacts, setContacts] = useState<EmergencyContact[]>([])
  const [isAddingContact, setIsAddingContact] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingContact, setEditingContact] = useState<string | null>(null)
  
  const [newContact, setNewContact] = useState<EmergencyContact>({
    name: '',
    relationship: '',
    phone: '',
    email: ''
  })

  useEffect(() => {
    loadContacts()
  }, [userId])

  const loadContacts = async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (data) {
        setContacts(data)
      }
    } catch (err) {
      console.error('Error loading emergency contacts:', err)
    }
  }

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone) {
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('emergency_contacts')
        .insert({
          user_id: userId,
          name: newContact.name,
          relationship: newContact.relationship,
          phone: newContact.phone,
          email: newContact.email
        })

      if (error) throw error

      await loadContacts()
      setNewContact({ name: '', relationship: '', phone: '', email: '' })
      setIsAddingContact(false)
    } catch (err) {
      console.error('Error adding contact:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateContact = async (contact: EmergencyContact) => {
    if (!contact.id) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('emergency_contacts')
        .update({
          name: contact.name,
          relationship: contact.relationship,
          phone: contact.phone,
          email: contact.email
        })
        .eq('id', contact.id)

      if (error) throw error

      await loadContacts()
      setEditingContact(null)
    } catch (err) {
      console.error('Error updating contact:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to remove this emergency contact?')) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', contactId)

      if (error) throw error

      await loadContacts()
    } catch (err) {
      console.error('Error deleting contact:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl shadow-lg shadow-slate-900/30"
    >
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white">Emergency Contacts</h2>
          </div>
          
          {!isAddingContact && (
            <button
              onClick={() => setIsAddingContact(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-xl hover:from-amber-400 hover:to-orange-500 transition-all duration-300 shadow-lg shadow-amber-500/25"
            >
              Add Contact
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence>
          {isAddingContact && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-slate-900/30 rounded-xl"
            >
              <h3 className="text-white font-medium mb-4">Add Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all duration-300"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Relationship
                  </label>
                  <select
                    value={newContact.relationship}
                    onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all duration-300"
                  >
                    <option value="">Select Relationship</option>
                    <option value="spouse">Spouse</option>
                    <option value="parent">Parent</option>
                    <option value="child">Child</option>
                    <option value="sibling">Sibling</option>
                    <option value="friend">Friend</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all duration-300"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all duration-300"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 mt-6">
                <button
                  onClick={() => {
                    setIsAddingContact(false)
                    setNewContact({ name: '', relationship: '', phone: '', email: '' })
                  }}
                  className="px-6 py-3 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-300 font-medium rounded-xl hover:bg-slate-600/60 transition-all duration-300"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleAddContact}
                  disabled={isLoading || !newContact.name || !newContact.phone}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-xl hover:from-amber-400 hover:to-orange-500 transition-all duration-300 shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Adding...' : 'Add Contact'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {contacts.length > 0 ? (
          <div className="space-y-4">
            {contacts.map((contact) => (
              <div key={contact.id} className="p-4 bg-slate-900/30 rounded-xl">
                {editingContact === contact.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => setContacts(contacts.map(c => 
                          c.id === contact.id ? { ...c, name: e.target.value } : c
                        ))}
                        className="px-3 py-2 bg-slate-900/50 border border-slate-600/50 text-white rounded-lg"
                        placeholder="Name"
                      />
                      <input
                        type="text"
                        value={contact.relationship}
                        onChange={(e) => setContacts(contacts.map(c => 
                          c.id === contact.id ? { ...c, relationship: e.target.value } : c
                        ))}
                        className="px-3 py-2 bg-slate-900/50 border border-slate-600/50 text-white rounded-lg"
                        placeholder="Relationship"
                      />
                      <input
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => setContacts(contacts.map(c => 
                          c.id === contact.id ? { ...c, phone: e.target.value } : c
                        ))}
                        className="px-3 py-2 bg-slate-900/50 border border-slate-600/50 text-white rounded-lg"
                        placeholder="Phone"
                      />
                      <input
                        type="email"
                        value={contact.email}
                        onChange={(e) => setContacts(contacts.map(c => 
                          c.id === contact.id ? { ...c, email: e.target.value } : c
                        ))}
                        className="px-3 py-2 bg-slate-900/50 border border-slate-600/50 text-white rounded-lg"
                        placeholder="Email"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateContact(contact)}
                        disabled={isLoading}
                        className="px-4 py-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-medium rounded-lg hover:bg-emerald-500/30 transition-all duration-300"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingContact(null)
                          loadContacts()
                        }}
                        className="px-4 py-2 bg-slate-700/50 border border-slate-600/50 text-slate-300 font-medium rounded-lg hover:bg-slate-600/60 transition-all duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{contact.name}</p>
                      <div className="flex items-center gap-4 mt-1">
                        {contact.relationship && (
                          <span className="text-amber-400 text-sm">{contact.relationship}</span>
                        )}
                        <span className="text-slate-400 text-sm">{contact.phone}</span>
                        {contact.email && (
                          <span className="text-slate-400 text-sm">{contact.email}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingContact(contact.id!)}
                        className="px-3 py-1.5 bg-slate-700/50 border border-slate-600/50 text-slate-300 font-medium rounded-lg hover:bg-slate-600/60 transition-all duration-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteContact(contact.id!)}
                        disabled={isLoading}
                        className="px-3 py-1.5 bg-rose-500/20 border border-rose-400/30 text-rose-300 font-medium rounded-lg hover:bg-rose-500/30 transition-all duration-300"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-slate-600 rounded-xl flex items-center justify-center">
                <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
              </div>
            </div>
            <p className="text-slate-400 mb-4">No emergency contacts added yet</p>
            <p className="text-slate-500 text-sm">Add contacts who can be reached in case of emergency</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}