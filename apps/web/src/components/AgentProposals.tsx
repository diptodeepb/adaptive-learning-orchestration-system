import { Brain, Bot } from "lucide-react";

export default function AgentProposals({ proposals, loading }: { proposals?: any[], loading: boolean }) {
  if (!proposals || loading) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {proposals.map((p, i) => (
        <div key={i} className="glass rounded-2xl p-6 hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${p.agent === 'knowledge' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-fuchsia-500/10 text-fuchsia-500'}`}>
              {p.agent === 'knowledge' ? <Brain className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            <h3 className="font-bold capitalize text-lg">{p.agent} Agent</h3>
          </div>
          
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <span className="text-sm text-slate-500">Proposed Action</span>
            <span className="font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-sm">
              {p.action}
            </span>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed min-h-[80px]">
            {p.reasoning}
          </p>

          <div className="mt-4 pt-4 flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-400 uppercase">Confidence</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">{(p.confidence * 100).toFixed(0)}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}
