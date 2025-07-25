'use client'

import React from 'react'
import { motion } from 'framer-motion'

export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'error'

interface Step {
  id: string
  title: string
  subtitle?: string
  status: StepStatus
  icon?: string
}

interface ProgressTrackerProps {
  steps: Step[]
  currentStepId: string
  className?: string
  orientation?: 'horizontal' | 'vertical'
  showLabels?: boolean
  compact?: boolean
}

const statusConfig = {
  pending: {
    color: 'bg-slate-600',
    borderColor: 'border-slate-500/50',
    textColor: 'text-slate-400',
    glowColor: 'shadow-slate-500/10'
  },
  in_progress: {
    color: 'bg-gradient-to-br from-cyan-400 to-blue-500',
    borderColor: 'border-cyan-400/50',
    textColor: 'text-cyan-300',
    glowColor: 'shadow-cyan-500/25'
  },
  completed: {
    color: 'bg-gradient-to-br from-emerald-400 to-green-500',
    borderColor: 'border-emerald-400/50',
    textColor: 'text-emerald-300',
    glowColor: 'shadow-emerald-500/25'
  },
  error: {
    color: 'bg-gradient-to-br from-rose-400 to-red-500',
    borderColor: 'border-rose-400/50',
    textColor: 'text-rose-300',
    glowColor: 'shadow-rose-500/25'
  }
}

export default function ProgressTracker({
  steps,
  currentStepId,
  className = '',
  showLabels = true,
  compact = false
}: ProgressTrackerProps) {
  const completedSteps = steps.filter(step => step.status === 'completed').length
  const totalSteps = steps.length
  const progressPercentage = (completedSteps / totalSteps) * 100

  return (
    <div className={`${className}`}>
      {/* Compact Progress Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            Checkout Progress
          </h2>
          <span className="text-xs font-mono text-slate-400">
            {completedSteps} of {totalSteps}
          </span>
        </div>
        
        {/* Overall Progress Bar */}
        <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-cyan-400 to-blue-500 h-1.5 rounded-full shadow-lg shadow-cyan-500/25"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Steps - Evenly Spaced Grid */}
      <div className="grid grid-cols-3 gap-4">
        {steps.map((step, index) => {
          const config = statusConfig[step.status]
          const isCurrentStep = step.id === currentStepId

          return (
            <div key={step.id} className="flex flex-col items-center text-center">
              {/* Step Node */}
              <div className="relative mb-2">
                <motion.div
                  className={`w-8 h-8 ${config.color} rounded-lg flex items-center justify-center shadow-md ${config.glowColor} transition-all duration-300 ${
                    isCurrentStep ? 'ring-2 ring-cyan-400/50 ring-offset-1 ring-offset-slate-950' : ''
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                    {step.status === 'completed' ? (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    ) : step.status === 'in_progress' ? (
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    ) : step.status === 'error' ? (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    ) : (
                      <div className="w-2 h-2 border border-white rounded-sm"></div>
                    )}
                  </div>
                </motion.div>

                {/* Step Number */}
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-slate-800 border border-slate-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-300">{index + 1}</span>
                </div>

                {/* Pulse for Current Step */}
                {isCurrentStep && (
                  <motion.div
                    className="absolute inset-0 bg-cyan-400/20 rounded-lg"
                    animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
              </div>

              {/* Step Labels */}
              {showLabels && (
                <div className="w-full">
                  <h4 className={`font-medium ${config.textColor} text-xs leading-tight mb-1`}>
                    {step.title}
                  </h4>
                  {step.subtitle && (
                    <p className="text-slate-500 text-xs leading-tight">
                      {step.subtitle}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Additional Progress Info */}
      {!compact && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400 mb-1">{completedSteps}</div>
            <div className="text-sm text-slate-400">Completed</div>
          </div>
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400 mb-1">
              {steps.filter(s => s.status === 'in_progress').length}
            </div>
            <div className="text-sm text-slate-400">In Progress</div>
          </div>
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-slate-400 mb-1">
              {steps.filter(s => s.status === 'pending').length}
            </div>
            <div className="text-sm text-slate-400">Remaining</div>
          </div>
        </div>
      )}
    </div>
  )
}