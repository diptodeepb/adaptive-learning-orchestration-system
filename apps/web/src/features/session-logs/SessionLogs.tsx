import React, { useState, useEffect } from 'react';
import { Database, Fingerprint, Terminal, ChevronLeft, ChevronRight } from 'lucide-react';

interface LogEntry {
  time: string;
  tag: string;
  type: string;
  text: string;
  session_id: string;
}

const SessionLogs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(localStorage.getItem('active_session_id') || 'SYS-IDLE');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const fetchLogs = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/logs');
      if (res.ok) {
        const data = await res.json();
        // Reverse to show newest first, or keep chronological. We'll reverse for a standard log view.
        setLogs(data.reverse());
      }
    } catch (e) {
      console.error("Failed to fetch logs", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    
    const handleSessionUpdate = () => {
      setSessionId(localStorage.getItem('active_session_id') || 'SYS-IDLE');
      fetchLogs();
    };
    
    window.addEventListener('sessionUpdate', handleSessionUpdate);
    // Poll every 3 seconds for new logs just in case
    const interval = setInterval(fetchLogs, 3000);
    
    return () => {
      window.removeEventListener('sessionUpdate', handleSessionUpdate);
      clearInterval(interval);
    };
  }, []);

  // Pagination Logic
  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLogs = logs.slice(startIndex, startIndex + itemsPerPage);

  const getTagColor = (tag: string) => {
    if (tag.includes('AGENT')) return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/50';
    if (tag === 'SYSTEM') return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    if (tag === 'ROUTER') return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50';
    if (tag === 'ORCHESTRATOR') return 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/50';
    if (tag === 'VALIDATION') return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50';
    if (tag === 'DIAGNOSTICS') return 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800/50';
    if (tag === 'ERROR') return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50';
    return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-mono font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Database className="w-8 h-8 text-indigo-500" />
            Orchestrator Logs
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-mono text-sm">
            Live system events and orchestrator decision logs.
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="flex items-center gap-2 px-2">
            <Fingerprint className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Trace ID</span>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
            {sessionId}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold font-mono">
                <th className="p-4 whitespace-nowrap">Time</th>
                <th className="p-4">Module</th>
                <th className="p-4 w-full">Event Message</th>
                <th className="p-4 whitespace-nowrap">Trace ID</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm divide-y divide-slate-100 dark:divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    Loading logs...
                  </td>
                </tr>
              ) : currentLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                      <Terminal className="w-10 h-10 mb-3 opacity-20" />
                      <p>No logs available. Waiting for system execution.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="p-4 text-slate-500 dark:text-slate-400 whitespace-nowrap align-top">
                      {log.time}
                    </td>
                    <td className="p-4 align-top">
                      <span className={`px-2 py-1 rounded text-xs font-bold border ${getTagColor(log.tag)} whitespace-nowrap inline-block`}>
                        {log.tag}
                      </span>
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300 align-top">
                      {log.text}
                    </td>
                    <td className="p-4 align-top">
                      <span className="text-xs text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded bg-slate-50 dark:bg-slate-800 whitespace-nowrap">
                        {log.session_id}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {!loading && logs.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-sm">
            <div className="text-slate-500 dark:text-slate-400">
              Showing <span className="font-bold text-slate-700 dark:text-slate-200">{startIndex + 1}</span> to <span className="font-bold text-slate-700 dark:text-slate-200">{Math.min(startIndex + itemsPerPage, logs.length)}</span> of <span className="font-bold text-slate-700 dark:text-slate-200">{logs.length}</span> entries
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="px-4 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200">
                {currentPage} / {totalPages || 1}
              </div>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionLogs;
