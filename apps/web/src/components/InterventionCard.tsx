import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function InterventionCard({ decision, status, loading }: { decision?: string, status?: string, loading: boolean }) {
  if (loading) {
    return (
      <div className="glass rounded-3xl p-8 min-h-[200px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Consulting Agents...</p>
        </div>
      </div>
    );
  }

  if (!decision) {
    return (
      <div className="glass rounded-3xl p-8 min-h-[200px] flex items-center justify-center opacity-50">
        <p className="text-slate-500 font-medium">Waiting for state data...</p>
      </div>
    );
  }

  const isDisagreement = status?.includes("DISAGREEMENT");

  return (
    <div className={`glass rounded-3xl p-8 border-l-4 ${isDisagreement ? 'border-amber-500' : 'border-emerald-500'} transition-all duration-500`}>
      <h2 className="text-sm font-bold tracking-widest uppercase text-slate-400 mb-2">Final Orchestration Decision</h2>
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            {decision}
          </h1>
        </div>
        
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${isDisagreement ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
          {isDisagreement ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {status?.replace(/_/g, ' ')}
        </div>
      </div>
    </div>
  );
}
