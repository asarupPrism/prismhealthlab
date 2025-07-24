'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Step {
  id: string
  title: string
  description?: string
  component: React.ReactNode
  isValid?: boolean
  isRequired?: boolean
}

interface MultiStepFormProps {
  steps: Step[]
  onStepChange?: (currentStep: number, stepData: Step) => void
  onComplete?: (allData: Record<string, unknown>) => void
  className?: string
  allowSkipSteps?: boolean
  showProgressBar?: boolean
  showStepNumbers?: boolean
}

export default function MultiStepForm({
  steps,
  onStepChange,
  onComplete,
  className = '',
  allowSkipSteps = false,
  showProgressBar = true,
  showStepNumbers = true
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [stepData, setStepData] = useState<Record<string, unknown>>({})

  const isStepValid = (stepIndex: number): boolean => {
    const step = steps[stepIndex]
    if (!step) return false
    
    // If step has explicit validation
    if (typeof step.isValid === 'boolean') {
      return step.isValid
    }
    
    // If step is not required, it's considered valid
    if (!step.isRequired) {
      return true
    }
    
    // Default: check if step data exists
    return Boolean(stepData[step.id])
  }

  const canProceedToNext = (): boolean => {
    if (allowSkipSteps) return true
    return isStepValid(currentStep)
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1 && canProceedToNext()) {
      const newStep = currentStep + 1
      setCurrentStep(newStep)
      setCompletedSteps(prev => new Set([...prev, currentStep]))
      onStepChange?.(newStep, steps[newStep])
    } else if (currentStep === steps.length - 1 && canProceedToNext()) {
      // Complete the form
      setCompletedSteps(prev => new Set([...prev, currentStep]))
      onComplete?.(stepData)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1
      setCurrentStep(newStep)
      onStepChange?.(newStep, steps[newStep])
    }
  }

  const handleStepClick = (stepIndex: number) => {
    if (allowSkipSteps || stepIndex <= Math.max(...completedSteps) + 1) {
      setCurrentStep(stepIndex)
      onStepChange?.(stepIndex, steps[stepIndex])
    }
  }

  const updateStepData = (stepId: string, data: unknown) => {
    setStepData(prev => ({
      ...prev,
      [stepId]: data
    }))
  }

  useEffect(() => {
    if (steps.length > 0) {
      onStepChange?.(currentStep, steps[currentStep])
    }
  }, [])

  const progressPercentage = ((currentStep + 1) / steps.length) * 100

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Progress Header */}
      <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8 mb-8">
        {/* Progress Bar */}
        {showProgressBar && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-slate-300">
                Progress
              </span>
              <span className="text-sm font-mono text-cyan-400">
                {currentStep + 1} of {steps.length}
              </span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full shadow-lg shadow-cyan-500/25"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
          </div>
        )}

        {/* Step Indicators */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = index === currentStep
            const isCompleted = completedSteps.has(index)
            const isAccessible = allowSkipSteps || index <= Math.max(...completedSteps) + 1

            return (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={!isAccessible}
                  className={`relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 scale-110'
                      : isCompleted
                      ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25'
                      : isAccessible
                      ? 'backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:bg-slate-600/60 hover:border-slate-500/60'
                      : 'bg-slate-800/30 border border-slate-700/30 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isCompleted ? (
                    <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  ) : showStepNumbers ? (
                    <span className="font-semibold">{index + 1}</span>
                  ) : (
                    <div className="w-3 h-3 bg-current rounded-full"></div>
                  )}
                </button>

                {/* Step Label */}
                <div className="ml-4 flex-1 min-w-0">
                  <h3 className={`text-sm font-semibold truncate ${
                    isActive ? 'text-white' : isCompleted ? 'text-emerald-300' : 'text-slate-400'
                  }`}>
                    {step.title}
                  </h3>
                  {step.description && (
                    <p className={`text-xs truncate mt-1 ${
                      isActive ? 'text-slate-200' : 'text-slate-500'
                    }`}>
                      {step.description}
                    </p>
                  )}
                </div>

                {/* Connector */}
                {index < steps.length - 1 && (
                  <div className="mx-4 flex-shrink-0">
                    <div className={`w-8 h-px transition-colors duration-300 ${
                      completedSteps.has(index) 
                        ? 'bg-gradient-to-r from-emerald-400 to-cyan-400' 
                        : 'bg-slate-600/50'
                    }`} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl shadow-xl shadow-slate-900/50">
        <div className="p-8">
          {/* Current Step Header */}
          <div className="mb-8 pb-6 border-b border-slate-700/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-semibold text-white">
                {steps[currentStep]?.title}
              </h2>
            </div>
            {steps[currentStep]?.description && (
              <p className="text-slate-300 leading-relaxed">
                {steps[currentStep].description}
              </p>
            )}
          </div>

          {/* Step Component */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[300px]"
            >
              {React.cloneElement(steps[currentStep]?.component as React.ReactElement, {
                onData: (data: unknown) => updateStepData(steps[currentStep].id, data),
                data: stepData[steps[currentStep]?.id]
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Footer */}
        <div className="px-8 py-6 bg-slate-900/30 border-t border-slate-700/30 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="group px-6 py-3 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-200 font-medium rounded-xl hover:bg-slate-600/60 hover:border-slate-500/60 transition-all duration-300"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">←</span>
                    Previous
                  </span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Validation Status */}
              {!canProceedToNext() && steps[currentStep]?.isRequired && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                  <span className="text-amber-300 text-sm">
                    Please complete this step
                  </span>
                </div>
              )}

              {/* Next/Complete Button */}
              <button
                onClick={handleNext}
                disabled={!canProceedToNext()}
                className={`group px-8 py-3 font-semibold rounded-xl transition-all duration-300 ${
                  canProceedToNext()
                    ? currentStep === steps.length - 1
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105'
                    : 'bg-slate-700/30 border border-slate-600/30 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span className="flex items-center gap-2">
                  {currentStep === steps.length - 1 ? (
                    <>
                      <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      Complete
                    </>
                  ) : (
                    <>
                      Next
                      <span className="text-lg">→</span>
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Export utility types for consumers
export type { Step }