export default function PortalLoading() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        {/* Medical loading indicators */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
        </div>
        
        <div className="w-16 h-16 border-2 border-slate-700 border-t-cyan-400 rounded-full animate-spin mx-auto mb-6"></div>
        
        <h2 className="text-slate-200 text-xl font-semibold mb-2">
          Loading Patient Portal
        </h2>
        
        <p className="text-slate-400 text-sm">
          Accessing your secure health dashboard...
        </p>
        
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            <span>Secure Connection</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
            <span>HIPAA Compliant</span>
          </div>
        </div>
      </div>
    </div>
  )
}