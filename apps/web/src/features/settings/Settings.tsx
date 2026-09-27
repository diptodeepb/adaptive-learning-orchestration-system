import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Server, Sliders, Database, BrainCircuit, ShieldAlert } from 'lucide-react';

export default function Settings() {
  const [isSaved, setIsSaved] = useState(false);
  const [config, setConfig] = useState({
    defaultStudentId: 'u63386',
    model: 'mistral/open-mistral-nemo',
    tracingEnabled: true,
    confidenceThreshold: 0.7,
    maxContextLogs: 50
  });

  useEffect(() => {
    // Load from local storage on mount
    const saved = localStorage.getItem('alo_settings');
    if (saved) {
      setConfig(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('alo_settings', JSON.stringify(config));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleChange = (key: string, value: string | boolean | number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 pb-10 max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-mono font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <SettingsIcon className="w-8 h-8 text-indigo-500" />
            System Configuration
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-mono text-sm">
            Configure orchestration settings, LLM routing, and system logging.
          </p>
        </div>
        
        <button 
          onClick={handleSave}
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg font-medium transition-all shadow-sm flex items-center gap-2 text-sm h-10"
        >
          <Save className="w-4 h-4" />
          {isSaved ? 'Saved!' : 'Save Configuration'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Pipeline & Tracing */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
             <Server className="w-4 h-4 text-blue-500" />
             System Logging
          </h2>
          
          <div className="space-y-4 font-mono text-sm">
            <div className="flex items-center justify-between">
              <label className="text-slate-700 dark:text-slate-300 font-medium">Enable Verbose Logging</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={config.tracingEnabled} onChange={(e) => handleChange('tracingEnabled', e.target.checked)} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-slate-700 dark:text-slate-300 font-medium block">Max Log Entries in Memory</label>
              <input 
                type="number" 
                value={config.maxContextLogs}
                onChange={(e) => handleChange('maxContextLogs', parseInt(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Inference Routing */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
             <BrainCircuit className="w-4 h-4 text-purple-500" />
             Inference Routing
          </h2>
          
          <div className="space-y-4 font-mono text-sm">
            <div className="space-y-2 relative">
              <label className="text-slate-700 dark:text-slate-300 font-medium block">Primary LLM Provider</label>
              <div className="relative">
                <select 
                  value={config.model}
                  onChange={(e) => handleChange('model', e.target.value)}
                  className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-200 shadow-sm transition-colors text-sm sm:text-base cursor-pointer"
                >
                  <option value="groq/llama-3.3-70b-versatile">Groq (Llama 3.3 70B)</option>
                  <option value="mistral/open-mistral-nemo">Mistral (Open-Nemo)</option>
                  <option value="openrouter/meta-llama/llama-3.1-8b-instruct:free">OpenRouter (Llama 3.1 8B Free)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 dark:text-slate-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 p-3 rounded-lg border border-purple-200 dark:border-purple-800/50 flex items-start gap-3 text-xs font-mono">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Changing providers may require restarting the backend if environment keys are missing.</span>
          </div>
        </div>

        {/* Heuristics */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 md:col-span-2">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
             <Sliders className="w-4 h-4 text-emerald-500" />
             Orchestrator Parameters
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-sm">
            <div className="space-y-2">
              <label className="text-slate-700 dark:text-slate-300 font-medium block">Default Subject ID</label>
              <div className="relative">
                <Database className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input 
                  type="text" 
                  value={config.defaultStudentId}
                  onChange={(e) => handleChange('defaultStudentId', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-slate-700 dark:text-slate-300 font-medium block flex justify-between">
                <span>Agent Confidence Threshold</span>
                <span className="text-indigo-500">{config.confidenceThreshold.toFixed(2)}</span>
              </label>
              <input 
                type="range" 
                min="0" max="1" step="0.05"
                value={config.confidenceThreshold}
                onChange={(e) => handleChange('confidenceThreshold', parseFloat(e.target.value))}
                className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                The minimum confidence score an agent needs for its proposal to be considered.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
