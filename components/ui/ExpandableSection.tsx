'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type SectionStatus = 'pending' | 'in_progress' | 'completed' | 'error'

interface ExpandableSectionProps {
  id: string
  title: string
  subtitle?: string
  status: SectionStatus
  isExpanded: boolean
  isDisabled?: boolean
  completedSummary?: React.ReactNode
  children: React.ReactNode
  onToggle: (id: string) => void
  onEdit?: (id: string) => void
  className?: string
  priority?: 'high' | 'medium' | 'low'
}

const statusConfig = {
  pending: {
    color: 'bg-slate-500',
    borderColor: 'border-slate-600/50',
    glowColor: 'shadow-slate-500/10',
    textColor: 'text-slate-400',
    icon: '⏳'
  },
  in_progress: {
    color: 'bg-cyan-400',
    borderColor: 'border-cyan-400/50',
    glowColor: 'shadow-cyan-500/25',
    textColor: 'text-cyan-300',
    icon: '⚡'
  },
  completed: {
    color: 'bg-emerald-400',
    borderColor: 'border-emerald-400/50',
    glowColor: 'shadow-emerald-500/25',
    textColor: 'text-emerald-300',
    icon: '✓'
  },
  error: {
    color: 'bg-rose-400',
    borderColor: 'border-rose-400/50',
    glowColor: 'shadow-rose-500/25',
    textColor: 'text-rose-300',
    icon: '!'
  }
}

export default function ExpandableSection({
  id,
  title,
  subtitle,
  status,
  isExpanded,
  isDisabled = false,
  completedSummary,
  children,
  onToggle,
  onEdit,
  className = '',
  priority = 'medium'
}: ExpandableSectionProps) {
  const [contentHeight, setContentHeight] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)
  const config = statusConfig[status]

  useEffect(() => {
    if (contentRef.current && isExpanded) {
      // Small delay to allow content to render fully
      const timeoutId = setTimeout(() => {
        if (contentRef.current) {
          setContentHeight(contentRef.current.scrollHeight)
        }
      }, 50)
      
      return () => clearTimeout(timeoutId)
    }
  }, [children, isExpanded])

  // Additional effect to handle dynamic content changes
  useEffect(() => {
    if (!isExpanded || !contentRef.current) return

    const resizeObserver = new ResizeObserver(() => {
      if (contentRef.current) {
        setContentHeight(contentRef.current.scrollHeight)
      }
    })

    resizeObserver.observe(contentRef.current)
    
    return () => resizeObserver.disconnect()
  }, [isExpanded])

  const handleToggle = () => {
    // Prevent toggling if section is completed (must use Edit button instead)
    if (!isDisabled && status !== 'completed') {
      onToggle(id)
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(id)
    }
  }

  const priorityStyles = {
    high: 'bg-slate-800/60 border-slate-600/60',
    medium: 'bg-slate-800/40 border-slate-700/50',
    low: 'bg-slate-800/30 border-slate-700/40'
  }

  return (
    <motion.div
      id={id}
      className={`backdrop-blur-sm ${priorityStyles[priority]} border rounded-2xl shadow-xl ${config.glowColor} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Section Header */}
      <div
        className={`p-6 cursor-pointer select-none transition-all duration-300 ${
          isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-700/30'
        }`}
        onClick={handleToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Status Indicator */}
            <div className="relative">
              <div
                className={`w-8 h-8 ${config.color} rounded-xl flex items-center justify-center shadow-lg ${config.glowColor} transition-all duration-300`}
              >
                <div className="w-4 h-4 bg-white/20 rounded-lg flex items-center justify-center">
                  <div 
                    className={`w-2 h-2 bg-white rounded-full ${
                      status === 'in_progress' ? 'animate-pulse' : ''
                    }`}
                  ></div>
                </div>
              </div>
              {/* Priority Ring */}
              {priority === 'high' && (
                <div className="absolute -inset-1 border-2 border-amber-400/40 rounded-xl animate-pulse"></div>
              )}
            </div>

            {/* Title and Status */}
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold text-white leading-tight">
                  {title}
                </h3>
                <span className={`px-3 py-1 ${config.color}/20 border ${config.borderColor} ${config.textColor} text-sm font-medium rounded-full`}>
                  {status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              {subtitle && (
                <p className="text-slate-400 text-sm mt-1">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Edit Button for Completed Sections */}
            {status === 'completed' && onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleEdit()
                }}
                className="px-3 py-1.5 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-600/60 hover:border-slate-500/60 transition-all duration-300"
              >
                Edit
              </button>
            )}

            {/* Expand/Collapse Indicator */}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="text-slate-400"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <div className="w-0 h-0 border-l-2 border-r-2 border-b-2 border-slate-400 border-l-transparent border-r-transparent"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Completed Summary */}
      {status === 'completed' && !isExpanded && completedSummary && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="px-6 pb-6"
        >
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
            {completedSummary}
          </div>
        </motion.div>
      )}

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: contentHeight > 0 ? contentHeight : 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ 
              height: { duration: 0.5, ease: "easeInOut" },
              opacity: { duration: 0.3, delay: isExpanded ? 0.1 : 0 }
            }}
            className="overflow-hidden"
            style={{ minHeight: isExpanded ? '400px' : undefined }}
          >
            <div ref={contentRef} className="px-6 pb-6">
              <div className="border-t border-slate-700/30 pt-6">
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}