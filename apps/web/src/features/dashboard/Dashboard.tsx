import React, { useState } from 'react';
import { BookOpen, Target, Brain, Loader2, Database, Code, ShieldAlert, Cpu } from 'lucide-react';

export default function Dashboard() {
  const [subjectId, setSubjectId] = useState(() => localStorage.getItem('dash_subject_id') || 'u63386');
  const [learnerState, setLearnerState] = useState<any>(() => {
    const saved = localStorage.getItem('dash_learner_state');
    return saved ? JSON.parse(saved) : null;
  });
  const [decisionData, setDecisionData] = useState<any>(() => {
    const saved = localStorage.getItem('dash_decision_data');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    localStorage.setItem('dash_subject_id', subjectId);
  }, [subjectId]);

  React.useEffect(() => {
    if (learnerState) localStorage.setItem('dash_learner_state', JSON.stringify(learnerState));
    else localStorage.removeItem('dash_learner_state');
  }, [learnerState]);

  React.useEffect(() => {
    if (decisionData) localStorage.setItem('dash_decision_data', JSON.stringify(decisionData));
    else localStorage.removeItem('dash_decision_data');
  }, [decisionData]);

  const runSimulation = async (overrideId?: string) => {
    setLoading(true);
    setError('');
    setDecisionData(null);
    setLearnerState(null);

    const targetId = overrideId || subjectId;
    const settingsStr = localStorage.getItem('alo_settings');
    const settings = settingsStr ? JSON.parse(settingsStr) : null;
    const selectedModel = settings?.model || 'mistral/open-mistral-nemo';

    try {
      // 1. Fetch real student state from EDNet database
      const stateRes = await fetch(`http://localhost:8000/api/v1/learner/${targetId}/state`);
      if (!stateRes.ok) throw new Error('Failed to fetch student state from Database');
      const state = await stateRes.json();
      setLearnerState(state);

      // 2. Fetch Orchestrator Decision
      const decisionRes = await fetch('http://localhost:8000/api/v1/decisions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-LLM-Model': selectedModel
        },
        body: JSON.stringify(state)
      });
      if (!decisionRes.ok) throw new Error('Orchestrator pipeline failed');
      const data = await decisionRes.json();
      setDecisionData(data);

      if (data.session_id) {
        localStorage.setItem('active_session_id', data.session_id);
        window.dispatchEvent(new Event('sessionUpdate'));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRandomize = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/v1/learner/random');
      if (res.ok) {
        const data = await res.json();
        setSubjectId(data.subject_id);
        await runSimulation(data.subject_id);
      } else {
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">

      {/* Research Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
        <div className="flex-1 min-w-0 pr-4">
          <h1 className="text-3xl font-mono font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Brain className="w-8 h-8 text-indigo-500" />
            Orchestration Diagnostics
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-mono text-sm">
            Real-time evaluation of the pedagogical multi-agent pipeline using EDNet student telemetry.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white dark:bg-slate-900 p-3 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm w-full md:w-auto shrink-0">
          <div className="flex items-center justify-center sm:justify-start gap-2 px-2 shrink-0">
            <Database size={16} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-500 uppercase">Student ID</span>
          </div>
          <input
            type="text"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono w-full sm:w-28 focus:outline-none focus:ring-2 focus:ring-indigo-500 shrink-0"
          />
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRandomize}
              disabled={loading}
              className={`text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition ${loading ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              title="Load random EDNet subject"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5" /><path d="M4 20L21 3" /><path d="M21 16v5h-5" /><path d="M15 15l6 6" /><path d="M4 4l5 5" /></svg>
            </button>
            <button
              onClick={() => runSimulation()}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 px-4 rounded-lg font-medium transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm whitespace-nowrap"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <Brain className="w-4 h-4 shrink-0" />}
              Run Orchestrator
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800/50 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span className="font-mono text-sm">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Learner State Telemetry */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <Target className="w-4 h-4 text-blue-500" />
            Subject State Profile
          </h2>

          {learnerState ? (
            <div className="flex-1 flex flex-col gap-4 font-mono text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="text-slate-500 dark:text-slate-400 text-xs uppercase mb-1">Mastery Score</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{learnerState.mastery.toFixed(2)}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="text-slate-500 dark:text-slate-400 text-xs uppercase mb-1">Uncertainty</div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{learnerState.uncertainty.toFixed(2)}</div>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="text-slate-500 dark:text-slate-400 text-xs uppercase mb-1">Current Concept Node</div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span className="font-bold text-slate-700 dark:text-slate-300">{learnerState.concept_id}</span>
                </div>
              </div>
              <div className="flex-1 bg-slate-900 rounded-lg p-4 overflow-x-auto border border-slate-700">
                <pre className="text-green-400 text-xs">
                  {JSON.stringify(learnerState, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 py-12">
              <Database className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm font-mono">Waiting for subject data...</p>
            </div>
          )}
        </div>

        {/* Orchestrator Output */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <Brain className="w-4 h-4 text-indigo-500" />
            Orchestrator Output
          </h2>

          {decisionData ? (
            <div className="space-y-4 font-mono text-sm">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 p-4 rounded-xl">
                <div className="text-indigo-600 dark:text-indigo-400 text-xs uppercase font-bold mb-2">Final Orchestrator Decision</div>
                <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{decisionData.decision}</div>
              </div>

              <div className="space-y-3">
                <div className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold">Agent Proposals</div>
                {decisionData.proposals.map((p: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-slate-700 dark:text-slate-300 uppercase">[{p.agent}]</span>
                      <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-400">Conf: {p.confidence}</span>
                    </div>
                    <div className="text-slate-800 dark:text-slate-200 font-bold mb-1">Action: {p.action}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{p.reasoning}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 py-12">
              <Code className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm font-mono">Pipeline idle. Run the orchestrator to see agent outputs.</p>
            </div>
          )}
        </div>
      </div>

      {/* System Execution Telemetry Panel */}
      {decisionData && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <Cpu className="w-4 h-4 text-emerald-500" />
            Execution Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-sm">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-slate-500 dark:text-slate-400 text-xs uppercase mb-1">LLM Inference Engine</div>
              <div className="font-bold text-slate-800 dark:text-slate-200 break-words">{localStorage.getItem('alo_settings') ? JSON.parse(localStorage.getItem('alo_settings') as string).model || 'mistral/open-mistral-nemo' : 'mistral/open-mistral-nemo'}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-slate-500 dark:text-slate-400 text-xs uppercase mb-1">Session Trace ID</div>
              <div className="font-bold text-emerald-600 dark:text-emerald-400">{decisionData.session_id || 'SYS-IDLE'}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-slate-500 dark:text-slate-400 text-xs uppercase mb-1">Execution Status</div>
              <div className="font-bold text-blue-600 dark:text-blue-400 uppercase">{decisionData.validation_status || 'PASSED'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
