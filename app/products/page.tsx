import React from 'react';

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          
          {/* Hero Content */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent mb-6 leading-tight">
              Diagnostic Testing Panels
            </h1>
            <p className="text-xl text-slate-300 font-light tracking-wide max-w-3xl mx-auto">
              Comprehensive health insights through precision diagnostic testing. 
              Optimize your wellness with our curated panels designed for modern healthcare needs.
            </p>
          </div>
          
          {/* Quality Facets Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-xl p-8 hover:bg-slate-800/60 hover:border-slate-600/60 transition-all duration-300 hover:scale-105 shadow-xl shadow-slate-900/50 text-center animate-slide-in-left">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/25 mx-auto mb-6">
                <span className="text-white font-bold text-2xl">✓</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">High-Quality Labs</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                CLIA-certified and CAP-accredited partner laboratories ensure accurate, reliable results you can trust for critical health decisions.
              </p>
            </div>
            
            <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-xl p-8 hover:bg-slate-800/60 hover:border-slate-600/60 transition-all duration-300 hover:scale-105 shadow-xl shadow-slate-900/50 text-center animate-slide-in-left" style={{animationDelay: '0.3s'}}>
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/25 mx-auto mb-6">
                <span className="text-white font-bold text-2xl">→</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">2-3 Day Results</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Fast turnaround times deliver comprehensive results to your secure patient portal, enabling quick health insights and decision-making.
              </p>
            </div>
            
            <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-xl p-8 hover:bg-slate-800/60 hover:border-slate-600/60 transition-all duration-300 hover:scale-105 shadow-xl shadow-slate-900/50 text-center animate-slide-in-left" style={{animationDelay: '0.6s'}}>
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/25 mx-auto mb-6">
                <span className="text-white font-bold text-2xl">$</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Competitive Pricing</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Save 50-70% compared to traditional lab services while maintaining the same quality standards and comprehensive testing coverage.
              </p>
            </div>
          </div>
          
          <div className="mt-16 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        
        {/* Main Diagnostic Panels */}
        <section className="mb-20">
          <h2 className="text-3xl font-semibold text-white mb-12 text-center flex items-center justify-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg"></div>
            Diagnostic Testing Panels
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Muscle & Performance Panel */}
            <div className="group backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/60 hover:border-slate-600/60 transition-all duration-300 hover:scale-105 shadow-xl shadow-slate-900/50">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white font-mono">$125-175</div>
                  <div className="text-xs text-slate-400">Retail Price</div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Muscle & Performance Panel</h3>
              <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                Optimize muscle growth, hormone balance, and recovery tracking for fitness enthusiasts and athletes.
              </p>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-200 mb-3">Tests Included:</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Testosterone (Total + Free)</span>
                    <span className="font-mono">$15.00</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>DHEA Sulfate Level</span>
                    <span className="font-mono">$3.00</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Estradiol</span>
                    <span className="font-mono">$2.50</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Comprehensive Metabolic Panel</span>
                    <span className="font-mono">$1.45</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Creatine Kinase (CPK)</span>
                    <span className="font-mono">$9.25</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Vitamin D 25-OH</span>
                    <span className="font-mono">$7.00</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Lipid Panel</span>
                    <span className="font-mono">$1.00</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-300 text-sm font-medium">Perfect for Athletes</span>
              </div>
              
              <button className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl hover:from-emerald-400 hover:to-green-500 transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40">
                Order Panel
              </button>
            </div>

            {/* Longevity & Wellness Panel */}
            <div className="group backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/60 hover:border-slate-600/60 transition-all duration-300 hover:scale-105 shadow-xl shadow-slate-900/50">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white font-mono">$99-149</div>
                  <div className="text-xs text-slate-400">Retail Price</div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Longevity & Wellness Panel</h3>
              <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                Early detection of chronic disease markers, metabolic optimization, and inflammation monitoring.
              </p>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-200 mb-3">Tests Included:</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Hemoglobin A1C</span>
                    <span className="font-mono">$1.55</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Comprehensive Metabolic Panel</span>
                    <span className="font-mono">$1.45</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>C-Reactive Protein (HS)</span>
                    <span className="font-mono">$2.00</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Lipid Panel</span>
                    <span className="font-mono">$1.00</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Ferritin / Iron / TIBC</span>
                    <span className="font-mono">$4.70</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Vitamin B12 / Folate</span>
                    <span className="font-mono">$3.75</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Vitamin D 25-OH</span>
                    <span className="font-mono">$7.00</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>TSH</span>
                    <span className="font-mono">$1.50</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-cyan-300 text-sm font-medium">Preventive Care Focus</span>
              </div>
              
              <button className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40">
                Order Panel
              </button>
            </div>

            {/* Routine Self-Care Panel */}
            <div className="group backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/60 hover:border-slate-600/60 transition-all duration-300 hover:scale-105 shadow-xl shadow-slate-900/50">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-sm"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white font-mono">$75-99</div>
                  <div className="text-xs text-slate-400">Retail Price</div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Routine Self-Care Panel</h3>
              <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                General baseline health check-up focused on identifying nutritional and metabolic deficiencies.
              </p>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-200 mb-3">Tests Included:</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Comprehensive Metabolic Panel</span>
                    <span className="font-mono">$1.45</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Complete Blood Count w/Diff</span>
                    <span className="font-mono">$1.10</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Vitamin D 25-OH</span>
                    <span className="font-mono">$7.00</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Vitamin B12</span>
                    <span className="font-mono">$1.75</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Magnesium Level</span>
                    <span className="font-mono">$1.00</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Lipid Panel</span>
                    <span className="font-mono">$1.00</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>TSH</span>
                    <span className="font-mono">$1.50</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Uric Acid</span>
                    <span className="font-mono">$1.00</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                <span className="text-amber-300 text-sm font-medium">Best Value Option</span>
              </div>
              
              <button className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-400 hover:to-orange-500 transition-all duration-300 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40">
                Order Panel
              </button>
            </div>

            {/* Male Hormone Panel */}
            <div className="group backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/60 hover:border-slate-600/60 transition-all duration-300 hover:scale-105 shadow-xl shadow-slate-900/50">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-lg"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white font-mono">$99-125</div>
                  <div className="text-xs text-slate-400">Retail Price</div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Male Hormone Optimization</h3>
              <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                Comprehensive male hormone assessment with safety monitoring for testosterone optimization.
              </p>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-200 mb-3">Tests Included:</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Testosterone (Total + Free)</span>
                    <span className="font-mono">$15.00</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Estradiol</span>
                    <span className="font-mono">$2.50</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>PSA Total</span>
                    <span className="font-mono">$3.50</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Comprehensive Metabolic Panel</span>
                    <span className="font-mono">$1.45</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Lipid Panel</span>
                    <span className="font-mono">$1.00</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>CBC w/Diff</span>
                    <span className="font-mono">$1.10</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-blue-300 text-sm font-medium">Male Health Focus</span>
              </div>
              
              <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-400 hover:to-indigo-500 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40">
                Order Panel
              </button>
            </div>

            {/* Female Hormone Panel */}
            <div className="group backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/60 hover:border-slate-600/60 transition-all duration-300 hover:scale-105 shadow-xl shadow-slate-900/50">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/25">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white font-mono">$75-99</div>
                  <div className="text-xs text-slate-400">Retail Price</div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Female Hormone Optimization</h3>
              <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                Comprehensive female hormone assessment for reproductive health and hormonal balance monitoring.
              </p>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-200 mb-3">Tests Included:</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Estradiol</span>
                    <span className="font-mono">$2.50</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Progesterone</span>
                    <span className="font-mono">$2.00</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>FSH</span>
                    <span className="font-mono">$1.50</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>LH</span>
                    <span className="font-mono">$1.50</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Comprehensive Metabolic Panel</span>
                    <span className="font-mono">$1.45</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>CBC w/Diff</span>
                    <span className="font-mono">$1.10</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>TSH</span>
                    <span className="font-mono">$1.50</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 bg-rose-400 rounded-full animate-pulse"></div>
                <span className="text-rose-300 text-sm font-medium">Female Health Focus</span>
              </div>
              
              <button className="w-full px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold rounded-xl hover:from-rose-400 hover:to-pink-500 transition-all duration-300 shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40">
                Order Panel
              </button>
            </div>

            {/* General Hormone Panel */}
            <div className="group backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/60 hover:border-slate-600/60 transition-all duration-300 hover:scale-105 shadow-xl shadow-slate-900/50">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white font-mono">$89-119</div>
                  <div className="text-xs text-slate-400">Retail Price</div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">General Hormone Panel</h3>
              <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                Gender-neutral hormone tracking for comprehensive hormonal health monitoring and stress assessment.
              </p>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-200 mb-3">Tests Included:</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Testosterone Total</span>
                    <span className="font-mono">$2.25</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Estradiol</span>
                    <span className="font-mono">$2.50</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>DHEA Sulfate Level</span>
                    <span className="font-mono">$3.00</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>TSH</span>
                    <span className="font-mono">$1.50</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Progesterone</span>
                    <span className="font-mono">$2.00</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Vitamin D 25-OH</span>
                    <span className="font-mono">$7.00</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-purple-300 text-sm font-medium">Gender-Neutral Option</span>
              </div>
              
              <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold rounded-xl hover:from-purple-400 hover:to-violet-500 transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40">
                Order Panel
              </button>
            </div>

          </div>
        </section>

        {/* Sexual Health Add-On Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-semibold text-white mb-12 text-center flex items-center justify-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg"></div>
            Optional Add-On Services
          </h2>
          
          <div className="max-w-2xl mx-auto">
            <div className="group backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/60 hover:border-slate-600/60 transition-all duration-300 hover:scale-105 shadow-xl shadow-slate-900/50">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/25">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white font-mono">$75-99</div>
                  <div className="text-xs text-slate-400">Retail Price</div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Sexual Health & Safety Panel</h3>
              <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                Comprehensive sexual health screening for safety and preventive care. Available as standalone service or bundle add-on.
              </p>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-200 mb-3">Tests Included:</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>HIV 1/2 Ag/Ab Screen</span>
                    <span className="font-mono">$4.50</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Syphilis (RPR)</span>
                    <span className="font-mono">$4.00</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Chlamydia/Gonorrhea PCR</span>
                    <span className="font-mono">$10.50</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Hepatitis Panel (A,B,C)</span>
                    <span className="font-mono">$20.00</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                <span className="text-teal-300 text-sm font-medium">Confidential Testing</span>
              </div>
              
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold rounded-xl hover:from-teal-400 hover:to-cyan-500 transition-all duration-300 shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40">
                  Order Standalone
                </button>
                <button className="flex-1 px-4 py-3 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-100 font-semibold rounded-xl hover:bg-slate-600/60 hover:border-slate-500/60 transition-all duration-300">
                  Add to Bundle
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Value Proposition Section */}
        <section className="mb-20">
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-2xl p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-semibold text-white mb-4 flex items-center justify-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg"></div>
                Why Choose Prism Health Lab
              </h2>
              <p className="text-slate-300 text-lg max-w-3xl mx-auto">
                Access high-quality diagnostic testing at competitive prices with our streamlined, direct-to-consumer approach.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/25">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Competitive Pricing</h3>
                <p className="text-slate-400 text-sm">
                  Save 50-70% compared to traditional lab services while maintaining the same quality standards.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-lg"></div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">High-Quality Labs</h3>
                <p className="text-slate-400 text-sm">
                  Partner laboratories are CLIA-certified and CAP-accredited for accurate, reliable results.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/25">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-sm"></div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Fast Results</h3>
                <p className="text-slate-400 text-sm">
                  Receive comprehensive results within 2-3 business days through our secure patient portal.
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl">
                <div className="text-sm text-slate-300">
                  <span className="text-slate-400">Traditional Labs:</span>
                  <span className="text-rose-400 font-mono ml-2">$200-400</span>
                </div>
                <div className="w-8 h-px bg-gradient-to-r from-slate-600 to-slate-600"></div>
                <div className="text-sm text-slate-300">
                  <span className="text-slate-400">Prism Health Lab:</span>
                  <span className="text-emerald-400 font-mono ml-2">$75-175</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="text-center">
          <div className="backdrop-blur-sm bg-gradient-to-r from-slate-800/50 via-slate-700/50 to-slate-800/50 border border-slate-700/50 rounded-2xl p-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent mb-4">
              Ready to Optimize Your Health?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Take control of your wellness journey with comprehensive diagnostic testing designed for modern healthcare needs.
            </p>
            
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="flex items-center gap-2 text-slate-400">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-sm">Physician Reviewed</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-sm">HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                <span className="text-sm">Secure Portal</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105">
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  Browse All Panels
                </span>
              </button>
              <button className="px-8 py-4 backdrop-blur-sm bg-slate-700/50 border border-slate-600/50 text-slate-100 font-semibold rounded-xl hover:bg-slate-600/60 hover:border-slate-500/60 transition-all duration-300 hover:scale-105">
                Learn More
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}