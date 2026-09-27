import React, { useState, useEffect } from 'react';
import { Brain, LayoutDashboard, Settings, Activity, FileCode2, Fingerprint, Menu, X } from 'lucide-react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function Layout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sessionId, setSessionId] = useState(localStorage.getItem('active_session_id') || 'SYS-IDLE');

  useEffect(() => {
    const updateSessionId = () => {
      const active = localStorage.getItem('active_session_id');
      if (active) setSessionId(active);
    };
    
    window.addEventListener('sessionUpdate', updateSessionId);
    return () => window.removeEventListener('sessionUpdate', updateSessionId);
  }, []);

  const tabs = [
    { id: 'dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { id: 'analytics', path: '/analytics', icon: <Activity size={20} />, label: 'Analytics' },
    { id: 'logs', path: '/session-logs', icon: <FileCode2 size={20} />, label: 'Session Logs' },
    { id: 'settings', path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 overflow-hidden">
      
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 md:relative flex flex-col bg-indigo-600 dark:bg-slate-900 text-white transition-transform duration-300 transform md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 flex items-center justify-between md:justify-start gap-3 mb-8 mt-2 md:mt-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Brain size={24} className="text-blue-300" />
            </div>
            <span className="font-bold text-xl tracking-wide">ALOS</span>
          </div>
          <button 
            className="md:hidden p-1 text-indigo-200 hover:text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {tabs.map(tab => {
            const isActive = location.pathname.includes(tab.path);
            return (
              <Link
                key={tab.id}
                to={tab.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 ${isActive
                  ? 'bg-white/20 text-white shadow-sm backdrop-blur-md'
                  : 'text-indigo-200 dark:text-slate-400 hover:bg-white/10 dark:hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <div className="flex items-center justify-start w-full gap-4">
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Left Session ID Indicator */}
        <div className="p-4 border-t border-indigo-500/50 dark:border-slate-800 mt-auto">
          <div className="flex items-center justify-start gap-3 text-indigo-200 dark:text-slate-500">
             <Fingerprint size={16} />
             <div className="flex flex-col">
               <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">Active Session</span>
               <span className="font-mono text-xs text-white dark:text-slate-400">{sessionId}</span>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content Container */}
      <main className="flex-1 relative overflow-y-auto bg-slate-50 dark:bg-slate-950 transition-colors flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-30">
          <button 
            className="p-2 -ml-2 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <Brain size={20} className="text-indigo-500" />
            <span className="font-bold font-mono text-slate-800 dark:text-slate-200">ALOS</span>
          </div>
          <div className="w-8"></div>
        </div>

        <div className="absolute top-4 right-4 md:top-8 md:right-8 z-50">
          <ThemeToggle />
        </div>
        
        <div className="p-4 md:p-10 max-w-7xl mx-auto h-full w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
