export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        {/* Medical loading indicators */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
        </div>
        
        <div className="w-12 h-12 border-2 border-slate-700 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
        
        <p className="text-slate-300 text-lg font-medium">
          Loading your health dashboard...
        </p>
        
        <p className="text-slate-500 text-sm mt-2">
          Preparing your personalized experience
        </p>
      </div>
    </div>
  )
}