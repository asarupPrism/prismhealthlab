import React from 'react';

export default function StyleGuidePage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent mb-3">
            Prism Health Lab
          </h1>
          <p className="text-xl text-slate-300 font-light tracking-wide">Medical-Grade Design System</p>
          <div className="mt-4 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        
        {/* Brand Colors */}
        <section>
          <h2 className="text-3xl font-semibold text-white mb-8 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg"></div>
            Medical Color Palette
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            
            {/* Primary Cyan */}
            <div className="backdrop-blur-sm bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-3">
              <div className="h-24 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg shadow-lg shadow-cyan-500/20"></div>
              <div>
                <h3 className="font-semibold text-white">Primary Cyan</h3>
                <p className="text-sm text-slate-300 font-mono">#06b6d4</p>
                <p className="text-sm text-slate-400">Data & Results</p>
              </div>
            </div>

            {/* Medical Blue */}
            <div className="backdrop-blur-sm bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-3">
              <div className="h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg shadow-lg shadow-blue-500/20"></div>
              <div>
                <h3 className="font-semibold text-white">Medical Blue</h3>
                <p className="text-sm text-slate-300 font-mono">#3b82f6</p>
                <p className="text-sm text-slate-400">Interactive Elements</p>
              </div>
            </div>

            {/* Health Green */}
            <div className="backdrop-blur-sm bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-3">
              <div className="h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg shadow-lg shadow-emerald-500/20"></div>
              <div>
                <h3 className="font-semibold text-white">Health Green</h3>
                <p className="text-sm text-slate-300 font-mono">#10b981</p>
                <p className="text-sm text-slate-400">Normal & Success</p>
              </div>
            </div>

            {/* Warning Amber */}
            <div className="backdrop-blur-sm bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-3">
              <div className="h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg shadow-lg shadow-amber-500/20"></div>
              <div>
                <h3 className="font-semibold text-white">Warning Amber</h3>
                <p className="text-sm text-slate-300 font-mono">#f59e0b</p>
                <p className="text-sm text-slate-400">Attention Required</p>
              </div>
            </div>

            {/* Critical Rose */}
            <div className="backdrop-blur-sm bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-3">
              <div className="h-24 bg-gradient-to-br from-rose-400 to-rose-600 rounded-lg shadow-lg shadow-rose-500/20"></div>
              <div>
                <h3 className="font-semibold text-white">Critical Rose</h3>
                <p className="text-sm text-slate-300 font-mono">#f43f5e</p>
                <p className="text-sm text-slate-400">Alerts & Errors</p>
              </div>
            </div>
          </div>

          {/* Neutral Colors */}
          <div className="mt-12">
            <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
              <div className="w-6 h-6 bg-gradient-to-br from-slate-400 to-slate-600 rounded"></div>
              Dark Theme Neutrals
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {[
                { name: 'Pure White', color: 'bg-white', hex: '#ffffff', textColor: 'text-slate-900' },
                { name: 'Slate 50', color: 'bg-slate-50', hex: '#f8fafc', textColor: 'text-slate-900' },
                { name: 'Slate 200', color: 'bg-slate-200', hex: '#e2e8f0', textColor: 'text-slate-900' },
                { name: 'Slate 400', color: 'bg-slate-400', hex: '#94a3b8', textColor: 'text-white' },
                { name: 'Slate 600', color: 'bg-slate-600', hex: '#475569', textColor: 'text-white' },
                { name: 'Slate 700', color: 'bg-slate-700', hex: '#334155', textColor: 'text-white' },
                { name: 'Slate 800', color: 'bg-slate-800', hex: '#1e293b', textColor: 'text-white' },
                { name: 'Slate 950', color: 'bg-slate-950', hex: '#020617', textColor: 'text-white' },
              ].map((color) => (
                <div key={color.name} className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-lg p-3 space-y-2">
                  <div className={`h-16 ${color.color} rounded-lg shadow-sm border border-slate-600/20`}></div>
                  <div>
                    <p className="text-xs font-medium text-white">{color.name}</p>
                    <p className="text-xs text-slate-300 font-mono">{color.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="text-3xl font-semibold text-white mb-8 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-400 to-purple-500 rounded-lg"></div>
            Medical Typography System
          </h2>
          
          {/* Medical Headings */}
          <div className="space-y-12">
            <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
              <h3 className="text-2xl font-semibold text-white mb-8 flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                Clinical Headings
              </h3>
              <div className="space-y-6">
                <div className="border-l-2 border-cyan-500/30 pl-6">
                  <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent leading-tight">
                    Diagnostic Results
                  </h1>
                  <p className="text-sm text-slate-400 mt-2 font-mono">text-6xl font-bold gradient - Primary headlines</p>
                </div>
                <div className="border-l-2 border-blue-500/30 pl-6">
                  <h2 className="text-4xl font-semibold text-white tracking-tight">Test Categories</h2>
                  <p className="text-sm text-slate-400 mt-2 font-mono">text-4xl font-semibold - Section titles</p>
                </div>
                <div className="border-l-2 border-emerald-500/30 pl-6">
                  <h3 className="text-2xl font-semibold text-slate-100">Blood Panel Results</h3>
                  <p className="text-sm text-slate-400 mt-2 font-mono">text-2xl font-semibold - Subsections</p>
                </div>
                <div className="border-l-2 border-amber-500/30 pl-6">
                  <h4 className="text-xl font-medium text-slate-200">Individual Markers</h4>
                  <p className="text-sm text-slate-400 mt-2 font-mono">text-xl font-medium - Card titles</p>
                </div>
                <div className="border-l-2 border-rose-500/30 pl-6">
                  <h5 className="text-lg font-medium text-slate-300">Reference Ranges</h5>
                  <p className="text-sm text-slate-400 mt-2 font-mono">text-lg font-medium - Small headings</p>
                </div>
              </div>
            </div>

            {/* Medical Data Text */}
            <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
              <h3 className="text-2xl font-semibold text-white mb-8 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                Clinical Body Text
              </h3>
              <div className="space-y-6">
                <div className="border-l-2 border-cyan-500/20 pl-6">
                  <p className="text-lg text-slate-100 leading-relaxed">
                    Your comprehensive metabolic panel shows optimal health markers across all tested parameters.
                  </p>
                  <p className="text-sm text-slate-400 mt-2 font-mono">text-lg - Clinical descriptions</p>
                </div>
                <div className="border-l-2 border-blue-500/20 pl-6">
                  <p className="text-base text-slate-200 leading-relaxed">
                    Regular monitoring of these biomarkers helps track your health trends over time and enables early detection of potential issues.
                  </p>
                  <p className="text-sm text-slate-400 mt-2 font-mono">text-base - Standard body text</p>
                </div>
                <div className="border-l-2 border-emerald-500/20 pl-6">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Reference ranges may vary based on age, gender, and laboratory methodology.
                  </p>
                  <p className="text-sm text-slate-400 mt-2 font-mono">text-sm - Supporting information</p>
                </div>
              </div>
            </div>

            {/* Medical Data Display */}
            <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
              <h3 className="text-2xl font-semibold text-white mb-8 flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                Medical Data Typography
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Measurement Values</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg">
                      <span className="text-slate-300">Glucose</span>
                      <span className="text-2xl font-mono font-bold text-cyan-400">95 mg/dL</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg">
                      <span className="text-slate-300">Cholesterol</span>
                      <span className="text-2xl font-mono font-bold text-emerald-400">180 mg/dL</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg">
                      <span className="text-slate-300">Blood Pressure</span>
                      <span className="text-2xl font-mono font-bold text-amber-400">120/80</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Status Indicators</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-lg">
                      <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-emerald-300 font-medium">NORMAL</span>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-lg">
                      <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
                      <span className="text-amber-300 font-medium">ELEVATED</span>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-lg">
                      <div className="w-3 h-3 bg-rose-400 rounded-full animate-pulse"></div>
                      <span className="text-rose-300 font-medium">CRITICAL</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Medical Buttons */}
        <section>
          <h2 className="text-3xl font-semibold text-white mb-8 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg"></div>
            Medical Interface Buttons
          </h2>
          <div className="space-y-12">
            
            {/* Primary Action Buttons */}
            <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                Primary Actions
              </h3>
              <div className="flex flex-wrap gap-4">
                <button className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105">
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    Order Diagnostic Test
                  </span>
                </button>
                <button className="group px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-400 hover:to-indigo-500 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded"></div>
                    </div>
                    Schedule Appointment
                  </span>
                </button>
                <button className="group px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-md hover:from-indigo-400 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-indigo-500/25 text-xs">
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-white/20 rounded-sm"></div>
                    View Results
                  </span>
                </button>
              </div>
            </div>

            {/* Secondary Glass Buttons */}
            <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                Secondary Actions
              </h3>
              <div className="flex flex-wrap gap-4">
                <button className="group px-8 py-4 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-100 font-semibold rounded-xl hover:bg-slate-600/60 hover:border-slate-500/60 transition-all duration-300 hover:scale-105">
                  Learn More About Tests
                </button>
                <button className="group px-6 py-3 backdrop-blur-sm bg-slate-700/40 border border-slate-600/40 text-slate-200 font-medium rounded-lg hover:bg-slate-600/50 transition-all duration-300 text-sm">
                  Cancel Appointment
                </button>
                <button className="group px-4 py-2 backdrop-blur-sm bg-slate-700/30 border border-slate-600/30 text-slate-300 font-medium rounded-md hover:bg-slate-600/40 transition-all duration-300 text-xs">
                  Back
                </button>
              </div>
            </div>

            {/* Medical Status Buttons */}
            <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                Medical Status Actions
              </h3>
              <div className="flex flex-wrap gap-4">
                <button className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl hover:from-emerald-400 hover:to-green-500 transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    Complete Health Assessment
                  </span>
                </button>
                <button className="group px-6 py-3 backdrop-blur-sm bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-medium rounded-lg hover:bg-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300 text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 border border-emerald-400 rounded"></div>
                    Download Results PDF
                  </span>
                </button>
                <button className="group px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-lg hover:from-amber-400 hover:to-orange-500 transition-all duration-300 shadow-lg shadow-amber-500/25 text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-0 h-0 border-l-2 border-r-2 border-b-2 border-white border-l-transparent border-r-transparent"></div>
                    Review Elevated Markers
                  </span>
                </button>
                <button className="group px-6 py-3 bg-gradient-to-r from-rose-500 to-red-600 text-white font-medium rounded-lg hover:from-rose-400 hover:to-red-500 transition-all duration-300 shadow-lg shadow-rose-500/25 text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    Critical Alert Action
                  </span>
                </button>
              </div>
            </div>

            {/* Disabled & Loading States */}
            <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                Button States
              </h3>
              <div className="flex flex-wrap gap-4">
                <button disabled className="px-8 py-4 bg-slate-700/30 border border-slate-600/30 text-slate-500 font-semibold rounded-xl cursor-not-allowed">
                  Test Unavailable
                </button>
                <button className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25">
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Results...
                  </span>
                </button>
                <button className="group px-6 py-3 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-100 font-medium rounded-lg hover:bg-slate-600/60 transition-all duration-300 text-sm focus:ring-2 focus:ring-cyan-400 focus:outline-none">
                  Focus State Example
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Medical Cards */}
        <section>
          <h2 className="text-3xl font-semibold text-white mb-8 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg"></div>
            Medical Interface Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Diagnostic Test Card */}
            <div className="group backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/60 hover:border-slate-600/60 transition-all duration-300 hover:scale-105 shadow-xl shadow-slate-900/50">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">$149</div>
                  <div className="text-xs text-slate-400">Per Test</div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Complete Blood Count</h3>
              <p className="text-slate-300 text-sm mb-6 leading-relaxed">Comprehensive analysis of blood cells, hemoglobin levels, and overall hematological health indicators.</p>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-300 text-sm font-medium">Available Today</span>
              </div>
              <button className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40">
                Add to Cart
              </button>
            </div>

            {/* Test Results Card */}
            <div className="group backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/60 hover:border-slate-600/60 transition-all duration-300 hover:scale-105 shadow-xl shadow-slate-900/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-sm font-medium rounded-full">
                    Normal Range
                  </span>
                </div>
                <span className="text-sm text-slate-400 font-mono">Dec 15, 2024</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Cholesterol Panel</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg">
                  <span className="text-slate-300">Total Cholesterol</span>
                  <span className="font-mono font-bold text-cyan-400">185 mg/dL</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg">
                  <span className="text-slate-300">HDL Cholesterol</span>
                  <span className="font-mono font-bold text-emerald-400">55 mg/dL</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg">
                  <span className="text-slate-300">LDL Cholesterol</span>
                  <span className="font-mono font-bold text-emerald-400">110 mg/dL</span>
                </div>
              </div>
              <button className="w-full px-4 py-3 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-100 font-semibold rounded-xl hover:bg-slate-600/60 hover:border-slate-500/60 transition-all duration-300">
                View Detailed Report
              </button>
            </div>

            {/* Appointment Schedule Card */}
            <div className="group backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/60 hover:border-slate-600/60 transition-all duration-300 hover:scale-105 shadow-xl shadow-slate-900/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
                  <span className="px-3 py-1 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-sm font-medium rounded-full">
                    Tomorrow
                  </span>
                </div>
                <span className="text-sm text-slate-400 font-mono">10:30 AM</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Blood Draw Appointment</h3>
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 bg-slate-900/30 p-3 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <div className="text-slate-200 font-medium">Downtown Medical Center</div>
                    <div className="text-slate-400 text-sm">123 Health Ave, Suite 200</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-900/30 p-3 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-lg"></div>
                  </div>
                  <div>
                    <div className="text-slate-200 font-medium">Phlebotomist Sarah Chen</div>
                    <div className="text-slate-400 text-sm">Certified Lab Technician</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25">
                  View Details
                </button>
                <button className="px-4 py-3 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-xl hover:bg-slate-600/60 transition-all duration-300">
                  <div className="w-4 h-4 border border-slate-300 rounded flex items-center justify-center">
                    <div className="w-2 h-2 bg-slate-300 rounded-sm"></div>
                  </div>
                </button>
              </div>
            </div>

            {/* Health Trend Card */}
            <div className="group backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/60 hover:border-slate-600/60 transition-all duration-300 hover:scale-105 shadow-xl shadow-slate-900/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Health Trends</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-emerald-300 text-sm">Improving</span>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-300">Cholesterol Trend</span>
                    <span className="text-emerald-400 text-sm">↓ 12%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-2 rounded-full" style={{width: '75%'}}></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>Last 6 months</span>
                    <span>Target: &lt;200</span>
                  </div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-300">Blood Pressure</span>
                    <span className="text-emerald-400 text-sm">Stable</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-emerald-400 to-green-400 h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                </div>
              </div>
              <button className="w-full px-4 py-3 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-100 font-semibold rounded-xl hover:bg-slate-600/60 hover:border-slate-500/60 transition-all duration-300">
                View Full Analytics
              </button>
            </div>

            {/* Critical Alert Card */}
            <div className="group backdrop-blur-sm bg-rose-900/30 border border-rose-700/50 rounded-2xl p-6 hover:bg-rose-900/40 hover:border-rose-600/60 transition-all duration-300 hover:scale-105 shadow-xl shadow-rose-900/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-rose-400 rounded-full animate-pulse"></div>
                <span className="px-3 py-1 bg-rose-500/20 border border-rose-400/30 text-rose-300 text-sm font-medium rounded-full">
                  Urgent Review
                </span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Elevated Blood Glucose</h3>
              <div className="bg-slate-900/50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Current Level</span>
                  <span className="font-mono font-bold text-rose-400 text-xl">240 mg/dL</span>
                </div>
                <div className="text-slate-400 text-sm mt-1">Normal: 70-100 mg/dL</div>
              </div>
              <p className="text-slate-300 text-sm mb-4">This result requires immediate attention. Please contact your healthcare provider.</p>
              <button className="w-full px-4 py-3 bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold rounded-xl hover:from-rose-400 hover:to-red-500 transition-all duration-300 shadow-lg shadow-rose-500/25">
                Contact Healthcare Provider
              </button>
            </div>

            {/* Lab Processing Card */}
            <div className="group backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/60 hover:border-slate-600/60 transition-all duration-300 shadow-xl shadow-slate-900/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-sm font-medium rounded-full">
                  Processing
                </span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Comprehensive Metabolic Panel</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Sample Received</span>
                  <span className="text-emerald-400">✓</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Lab Analysis</span>
                  <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Quality Review</span>
                  <span className="text-slate-500">⏳</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Results Available</span>
                  <span className="text-slate-500">⏳</span>
                </div>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
                <div className="bg-gradient-to-r from-cyan-400 to-blue-400 h-2 rounded-full transition-all duration-500" style={{width: '45%'}}></div>
              </div>
              <p className="text-slate-400 text-sm text-center">Expected completion: 2-3 business days</p>
            </div>
          </div>
        </section>

        {/* Medical Form Elements */}
        <section>
          <h2 className="text-3xl font-semibold text-white mb-8 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg"></div>
            Medical Form Interface
          </h2>
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
            <div className="max-w-2xl space-y-8">
              
              {/* Input Fields */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  Medical Input Fields
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Patient Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="patient@example.com"
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 backdrop-blur-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Medical Record Number
                    </label>
                    <input
                      type="text"
                      placeholder="MRN-123456789"
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 backdrop-blur-sm font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Select Dropdown */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Medical Dropdowns</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Diagnostic Test Category
                    </label>
                    <select className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 backdrop-blur-sm">
                      <option value="">Select test category</option>
                      <option value="blood">Blood Chemistry Panel</option>
                      <option value="hormone">Hormone Analysis</option>
                      <option value="nutrition">Nutritional Assessment</option>
                      <option value="cardiac">Cardiac Markers</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Appointment Location
                    </label>
                    <select className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 backdrop-blur-sm">
                      <option value="">Choose location</option>
                      <option value="downtown">Downtown Medical Center</option>
                      <option value="north">North Campus Lab</option>
                      <option value="south">South Medical Plaza</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Medical Checkboxes */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Medical Consent</h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="hipaa"
                      className="mt-1 w-4 h-4 text-cyan-400 bg-slate-900/50 border-slate-600/50 rounded focus:ring-cyan-400 focus:ring-2"
                    />
                    <label htmlFor="hipaa" className="text-sm text-slate-300 leading-relaxed">
                      I acknowledge receipt of the HIPAA Privacy Notice and consent to the use and disclosure of my protected health information.
                    </label>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="consent"
                      className="mt-1 w-4 h-4 text-cyan-400 bg-slate-900/50 border-slate-600/50 rounded focus:ring-cyan-400 focus:ring-2"
                    />
                    <label htmlFor="consent" className="text-sm text-slate-300 leading-relaxed">
                      I consent to laboratory testing and understand the risks and benefits of the procedures.
                    </label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="notifications"
                      className="mt-1 w-4 h-4 text-cyan-400 bg-slate-900/50 border-slate-600/50 rounded focus:ring-cyan-400 focus:ring-2"
                    />
                    <label htmlFor="notifications" className="text-sm text-slate-300 leading-relaxed">
                      Send me notifications when test results are available via secure portal.
                    </label>
                  </div>
                </div>
              </div>

              {/* Medical Radio Buttons */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Appointment Preferences</h4>
                <p className="text-sm font-medium text-slate-300 mb-4">Preferred appointment time for blood draw</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      id="early"
                      name="appointment-time"
                      className="w-4 h-4 text-cyan-400 bg-slate-900/50 border-slate-600/50 focus:ring-cyan-400 focus:ring-2"
                    />
                    <label htmlFor="early" className="text-sm text-slate-300">
                      Early Morning (7:00 AM - 9:00 AM) - Fasting tests preferred
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      id="morning"
                      name="appointment-time"
                      className="w-4 h-4 text-cyan-400 bg-slate-900/50 border-slate-600/50 focus:ring-cyan-400 focus:ring-2"
                    />
                    <label htmlFor="morning" className="text-sm text-slate-300">
                      Late Morning (9:00 AM - 12:00 PM)
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      id="afternoon"
                      name="appointment-time"
                      className="w-4 h-4 text-cyan-400 bg-slate-900/50 border-slate-600/50 focus:ring-cyan-400 focus:ring-2"
                    />
                    <label htmlFor="afternoon" className="text-sm text-slate-300">
                      Afternoon (12:00 PM - 5:00 PM)
                    </label>
                  </div>
                </div>
              </div>

              {/* Form States */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Form States</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Valid Input</label>
                    <input
                      type="text"
                      value="Valid entry"
                      className="w-full px-4 py-3 bg-slate-900/50 border border-emerald-500/50 text-white rounded-xl focus:ring-2 focus:ring-emerald-400"
                      readOnly
                    />
                    <p className="text-emerald-400 text-xs mt-1">✓ Input validated successfully</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Error Input</label>
                    <input
                      type="text"
                      value="Invalid entry"
                      className="w-full px-4 py-3 bg-slate-900/50 border border-rose-500/50 text-white rounded-xl focus:ring-2 focus:ring-rose-400"
                      readOnly
                    />
                    <p className="text-rose-400 text-xs mt-1">✗ This field is required</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Medical Spacing & Layout */}
        <section>
          <h2 className="text-3xl font-semibold text-white mb-8 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg"></div>
            Medical Spacing & Layout System
          </h2>
          <div className="space-y-12">
            
            {/* Spacing Scale */}
            <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                Medical Spacing Scale
              </h3>
              <div className="space-y-4">
                {[
                  { size: '4px', class: 'w-1', label: '1 (4px)', usage: 'Micro spacing' },
                  { size: '8px', class: 'w-2', label: '2 (8px)', usage: 'Small gaps' },
                  { size: '12px', class: 'w-3', label: '3 (12px)', usage: 'Form elements' },
                  { size: '16px', class: 'w-4', label: '4 (16px)', usage: 'Standard spacing' },
                  { size: '24px', class: 'w-6', label: '6 (24px)', usage: 'Component spacing' },
                  { size: '32px', class: 'w-8', label: '8 (32px)', usage: 'Section breaks' },
                  { size: '48px', class: 'w-12', label: '12 (48px)', usage: 'Major sections' },
                  { size: '64px', class: 'w-16', label: '16 (64px)', usage: 'Page sections' },
                ].map((space) => (
                  <div key={space.label} className="flex items-center gap-6 bg-slate-900/30 p-4 rounded-lg">
                    <div className={`${space.class} h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded shadow-sm`}></div>
                    <div className="flex-1">
                      <span className="text-sm font-mono text-white font-medium">{space.label}</span>
                      <span className="text-slate-400 text-sm ml-4">{space.usage}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Medical Border Radius */}
            <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                Medical Border Radius
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {[
                  { class: 'rounded-none', name: 'None', usage: 'Sharp edges' },
                  { class: 'rounded-sm', name: 'Small', usage: 'Subtle rounding' },
                  { class: 'rounded-md', name: 'Medium', usage: 'Forms & inputs' },
                  { class: 'rounded-lg', name: 'Large', usage: 'Cards & buttons' },
                  { class: 'rounded-xl', name: 'Extra Large', usage: 'Major components' },
                  { class: 'rounded-full', name: 'Full', usage: 'Indicators & avatars' },
                ].map((radius) => (
                  <div key={radius.name} className="text-center bg-slate-900/30 p-4 rounded-lg">
                    <div className={`w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 ${radius.class} mb-3 mx-auto shadow-lg shadow-cyan-500/20`}></div>
                    <p className="text-sm font-medium text-white">{radius.name}</p>
                    <p className="text-xs text-slate-400 mt-1">{radius.usage}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Medical Layout Grid */}
            <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                Medical Layout Patterns
              </h3>
              <div className="space-y-8">
                
                {/* Dashboard Grid */}
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">Patient Dashboard Grid</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({length: 4}).map((_, i) => (
                      <div key={i} className="h-20 bg-slate-700/50 border border-slate-600/50 rounded-lg flex items-center justify-center">
                        <span className="text-slate-300 text-sm">Card {i + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Results Layout */}
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">Test Results Layout</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <div className="h-32 bg-slate-700/50 border border-slate-600/50 rounded-lg flex items-center justify-center">
                        <span className="text-slate-300 text-sm">Main Results Panel</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="h-14 bg-slate-700/50 border border-slate-600/50 rounded-lg flex items-center justify-center">
                        <span className="text-slate-300 text-sm">Reference</span>
                      </div>
                      <div className="h-14 bg-slate-700/50 border border-slate-600/50 rounded-lg flex items-center justify-center">
                        <span className="text-slate-300 text-sm">History</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Layout */}
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">Medical Form Layout</h4>
                  <div className="max-w-2xl">
                    <div className="space-y-4">
                      <div className="h-12 bg-slate-700/50 border border-slate-600/50 rounded-lg flex items-center px-4">
                        <span className="text-slate-300 text-sm">Patient Information</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="h-12 bg-slate-700/50 border border-slate-600/50 rounded-lg flex items-center px-4">
                          <span className="text-slate-300 text-sm">First Name</span>
                        </div>
                        <div className="h-12 bg-slate-700/50 border border-slate-600/50 rounded-lg flex items-center px-4">
                          <span className="text-slate-300 text-sm">Last Name</span>
                        </div>
                      </div>
                      <div className="h-12 bg-slate-700/50 border border-slate-600/50 rounded-lg flex items-center px-4">
                        <span className="text-slate-300 text-sm">Medical Record Number</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Medical Iconography */}
        <section>
          <h2 className="text-3xl font-semibold text-white mb-8 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg"></div>
            Medical Iconography System
          </h2>
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-xl p-8">
            <div className="space-y-12">
              
              {/* Status Indicators */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  Medical Status Indicators
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { name: 'Normal', color: 'bg-emerald-400', description: 'Within normal range' },
                    { name: 'Elevated', color: 'bg-amber-400', description: 'Above normal range' },
                    { name: 'Critical', color: 'bg-rose-400', description: 'Requires attention' },
                    { name: 'Processing', color: 'bg-cyan-400', description: 'Analysis in progress' },
                  ].map((status) => (
                    <div key={status.name} className="text-center bg-slate-900/30 p-4 rounded-lg">
                      <div className={`w-4 h-4 ${status.color} rounded-full mx-auto mb-3 animate-pulse`}></div>
                      <p className="text-sm font-medium text-white">{status.name}</p>
                      <p className="text-xs text-slate-400 mt-1">{status.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medical Symbols */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  Medical Interface Symbols
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
                  {[
                    { symbol: '+', name: 'Add Test', color: 'from-cyan-400 to-blue-500' },
                    { symbol: '✓', name: 'Completed', color: 'from-emerald-400 to-green-500' },
                    { symbol: '!', name: 'Alert', color: 'from-amber-400 to-orange-500' },
                    { symbol: '?', name: 'Help', color: 'from-blue-400 to-indigo-500' },
                    { symbol: '↓', name: 'Download', color: 'from-slate-400 to-slate-600' },
                    { symbol: '→', name: 'Next', color: 'from-purple-400 to-pink-500' },
                  ].map((item) => (
                    <div key={item.name} className="text-center bg-slate-900/30 p-4 rounded-lg">
                      <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center text-white font-bold text-xl mb-3 mx-auto shadow-lg`}>
                        {item.symbol}
                      </div>
                      <p className="text-xs font-medium text-white">{item.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Indicators */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                  Progress & Loading States
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  
                  {/* Spinner */}
                  <div className="text-center bg-slate-900/30 p-6 rounded-lg">
                    <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm font-medium text-white">Loading Spinner</p>
                    <p className="text-xs text-slate-400 mt-1">Processing results</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="text-center bg-slate-900/30 p-6 rounded-lg">
                    <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
                      <div className="bg-gradient-to-r from-cyan-400 to-blue-400 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                    </div>
                    <p className="text-sm font-medium text-white">Progress Bar</p>
                    <p className="text-xs text-slate-400 mt-1">60% complete</p>
                  </div>

                  {/* Pulse Indicator */}
                  <div className="text-center bg-slate-900/30 p-6 rounded-lg">
                    <div className="relative mx-auto w-8 h-8 mb-4">
                      <div className="w-8 h-8 bg-emerald-400 rounded-full animate-ping absolute"></div>
                      <div className="w-8 h-8 bg-emerald-400 rounded-full"></div>
                    </div>
                    <p className="text-sm font-medium text-white">Live Indicator</p>
                    <p className="text-xs text-slate-400 mt-1">Real-time updates</p>
                  </div>
                </div>
              </div>

              {/* Badge System */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                  Medical Badge System
                </h3>
                <div className="flex flex-wrap gap-4">
                  <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-sm font-medium rounded-full">
                    Normal Range
                  </span>
                  <span className="px-3 py-1 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-sm font-medium rounded-full">
                    Elevated
                  </span>
                  <span className="px-3 py-1 bg-rose-500/20 border border-rose-400/30 text-rose-300 text-sm font-medium rounded-full">
                    Critical
                  </span>
                  <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-sm font-medium rounded-full">
                    Processing
                  </span>
                  <span className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-medium rounded-full">
                    Scheduled
                  </span>
                  <span className="px-3 py-1 bg-purple-500/20 border border-purple-400/30 text-purple-300 text-sm font-medium rounded-full">
                    Urgent
                  </span>
                </div>
              </div>

              {/* Navigation Elements */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  Navigation Elements
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Back', symbol: '←', color: 'slate' },
                    { label: 'Forward', symbol: '→', color: 'cyan' },
                    { label: 'Up', symbol: '↑', color: 'emerald' },
                    { label: 'Down', symbol: '↓', color: 'amber' },
                  ].map((nav) => (
                    <button key={nav.label} className={`flex items-center justify-center gap-2 px-4 py-3 backdrop-blur-sm bg-${nav.color}-500/20 border border-${nav.color}-400/30 text-${nav.color}-300 rounded-lg hover:bg-${nav.color}-500/30 transition-all duration-300`}>
                      <span className="text-lg">{nav.symbol}</span>
                      <span className="text-sm font-medium">{nav.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-16 border-t border-slate-700/50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
            <p className="text-slate-300 font-medium">
              Prism Health Lab Medical Design System
            </p>
            <p className="text-slate-500 text-sm mt-2">
              Version 2.0 • Medical-Grade Interface • Last updated July 2025
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
}