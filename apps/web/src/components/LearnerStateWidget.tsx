export default function LearnerStateWidget({ data }: { data: any }) {
  const mastery = data?.mastery ?? 0;
  const uncertainty = data?.uncertainty ?? 0;

  return (
    <div className="glass rounded-3xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
      
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        Current Learner State
      </h2>

      <div className="space-y-6 relative z-10">
        <div>
          <div className="flex justify-between mb-2 text-sm font-medium">
            <span className="text-slate-500 dark:text-slate-400">Concept Mastery</span>
            <span className="text-blue-600 dark:text-blue-400">{(mastery * 100).toFixed(0)}%</span>
          </div>
          <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-1000 ease-out"
              style={{ width: `${mastery * 100}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2 text-sm font-medium">
            <span className="text-slate-500 dark:text-slate-400">System Uncertainty</span>
            <span className="text-amber-600 dark:text-amber-400">{(uncertainty * 100).toFixed(0)}%</span>
          </div>
          <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-1000 ease-out"
              style={{ width: `${uncertainty * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
